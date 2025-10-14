from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import PackageSerializer, PurchaseCreateSerializer, PurchaseSerializer
from .models import Package, Purchase, CashbackBonus
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class PackageListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        packages = Package.objects.all()
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data)

class PackagePurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            result = serializer.save()
            purchase = Purchase.objects.get(id=result['purchase_id'])
            package = purchase.package
            user = request.user
            is_upgrade = result['is_upgrade']
            is_premium_upgrade = result['is_premium_upgrade']
            previous_rate = result['previous_rate']
            bonus_amount = result.get('bonus_amount', 0)

            # Determine email template based on purchase type
            try:
                if is_premium_upgrade:
                    template = 'emails/premium_upgrade.html'
                    subject = 'Premium Upgrade Achieved!'
                elif is_upgrade:
                    template = 'emails/package_upgrade.html'
                    subject = 'Upgrade Successful!'
                else:
                    template = 'emails/purchase_confirmation.html'
                    subject = 'Welcome to Your New Package!'

                context = {
                    'user': user,
                    'package': package,
                    'price': package.price,
                    'expiry_date': purchase.expiry_date,
                    'previous_rate': previous_rate,
                    'bonus_amount': bonus_amount,
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string(template, context)
                send_mail(
                    subject=subject,
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send purchase email to {user.email}: {str(e)}")

            return Response(
                {
                    'message': result['message'],
                    'purchase_id': result['purchase_id'],
                    'bonus_amount': str(bonus_amount),
                    'is_upgrade': is_upgrade,
                    'is_premium_upgrade': is_premium_upgrade,
                    'previous_rate': previous_rate
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPurchasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        purchases = Purchase.objects.filter(user=request.user).order_by('-purchase_date')
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)

class CashbackClaimView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        active_purchase = Purchase.objects.filter(user=user, status='ACTIVE').first()
        if not active_purchase:
            return Response({'error': 'No active package'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            bonus = active_purchase.cashback_bonus
            if bonus.claimed:
                return Response({'error': 'Bonus already claimed'}, status=status.HTTP_400_BAD_REQUEST)
        except CashbackBonus.DoesNotExist:
            return Response({'error': 'No bonus available'}, status=status.HTTP_400_BAD_REQUEST)
        
        from decimal import Decimal
        from wallet.models import Wallet, Transaction
        from django.db import transaction
        from rest_framework.serializers import ValidationError
        
        with transaction.atomic():
            price = bonus.claim_cost
            user_wallet = Wallet.objects.get(user=user)
            
            if user.is_marketer:
                if user_wallet.views_earnings_balance >= price:
                    user_wallet.views_earnings_balance -= price
                else:
                    from_earnings = user_wallet.views_earnings_balance
                    from_deposit = price - from_earnings
                    if user_wallet.deposit_balance < from_deposit:
                        raise ValidationError("Insufficient balance (views earnings + deposit).")
                    user_wallet.views_earnings_balance = Decimal('0')
                    user_wallet.deposit_balance -= from_deposit
            else:
                if user_wallet.deposit_balance < price:
                    raise ValidationError("Insufficient deposit balance. Non-marketers must use deposit balance.")
                user_wallet.deposit_balance -= price
            
            user_wallet.views_earnings_balance += bonus.amount
            user_wallet.save()
            
            Transaction.objects.create(
                user=user,
                amount=-price,
                transaction_type='CLAIM_FEE',
                description='Cashback claim fee'
            )
            Transaction.objects.create(
                user=user,
                amount=bonus.amount,
                transaction_type='CASHBACK',
                description='Cashback bonus received'
            )
            
            bonus.claimed = True
            bonus.claim_date = timezone.now()
            bonus.save()
        
        # Send email
        try:
            template = 'emails/cashback_claim.html'
            subject = 'Cashback Bonus Claimed!'
            context = {
                'user': user,
                'bonus_amount': bonus.amount,
                'package': active_purchase.package,
                'site_url': settings.SITE_URL,
            }
            message = render_to_string(template, context)
            send_mail(
                subject=subject,
                message='',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=message,
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send cashback claim email to {user.email}: {str(e)}")
        
        return Response({'message': 'Successfully withdrawn your cashback bonus'}, status=status.HTTP_200_OK)
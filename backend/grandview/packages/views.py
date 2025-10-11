from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import PackageSerializer, PurchaseCreateSerializer, PurchaseSerializer
from .models import Package, Purchase
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
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
            result = serializer.save()  # result now includes 'message', 'purchase_id', 'is_upgrade', 'is_premium_upgrade', 'previous_rate'
            purchase = Purchase.objects.get(id=result['purchase_id'])
            package = purchase.package
            user = request.user
            is_upgrade = result['is_upgrade']
            is_premium_upgrade = result['is_premium_upgrade']
            previous_rate = result['previous_rate']

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
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string(template, context)
                send_mail(
                    subject=subject,
                    message='',  # Plain text fallback
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send purchase email to {user.email}: {str(e)}")

            return Response(
                {'message': result['message'], 'purchase_id': result['purchase_id']},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPurchasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        purchases = Purchase.objects.filter(user=request.user).order_by('-purchase_date')
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)
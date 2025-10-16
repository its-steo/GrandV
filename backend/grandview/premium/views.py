from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .serializers import AgentVerificationPackageSerializer, AgentPurchaseSerializer, AgentPurchaseCreateSerializer, WeeklyBonusSerializer, CashbackBonusSerializer
from .models import AgentVerificationPackage, AgentPurchase, WeeklyBonus, CashbackBonus
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class AgentVerificationPackageListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        packages = AgentVerificationPackage.objects.all()
        serializer = AgentVerificationPackageSerializer(packages, many=True)
        return Response(serializer.data)

class AgentPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AgentPurchaseCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            result = serializer.save()
            purchase = AgentPurchase.objects.get(id=result['purchase_id'])
            try:
                context = {
                    'user': request.user,
                    'package': purchase.package,
                    'price': purchase.package.price,
                    'expiry_date': purchase.expiry_date,
                    'bonus_amount': result['bonus_amount'],
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string('emails/agent_purchase.html', context)
                send_mail(
                    subject='Agent Verification Package Purchased!',
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[request.user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send agent purchase email to {request.user.email}: {str(e)}")
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserAgentPurchasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        purchases = AgentPurchase.objects.filter(user=request.user).order_by('-purchase_date')
        serializer = AgentPurchaseSerializer(purchases, many=True)
        return Response(serializer.data)

class UserCashbackBonusesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bonuses = CashbackBonus.objects.filter(user=request.user, claimed=False).order_by('-id')
        serializer = CashbackBonusSerializer(bonuses, many=True)
        return Response(serializer.data)

class UserWeeklyBonusesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bonuses = WeeklyBonus.objects.filter(user=request.user, claimed=False).order_by('-created_at')
        serializer = WeeklyBonusSerializer(bonuses, many=True)
        return Response(serializer.data)
    
class CashbackClaimView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bonus_id = request.data.get('bonus_id')
        if not bonus_id:
            return Response({"error": "Bonus ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        bonus = CashbackBonus.objects.filter(id=bonus_id, user=request.user, claimed=False).first()
        if not bonus:
            return Response({"error": "Invalid or already claimed bonus"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = CashbackBonusSerializer(bonus, data={}, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": f"Successfully claimed cashback bonus of {bonus.amount}"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WeeklyBonusClaimView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bonus_id = request.data.get('bonus_id')
        if not bonus_id:
            return Response({"error": "Bonus ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        bonus = WeeklyBonus.objects.filter(id=bonus_id, user=request.user, claimed=False).first()
        if not bonus:
            return Response({"error": "Invalid or already claimed bonus"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = WeeklyBonusSerializer(bonus, data={}, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": f"Successfully claimed weekly bonus of {bonus.amount}"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

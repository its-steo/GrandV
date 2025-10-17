from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, LoginSerializer, UserUpdateSerializer, PasswordChangeSerializer, VerifyEmailSerializer
from .models import CustomUser
from wallet.models import Transaction
from django.utils import timezone
from django.db.models import Sum
from decimal import Decimal
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from django.template.loader import render_to_string
from django.conf import settings
import random
from datetime import timedelta

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)

            # Prepare and send welcome email
            try:
                subject = 'Welcome to Grandview!'
                context = {
                    'user': user,
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string('emails/welcome_email.html', context)
                send_mail(
                    subject=subject,
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=message,
                    fail_silently=False,
                )
                # Send OTP email
                subject = 'Verify Your Grandview Account'
                context = {
                    'user': user,
                    'otp': user.email_verification_code,
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string('emails/otp_email.html', context)
                send_mail(
                    subject=subject,
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send email: {str(e)}")

            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'phone_number': str(user.phone_number),
                    'referral_code': user.referral_code,
                    'is_email_verified': user.is_email_verified
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'phone_number': str(user.phone_number),
                        'referral_code': user.referral_code,
                        'is_email_verified': user.is_email_verified
                    }
                })
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'phone_number': str(user.phone_number),
                    'referral_code': user.referral_code,
                    'is_email_verified': user.is_email_verified
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReferralStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        total_referrals = user.referrals.count()
        current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        active_referrals = user.referrals.filter(purchases__expiry_date__gt=timezone.now()).distinct().count()
        total_commission = Transaction.objects.filter(
            user=user,
            transaction_type='COMMISSION'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        this_month_commission = Transaction.objects.filter(
            user=user,
            transaction_type='COMMISSION',
            created_at__gte=current_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        return Response({
            'total_referrals': total_referrals,
            'active_referrals': active_referrals,
            'total_commission': str(total_commission),
            'this_month_commission': str(this_month_commission)
        })

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            Token.objects.filter(user=user).delete()
            new_token = Token.objects.create(user=user)
            return Response({
                'message': 'Password changed successfully',
                'new_token': new_token.key
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.data.get('resend'):
            user = request.user
            if user.is_email_verified:
                return Response({'error': 'Email is already verified'}, status=status.HTTP_400_BAD_REQUEST)
            otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            user.email_verification_code = otp
            user.email_verification_expiry = timezone.now() + timedelta(minutes=30)
            user.save()
            # Send OTP email
            try:
                subject = 'Verify Your Grandview Account'
                context = {
                    'user': user,
                    'otp': otp,
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string('emails/otp_email.html', context)
                send_mail(
                    subject=subject,
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=message,
                    fail_silently=False,
                )
                return Response({'message': 'Verification code resent'}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Failed to send OTP email: {str(e)}")
                return Response({'error': 'Failed to resend code'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            serializer = VerifyEmailSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                user = request.user
                user.is_email_verified = True
                user.email_verification_code = None
                user.email_verification_expiry = None
                user.save()
                return Response({
                    'message': 'Email verified successfully',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'phone_number': str(user.phone_number),
                        'referral_code': user.referral_code,
                        'is_email_verified': user.is_email_verified
                    }
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
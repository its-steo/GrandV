# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import UnsupportedMediaType, ParseError, ValidationError
from django.http import HttpResponseRedirect  # Changed from HttpResponse
from django.http import StreamingHttpResponse
from django.db import transaction
from .models import Advert, Submission
from packages.models import Package, Purchase
from wallet.models import Wallet, Transaction
from .serializers import AdvertSerializer, SubmissionSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
import logging
from django.db.models import Sum
import time
from django.conf import settings
import boto3
import os
from django.core.mail import send_mail  # Added for email
from django.template.loader import render_to_string  # Added for template rendering
from .serializers import TransactionSerializer 
from premium.models import AgentPurchase

logger = logging.getLogger(__name__)

class AdvertListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        adverts = Advert.objects.all()
        serializer = AdvertSerializer(adverts, many=True, context={'request': request})
        data = serializer.data

        user_package = None
        if request.user.is_authenticated:
            active_purchases = Purchase.objects.filter(
                user=request.user,
                expiry_date__gt=timezone.now()
            ).order_by('-purchase_date')
            if active_purchases.exists():
                purchase = active_purchases.first()
                user_package = {
                    'name': purchase.package.name,
                    'rate_per_view': purchase.package.rate_per_view,
                    'expiry_date': purchase.expiry_date.isoformat(),
                    'days_remaining': (purchase.expiry_date - timezone.now()).days,
                }

        return Response({'adverts': data, 'user_package': user_package})

class AdvertDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        advert = get_object_or_404(Advert, pk=pk)
        file_key = advert.file.name  # e.g., 'adverts/filename.pdf'
        logger.info(f"Attempting to download advert {pk} with file_key: {file_key}")

        # Initialize s3_client
        try:
            logger.debug(f"Initializing S3 client with bucket: {settings.AWS_STORAGE_BUCKET_NAME}, region: {settings.AWS_S3_REGION_NAME}")
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            return Response({"error": f"Failed to initialize S3 client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Retrieve file from S3
        try:
            logger.debug(f"Fetching file from S3: Bucket={settings.AWS_STORAGE_BUCKET_NAME}, Key={file_key}")
            response = s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=file_key
            )
            file_name = os.path.basename(file_key)
            logger.info(f"Successfully fetched file: {file_name}")
            response = StreamingHttpResponse(
                response['Body'],
                content_type=response['ContentType']
            )
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response
        except s3_client.exceptions.NoSuchKey:
            logger.error(f"File not found in S3: Bucket={settings.AWS_STORAGE_BUCKET_NAME}, Key={file_key}")
            return Response({"error": "File not found in S3"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to download file for advert {pk}: {str(e)}")
            return Response({"error": f"Failed to download file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class SubmissionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @transaction.atomic
    def post(self, request):
        try:
            logger.info(f"Submission request content-type: {request.content_type}")
            logger.debug(f"Parsed data: {dict(request.data)}")
            logger.debug(f"FILES keys: {list(request.FILES.keys())}")

            advert_id_raw = request.data.get('advert_id', None)
            views_count_str = request.data.get('views_count', None)  # Fixed typo from 'reques...' in the truncated code
            screenshot = request.FILES.get('screenshot', None)

            try:
                advert_id = int(advert_id_raw)
                logger.debug(f"Parsed advert_id: {advert_id}")
            except ValueError:
                logger.warning(f"Invalid advert_id value: {repr(advert_id_raw)}")
                return Response({"error": "advert_id must be a valid integer"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                views_count = int(views_count_str)
                if views_count < 1:
                    return Response({"error": "views_count must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
                logger.debug(f"Parsed views_count: {views_count}")
            except ValueError:
                return Response({"error": "views_count must be a valid integer"}, status=status.HTTP_400_BAD_REQUEST)

            advert = get_object_or_404(Advert, pk=advert_id)

            # Check if user has active package with matching rate
            active_purchases = Purchase.objects.filter(
                user=request.user,
                package__rate_per_view=advert.rate_category,
                expiry_date__gt=timezone.now()
            )
            if not active_purchases.exists():
                return Response({"error": "No active package for this rate category"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if already submitted today
            today = timezone.now().date()
            if Submission.objects.filter(
                user=request.user,
                advert=advert,
                submission_date__date=today
            ).exists():
                return Response({"error": "Already submitted for this advert today"}, status=status.HTTP_400_BAD_REQUEST)

            if not screenshot:
                logger.warning("No screenshot file provided")
                return Response({"error": "Screenshot is required"}, status=status.HTTP_400_BAD_REQUEST)

            if screenshot.size > 5 * 1024 * 1024:  # 5MB limit
                return Response({"error": "Screenshot file too large (max 5MB)"}, status=status.HTTP_400_BAD_REQUEST)

            earnings = Decimal(views_count) * Decimal(advert.rate_category)

            submission = Submission.objects.create(
                user=request.user,
                advert=advert,
                views_count=views_count,
                screenshot=screenshot,
                earnings=earnings
            )

            wallet = Wallet.objects.get(user=request.user)
            wallet.views_earnings_balance += earnings
            wallet.save()

            Transaction.objects.create(
                user=request.user,
                amount=earnings,
                transaction_type='EARNING',
                description=f'Earned KSH {earnings} from {views_count} views of "{advert.title}"'
            )

            time.sleep(2)

            # Prepare and send earning notification email
            try:
                subject = 'Congratulations on Your Earnings!'
                context = {
                    'user': request.user,
                    'advert_title': advert.title,
                    'earnings': earnings,
                    'views_count': views_count,
                }
                message = render_to_string('emails/earning_notification.html', context)
                send_mail(
                    subject=subject,
                    message='',  # Plain text fallback (empty since HTML is primary)
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[request.user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send earning notification email to {request.user.email}: {str(e)}")

            serializer = SubmissionSerializer(submission)
            logger.info(f"Submission created successfully: ID={submission.id}, earnings={earnings}")
            return Response({'submission': serializer.data}, status=status.HTTP_201_CREATED)
        except UnsupportedMediaType as e:
            logger.warning(f"Media type error: {str(e)}")
            return Response({"error": "Invalid request format. Use multipart/form-data for file uploads."}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
        except ParseError as e:
            logger.warning(f"Parse error: {str(e)}")
            return Response({"error": "Invalid request format. Ensure multipart/form-data is used for file uploads."}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return Response({"error": str(e.detail if hasattr(e, 'detail') else e)}, status=status.HTTP_400_BAD_REQUEST)
        except Wallet.DoesNotExist:
            logger.error("User wallet not found")
            return Response({"error": "User wallet not found. Please contact support."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Unexpected error in submission: {str(e)}")
            return Response({"error": "An unexpected error occurred. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubmissionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        submissions = Submission.objects.filter(user=request.user).order_by('-submission_date')
        serializer = SubmissionSerializer(submissions, many=True)
        total_earnings = submissions.aggregate(total=Sum('earnings'))['total'] or Decimal('0.00')
        return Response({
            'submissions': serializer.data,
            'total_earnings': float(total_earnings)
        })

class WithdrawalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            wallet = Wallet.objects.get(user=request.user)
            views_earnings_balance = wallet.views_earnings_balance

            # Check for active 120-per-view package
            active_purchases = Purchase.objects.filter(
                user=request.user,
                expiry_date__gt=timezone.now()
            ).order_by('-purchase_date')

            can_withdraw = False
            if active_purchases.exists():
                active_rate = active_purchases.first().package.rate_per_view
                if active_rate == 120:
                    # For non-marketers, check for active AgentPurchase
                    if not request.user.is_marketer:
                        if AgentPurchase.objects.filter(user=request.user, status='ACTIVE').exists():
                            can_withdraw = True
                    else:
                        can_withdraw = True  # Marketers don't need agent verification

            return Response({
                'views_earnings_balance': float(views_earnings_balance),
                'can_withdraw': can_withdraw
            })
        except Wallet.DoesNotExist:
            logger.error("User wallet not found")
            return Response({"error": "User wallet not found. Please contact support."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Unexpected error in withdrawal GET: {str(e)}")
            return Response({"error": "An unexpected error occurred. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @transaction.atomic
    def post(self, request):
        try:
            amount_str = request.data.get('amount')
            if not amount_str:
                return Response({"success": False, "message": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                amount = Decimal(amount_str)
                if amount <= 0:
                    return Response({"success": False, "message": "Amount must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
            except:
                return Response({"success": False, "message": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

            # Check for active 120-per-view package
            active_purchases = Purchase.objects.filter(
                user=request.user,
                expiry_date__gt=timezone.now()
            ).order_by('-purchase_date')

            if not active_purchases.exists() or active_purchases.first().package.rate_per_view != 120:
                return Response({"success": False, "message": "Upgrade to premium package (120 per view) to withdraw"}, status=status.HTTP_400_BAD_REQUEST)

            # For non-marketers, check for active AgentPurchase
            if not request.user.is_marketer:
                if not AgentPurchase.objects.filter(user=request.user, status='ACTIVE').exists():
                    return Response({"success": False, "message": "You must be a verified agent to withdraw earnings. Please verify your account."}, status=status.HTTP_400_BAD_REQUEST)

            wallet = Wallet.objects.get(user=request.user)
            if wallet.views_earnings_balance < amount:
                return Response({"success": False, "message": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)

            wallet.views_earnings_balance -= amount
            wallet.save()

            Transaction.objects.create(
                user=request.user,
                amount=-amount,
                transaction_type='WITHDRAWAL',
                description=f'Withdrew KSH {amount} from views earnings'
            )

            # Send email
            try:
                subject = 'Withdrawal Successful!'
                context = {
                    'user': request.user,
                    'amount': amount,
                }
                message = render_to_string('emails/withdrawal_notification.html', context)
                send_mail(
                    subject=subject,
                    message='',  # Plain text fallback
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[request.user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send withdrawal notification email to {request.user.email}: {str(e)}")

            return Response({
                "success": True,
                "message": "Withdrawal successful",
                "new_balance": float(wallet.views_earnings_balance)
            }, status=status.HTTP_200_OK)

        except Wallet.DoesNotExist:
            logger.error("User wallet not found")
            return Response({"success": False, "message": "User wallet not found. Please contact support."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Unexpected error in withdrawal POST: {str(e)}")
            return Response({"success": False, "message": "An unexpected error occurred. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
        serializer = TransactionSerializer(transactions, many=True)
        total_amount = transactions.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return Response({
            'transactions': serializer.data,
            'total_amount': float(total_amount)
        })
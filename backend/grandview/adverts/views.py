from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import UnsupportedMediaType, ParseError, ValidationError
from django.http import HttpResponse
from django.db import transaction  # Added: For atomic
from .models import Advert, Submission
from packages.models import Package, Purchase
from wallet.models import Wallet, Transaction
from .serializers import AdvertSerializer, SubmissionSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
import logging

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
        response = HttpResponse(advert.file.read(), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{advert.file.name}"'
        return response

class SubmissionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # MultiPart first for file uploads

    @transaction.atomic  # Added: Ensures all-or-nothing (submission + wallet + tx)
    def post(self, request):
        try:
            logger.info(f"Submission request content-type: {request.content_type}")
            logger.debug(f"Parsed data: {dict(request.data)}")  # Changed to debug
            logger.debug(f"FILES keys: {list(request.FILES.keys())}")

            advert_id_raw = request.data.get('advert_id', None)
            views_count_str = request.data.get('views_count', '1')
            screenshot = request.FILES.get('screenshot')

            # Enhanced: Handle potential whitespace/empty values
            if advert_id_raw is None or str(advert_id_raw).strip() == '':
                logger.warning(f"Invalid advert_id: {repr(advert_id_raw)}")
                return Response({"error": "advert_id is required and must be a valid number"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                advert_id = int(str(advert_id_raw).strip())  # Coerce to int safely
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

            active_purchases = Purchase.objects.filter(
                user=request.user,
                expiry_date__gt=timezone.now()
            )
            if not active_purchases.exists():
                return Response({"error": "No active package found"}, status=status.HTTP_403_FORBIDDEN)
            active_purchase = active_purchases.first()
            if active_purchase.package.rate_per_view != advert.rate_category:
                return Response({"error": "Your package rate does not match this advert's rate category"}, status=status.HTTP_403_FORBIDDEN)

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

            # Optional: Basic file validation (e.g., size/type could be added here if needed)
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

            # Fixed: Use request.user, not self.user
            wallet = Wallet.objects.get(user=request.user)
            wallet.views_earnings_balance += earnings
            wallet.save()

            Transaction.objects.create(
                user=request.user,
                amount=earnings,
                transaction_type='EARNING',
                description=f'Earned KSH {earnings} from {views_count} views of "{advert.title}"'
            )

            serializer = SubmissionSerializer(submission)
            logger.info(f"Submission created successfully: ID={submission.id}, earnings={earnings}")
            return Response({'submission': serializer.data}, status=status.HTTP_201_CREATED)
        except UnsupportedMediaType as e:
            logger.warning(f"Media type error: {str(e)}")
            return Response({"error": "Invalid request format. Use multipart/form-data for file uploads."}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
        except ParseError as e:
            logger.warning(f"Parse error: {str(e)}")
            return Response({"error": "Invalid request format. Ensure multipart/form-data is used for file uploads."}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:  # Catch DRF validation errors (e.g., from parsers)
            logger.warning(f"Validation error: {str(e)}")
            return Response({"error": str(e.detail if hasattr(e, 'detail') else e)}, status=status.HTTP_400_BAD_REQUEST)
        except Wallet.DoesNotExist:  # Added: Specific catch for wallet missing (rare, but post-signal)
            logger.error("User wallet not found")
            return Response({"error": "User wallet not found. Please contact support."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Unexpected error in submission: {str(e)}")
            return Response({"error": "An unexpected error occurred. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
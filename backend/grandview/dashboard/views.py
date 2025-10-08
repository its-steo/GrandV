from django.forms import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from .models import Product, Cart, CartItem, Coupon, Order, InstallmentOrder, InstallmentPayment, LipaProgramRegistration, Activity
from .serializers import ProductSerializer, CartSerializer, OrderSerializer, InstallmentOrderSerializer, InstallmentPaymentSerializer, LipaRegistrationSerializer, ActivitySerializer
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import logging
import boto3
from django.conf import settings

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(is_featured=True)[:4]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class AllProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, pk=product_id)
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        logger.info(f"Added {quantity} of product {product.id} to cart for user {request.user.username}")
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class UpdateCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_id = request.data.get('cart_item_id')
        quantity = request.data.get('quantity')
        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = get_object_or_404(CartItem, pk=cart_item_id, cart__user=request.user)
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartSerializer(cart_item.cart)
        return Response(serializer.data)

class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_id = request.data.get('cart_item_id')
        cart_item = get_object_or_404(CartItem, pk=cart_item_id, cart__user=request.user)
        cart = cart_item.cart
        cart_item.delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class InstallmentOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        installment_orders = InstallmentOrder.objects.filter(order__user=request.user)
        serializer = InstallmentOrderSerializer(installment_orders, many=True)
        return Response(serializer.data)

class InstallmentPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InstallmentPaymentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    payment = serializer.save()
                    return Response(InstallmentPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                logger.error(f"Validation error during installment payment: {str(ve)}")
                return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Failed to process installment payment: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        logger.debug(f"Checkout request data: {request.data}")
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            logger.warning(f"Checkout validation failed: {serializer.errors}")
            return Response({"error": "Invalid checkout data", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Checkout failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LipaRegisterView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = LipaRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            registration = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LipaRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registration = LipaProgramRegistration.objects.filter(user=request.user).first()
        if not registration:
            return Response({"message": "No registration found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LipaRegistrationSerializer(registration)
        return Response(serializer.data)

    def put(self, request):
        registration = get_object_or_404(LipaProgramRegistration, user=request.user)
        if registration.status != 'PENDING':
            return Response({"error": "Cannot update non-pending registration"}, status=status.HTTP_403_FORBIDDEN)
        serializer = LipaRegistrationSerializer(registration, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LipaPresignedUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        doc_type = request.data.get('doc_type')
        if doc_type not in ['id_front', 'id_back', 'passport_photo']:
            return Response({"error": "Invalid doc type"}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f"lipa_documents/{doc_type}/{request.user.username}_{doc_type}_{int(timezone.now().timestamp())}.{request.data.get('extension', 'jpg')}"
        content_type = request.data.get('content_type', 'image/jpeg')

        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        presigned = s3_client.generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=file_name,
            Fields={'Content-Type': content_type, 'acl': 'private'},
            Conditions=[['content-length-range', 0, 5*1024*1024]],
            ExpiresIn=3600
        )
        return Response({'upload_url': presigned['url'], 'fields': presigned['fields'], 'key': file_name})

class TrackOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)
        
        tracking_data = {
            'tracking_number': f"TRK{order.id:08d}",
            'history': [
                {'description': 'Order placed', 'timestamp': order.ordered_at.isoformat()},
            ]
        }

        if order.status == 'PROCESSING':
            tracking_data['status'] = 'processing'
            tracking_data['preparation_steps'] = [
                "Your delivery guy has arrived",
                "The company is packaging your product",
                "Delivery guy is collecting your package"
            ]
            tracking_data['history'].append(
                {'description': 'Order processed', 'timestamp': (order.ordered_at + timedelta(hours=1)).isoformat()}
            )
        elif order.status == 'SHIPPED':
            tracking_data['status'] = 'shipped'
            tracking_data['estimated_delivery'] = (order.ordered_at + timedelta(days=7)).isoformat()
            tracking_data['estimated_minutes'] = 30  # Demo value; can be dynamic
            tracking_data['delivery_guy'] = {
                'name': 'John Doe',
                'vehicle_type': 'Motorcycle'
            }
            tracking_data['history'].extend([
                {'description': 'Order processed', 'timestamp': (order.ordered_at + timedelta(hours=1)).isoformat()},
                {'description': 'Order shipped', 'timestamp': (order.ordered_at + timedelta(hours=2)).isoformat()}
            ])
        elif order.status == 'DELIVERED':
            tracking_data['status'] = 'delivered'
            tracking_data['estimated_delivery'] = (order.ordered_at + timedelta(days=7)).isoformat()
            tracking_data['history'].extend([
                {'description': 'Order processed', 'timestamp': (order.ordered_at + timedelta(hours=1)).isoformat()},
                {'description': 'Order shipped', 'timestamp': (order.ordered_at + timedelta(hours=2)).isoformat()},
                {'description': 'Order delivered', 'timestamp': (order.ordered_at + timedelta(hours=5)).isoformat()}
            ])
        else:
            return Response({"message": "Tracking information not available"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(tracking_data)

class ConfirmDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)
        if order.status != 'SHIPPED':
            return Response({"error": "Order not in shipped status"}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'DELIVERED'
        order.save()
        return Response({"message": "Delivery confirmed"}, status=status.HTTP_200_OK)

class SubmitRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)
        if order.status != 'DELIVERED':
            return Response({"error": "Can only rate delivered orders"}, status=status.HTTP_400_BAD_REQUEST)
        rating = request.data.get('rating')
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return Response({"error": "Rating must be an integer between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)
        if order.rating:
            return Response({"error": "Order already rated"}, status=status.HTTP_400_BAD_REQUEST)
        order.rating = rating
        order.save()
        return Response({"message": "Rating submitted successfully"}, status=status.HTTP_200_OK)

class CouponValidateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('coupon_code')
        if not code:
            return Response({"error": "Coupon code is required"}, status=status.HTTP_400_BAD_REQUEST)

        coupon = Coupon.objects.filter(code=code, is_active=True).first()
        if not coupon:
            return Response({"error": "Invalid or inactive coupon code"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": float(coupon.discount_value),
        })

class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        activities = Activity.objects.all()  # Global feed
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(activities, request)
        serializer = ActivitySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
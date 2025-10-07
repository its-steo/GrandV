from django.forms import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Product, Cart, CartItem, Coupon, Order, InstallmentOrder, InstallmentPayment, LipaProgramRegistration, Wallet, Transaction
from .serializers import ProductSerializer, CartSerializer, OrderSerializer, InstallmentOrderSerializer, InstallmentPaymentSerializer, LipaRegistrationSerializer
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import logging
import boto3
from django.conf import settings

logger = logging.getLogger(__name__)

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
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')
        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)

        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, cart=cart, product__id=product_id)
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, cart=cart, product__id=product_id)
        cart_item.delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    order = serializer.save()
                    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-ordered_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class InstallmentOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        installment_orders = InstallmentOrder.objects.filter(order__user=request.user).order_by('-order__ordered_at')
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
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LipaRegisterView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = LipaRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    registration = serializer.save()
                    return Response(LipaRegistrationSerializer(registration).data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LipaRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registration = LipaProgramRegistration.objects.filter(user=request.user).first()
        if not registration:
            return Response({"message": "No Lipa Mdogo Mdogo registration found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LipaRegistrationSerializer(registration)
        return Response(serializer.data)

class LipaPresignedUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file_type = request.data.get('file_type')
        if file_type not in ['id_front', 'id_back', 'passport_photo']:
            return Response({"error": "Invalid file_type"}, status=status.HTTP_400_BAD_REQUEST)

        s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID, aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        file_name = f"lipa_documents/{file_type}/{request.user.id}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{file_type.split('_')[0]}.jpg"

        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={'Bucket': bucket_name, 'Key': file_name, 'ContentType': 'image/jpeg', 'ACL': 'private'},
            ExpiresIn=3600
        )
        return Response({'presigned_url': presigned_url, 'file_name': file_name})

class TrackOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)
        tracking_data = {
            'order_id': order.id,
            'status': order.status.lower(),
            'ordered_at': order.ordered_at.isoformat(),
            'history': [
                {'description': 'Order placed', 'timestamp': order.ordered_at.isoformat()}
            ]
        }
        if order.status == 'PROCESSING':
            tracking_data['history'].append(
                {'description': 'Order processed', 'timestamp': (order.ordered_at + timedelta(hours=1)).isoformat()}
            )
        elif order.status == 'SHIPPED':
            tracking_data['estimated_delivery'] = (order.ordered_at + timedelta(days=7)).isoformat()
            tracking_data['history'].extend([
                {'description': 'Order processed', 'timestamp': (order.ordered_at + timedelta(hours=1)).isoformat()},
                {'description': 'Order shipped', 'timestamp': (order.ordered_at + timedelta(hours=2)).isoformat()}
            ])
        elif order.status == 'DELIVERED':
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
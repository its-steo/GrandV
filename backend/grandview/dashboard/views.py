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
from django.core.mail import send_mail
from django.template.loader import render_to_string

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
            if quantity < 1:
                return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)
        product = get_object_or_404(Product, pk=product_id)
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
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
            if quantity < 1:
                return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
        cart_item.delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            with transaction.atomic():
                order = serializer.save()
                # Send order confirmation email
                try:
                    template = 'emails/order_confirmation_installment.html' if order.payment_method == 'INSTALLMENT' else 'emails/order_confirmation_full.html'
                    context = {
                        'user': request.user,
                        'order_id': order.id,
                        'total': order.discounted_total,
                        'ordered_at': order.ordered_at,
                        'site_url': settings.SITE_URL,
                    }
                    if order.payment_method == 'INSTALLMENT':
                        installment_order = InstallmentOrder.objects.get(order=order)
                        context.update({
                            'initial_deposit': installment_order.initial_deposit,
                            'remaining_balance': installment_order.remaining_balance,
                            'monthly_payment': installment_order.monthly_payment,
                            'due_date': order.ordered_at + timedelta(days=30),
                        })
                    subject = 'Installment Order Confirmed' if order.payment_method == 'INSTALLMENT' else 'Order Confirmed'
                    message = render_to_string(template, context)
                    send_mail(
                        subject=subject,
                        message='',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[request.user.email],
                        html_message=message,
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Failed to send order confirmation email to {request.user.email}: {str(e)}")
                return Response({"order_id": order.id, "message": "Order placed successfully"}, status=status.HTTP_201_CREATED)
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
        installment_orders = InstallmentOrder.objects.filter(order__user=request.user)
        serializer = InstallmentOrderSerializer(installment_orders, many=True)
        return Response(serializer.data)

class InstallmentPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InstallmentPaymentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            with transaction.atomic():
                payment = serializer.save()
                # Send payment receipt email
                try:
                    context = {
                        'user': request.user,
                        'order_id': payment.installment_order.order.id,
                        'amount': payment.amount,
                        'paid_at': payment.paid_at,
                        'remaining_balance': payment.installment_order.remaining_balance,
                        'site_url': settings.SITE_URL,
                    }
                    message = render_to_string('emails/payment_receipt.html', context)
                    send_mail(
                        subject='Installment Payment Received',
                        message='',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[request.user.email],
                        html_message=message,
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Failed to send payment receipt email to {request.user.email}: {str(e)}")
                return Response({"message": "Payment processed successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LipaRegisterView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = LipaRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            with transaction.atomic():
                registration = serializer.save()
                # Send lipa registration confirmation email
                try:
                    context = {
                        'user': request.user,
                        'full_name': registration.full_name,
                        'created_at': registration.created_at,
                        'site_url': settings.SITE_URL,
                    }
                    message = render_to_string('emails/lipa_registration_confirmation.html', context)
                    send_mail(
                        subject='Lipa Mdogo Mdogo Registration Received',
                        message='',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[request.user.email],
                        html_message=message,
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Failed to send lipa registration email to {request.user.email}: {str(e)}")
                return Response({"message": "Lipa Mdogo Mdogo registration submitted successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LipaPresignedUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file_name = request.data.get('file_name')
        file_type = request.data.get('file_type')
        if not file_name or not file_type:
            return Response({"error": "file_name and file_type are required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            key = f"lipa_documents/{file_name}"
            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': key, 'ContentType': file_type},
                ExpiresIn=3600
            )
            return Response({"presigned_url": presigned_url}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to generate presigned URL: {str(e)}")
            return Response({"error": "Failed to generate upload URL"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LipaRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registration = get_object_or_404(LipaProgramRegistration, user=request.user)
        serializer = LipaRegistrationSerializer(registration)
        return Response(serializer.data)

class TrackOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data)

class ConfirmDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)
        if order.status != 'SHIPPED':
            return Response({"error": "Order not in shipped status"}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'DELIVERED'
        order.save()
        # Send delivery confirmation and rating email
        try:
            context = {
                'user': request.user,
                'order_id': order.id,
                'total': order.discounted_total,
                'delivered_at': timezone.now(),
                'site_url': settings.SITE_URL,
            }
            message = render_to_string('emails/order_delivered_rating.html', context)
            send_mail(
                subject='Your Order Has Been Delivered',
                message='',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                html_message=message,
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send delivery confirmation email to {request.user.email}: {str(e)}")
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
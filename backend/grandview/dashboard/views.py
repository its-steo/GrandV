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
from django.core.mail import send_mail  # Added: For sending email
from django.template.loader import render_to_string  # Added: For rendering email template
from django.utils.html import strip_tags  # Added: For plain text fallback
from django.template.exceptions import TemplateDoesNotExist  # Added: To handle template not found

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

            # Send order confirmation email
            try:
                if order.payment_method == 'INSTALLMENT':
                    template_name = 'emails/order_confirmation_installment.html'
                    subject = "Your Installment Purchase Confirmation 💳"
                    context = {
                        'user': request.user,
                        'order_id': order.id,
                        'total': order.discounted_total,
                        'payment_method': order.payment_method,
                        'initial_deposit': order.installment_order.initial_deposit,
                        'remaining_balance': order.installment_order.remaining_balance,
                        'monthly_payment': order.installment_order.monthly_payment,
                        'next_due_date': order.installment_order.due_date,
                    }
                else:
                    template_name = 'emails/order_confirmation_full.html'
                    subject = "Your Purchase Confirmation 🎉"
                    context = {
                        'user': request.user,
                        'order_id': order.id,
                        'total': order.discounted_total,
                        'payment_method': order.payment_method,
                    }

                html_message = render_to_string(template_name, context)
                plain_message = strip_tags(html_message)
                from_email = 'yourapp@example.com'  # Replace with your sender email
                to_email = request.user.email

                send_mail(
                    subject,
                    plain_message,
                    from_email,
                    [to_email],
                    html_message=html_message,
                )
                logger.info(f"Order confirmation email sent to {to_email} for order {order.id}")
            except TemplateDoesNotExist as e:
                logger.warning(f"Email template not found: {str(e)}. Skipping email notification.")
            except Exception as e:
                logger.error(f"Failed to send order confirmation email: {str(e)}. Order created but email not sent.")

            return Response({"order_id": order.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Checkout failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    @transaction.atomic
    def post(self, request):
        serializer = InstallmentPaymentSerializer(data=request.data)
        if serializer.is_valid():
            installment_order_id = request.data.get('installment_order_id')
            amount = Decimal(request.data.get('amount'))
            installment_order = get_object_or_404(InstallmentOrder, pk=installment_order_id, order__user=request.user)
            if installment_order.remaining_balance < amount:
                return Response({"error": "Payment amount exceeds remaining balance"}, status=status.HTTP_400_BAD_REQUEST)
            wallet = Wallet.objects.get(user=request.user)
            if request.user.is_marketer:
                if wallet.deposit_balance + wallet.views_earnings_balance < amount:
                    return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)
                from_earnings = min(amount, wallet.views_earnings_balance)
                from_deposit = amount - from_earnings
                wallet.views_earnings_balance -= from_earnings
                wallet.deposit_balance -= from_deposit
                balance_type = (
                    'views_earnings_balance' if from_earnings > 0 and from_deposit == 0
                    else 'deposit_balance' if from_deposit > 0 and from_earnings == 0
                    else 'mixed_balance'
                )
            else:
                if wallet.deposit_balance < amount:
                    return Response({"error": "Insufficient deposit balance"}, status=status.HTTP_400_BAD_REQUEST)
                wallet.deposit_balance -= amount
                balance_type = 'deposit_balance'
            wallet.save()

            payment = InstallmentPayment.objects.create(
                installment_order=installment_order,
                amount=amount
            )

            # Create transaction
            Transaction.objects.create(
                user=request.user,
                amount=-amount,
                transaction_type='INSTALLMENT_PAYMENT',
                description=f"Installment payment for Order {installment_order.order.id}",
                balance_type=balance_type
            )

            installment_order.due_date = timezone.now() + timedelta(days=30)
            installment_order.save()

            # Send payment confirmation email
            try:
                subject = "Installment Payment Received 💸"
                html_message = render_to_string('emails/installment_payment_confirmation.html', {
                    'user': request.user,
                    'order_id': installment_order.order.id,
                    'amount': amount,
                    'remaining_balance': installment_order.remaining_balance,
                    'next_due_date': installment_order.due_date,
                })
                plain_message = strip_tags(html_message)
                from_email = 'yourapp@example.com'  # Replace with your sender email
                to_email = request.user.email

                send_mail(
                    subject,
                    plain_message,
                    from_email,
                    [to_email],
                    html_message=html_message,
                )
                logger.info(f"Installment payment confirmation email sent to {to_email}")
            except TemplateDoesNotExist as e:
                logger.warning(f"Email template not found: {str(e)}. Skipping email notification.")
            except Exception as e:
                logger.error(f"Failed to send installment payment email: {str(e)}. Payment processed but email not sent.")

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LipaRegisterView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = LipaRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            registration = serializer.save()

            # Added: Send Lipa registration confirmation email
            try:
                subject = "Thank You for Registering for Lipa Mdogo Mdogo 📝"
                html_message = render_to_string('emails/lipa_registration_confirmation.html', {
                    'user': request.user,
                    'full_name': registration.full_name,
                    'created_at': registration.created_at,
                })
                plain_message = strip_tags(html_message)
                from_email = 'yourapp@example.com'  # Replace with your sender email
                to_email = request.user.email

                send_mail(
                    subject,
                    plain_message,
                    from_email,
                    [to_email],
                    html_message=html_message,
                )
                logger.info(f"Lipa registration confirmation email sent to {to_email}")
            except TemplateDoesNotExist as e:
                logger.warning(f"Email template not found: {str(e)}. Skipping email notification.")
            except Exception as e:
                logger.error(f"Failed to send Lipa confirmation email: {str(e)}. Registration created but email not sent.")

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
        if order.status not in ['SHIPPED', 'DELIVERED']:
            return Response({"message": "Tracking information not available"}, status=status.HTTP_404_NOT_FOUND)
        
        # Mock tracking data (replace with actual tracking service integration)
        tracking_data = {
            'tracking_number': f"TRK{order.id:08d}",
            'estimated_delivery': (order.ordered_at + timedelta(days=7)).isoformat(),
            'history': [
                {'description': 'Order placed', 'timestamp': order.ordered_at.isoformat()},
                {'description': 'Order processed', 'timestamp': (order.ordered_at + timedelta(days=1)).isoformat()},
                {'description': 'Order shipped', 'timestamp': (order.ordered_at + timedelta(days=2)).isoformat()} if order.status == 'SHIPPED' or order.status == 'DELIVERED' else None,
                {'description': 'Order delivered', 'timestamp': (order.ordered_at + timedelta(days=5)).isoformat()} if order.status == 'DELIVERED' else None,
            ]
        }
        tracking_data['history'] = [event for event in tracking_data['history'] if event]
        return Response(tracking_data)

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
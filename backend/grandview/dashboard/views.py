from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import InstallmentOrder, Product, Cart, CartItem, Order, Category, LipaProgramRegistration, InstallmentPayment, Transaction, Wallet
from .serializers import ProductSerializer, CartSerializer, OrderSerializer, CartItemSerializer, InstallmentPaymentSerializer, LipaRegistrationSerializer, InstallmentOrderSerializer, CategorySerializer
from django.shortcuts import get_object_or_404
from decimal import Decimal
import logging
from rest_framework.parsers import MultiPartParser, FormParser

logger = logging.getLogger(__name__)

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(is_featured=True)[:4]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not isinstance(request.data, dict):
            logger.error(f"Invalid request data type for user {request.user.username}: {type(request.data)}, data: {request.data}")
            return Response({"error": "Invalid request data. Expected JSON body with product_id."}, status=status.HTTP_400_BAD_REQUEST)
        
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            logger.error(f"Missing product_id for user {request.user.username}")
            return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quantity = int(quantity)
            if quantity < 1:
                logger.error(f"Invalid quantity {quantity} for user {request.user.username}")
                return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            logger.error(f"Invalid quantity format {quantity} for user {request.user.username}")
            return Response({"error": "Quantity must be a valid integer"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = get_object_or_404(Product, pk=product_id)
        except ValueError:
            logger.error(f"Invalid product_id {product_id} for user {request.user.username}")
            return Response({"error": "Invalid product_id"}, status=status.HTTP_400_BAD_REQUEST)
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        logger.info(f"Added {quantity} x Product {product.id} to cart for user {request.user.username}")
        return Response({"message": "Added to cart", "cart_item": CartItemSerializer(cart_item).data}, status=status.HTTP_201_CREATED)

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        logger.info(f"Retrieved cart for user {request.user.username}: {cart.items.count()} items")
        return Response(serializer.data)

class LipaRegisterView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = LipaRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            registration = serializer.save()
            logger.info(f"Lipa registration created for user {request.user.username}: {registration.id}")
            return Response({"message": "Registration submitted successfully", "registration": LipaRegistrationSerializer(registration).data}, status=status.HTTP_201_CREATED)
        logger.error(f"Lipa registration validation errors for user {request.user.username}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LipaRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            registration = LipaProgramRegistration.objects.get(user=request.user)
            serializer = LipaRegistrationSerializer(registration)
            return Response(serializer.data)
        except LipaProgramRegistration.DoesNotExist:
            return Response({"status": "Not registered"}, status=status.HTTP_200_OK)

class MakeInstallmentPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        installment_order_id = request.data.get('installment_order_id')
        amount = request.data.get('amount')
        
        if not installment_order_id or not amount:
            return Response({"error": "installment_order_id and amount are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = Decimal(amount)
            if amount <= 0:
                return Response({"error": "Amount must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)
        
        installment_order = get_object_or_404(InstallmentOrder, id=installment_order_id, order__user=request.user)
        
        if installment_order.installment_status == 'PAID':
            return Response({"error": "This installment order is already fully paid"}, status=status.HTTP_400_BAD_REQUEST)
        
        if amount > installment_order.remaining_balance:
            return Response({"error": "Amount exceeds remaining balance"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Deduct from wallet
        wallet = Wallet.objects.get(user=request.user)
        if wallet.main_balance < amount:
            return Response({"error": "Insufficient wallet balance"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Deduct from views_earnings_balance first, then deposit_balance
        from_earnings = min(amount, wallet.views_earnings_balance)
        from_deposit = amount - from_earnings
        wallet.views_earnings_balance -= from_earnings
        wallet.deposit_balance -= from_deposit
        wallet.save()
        
        # Create payment record
        payment = InstallmentPayment.objects.create(
            installment_order=installment_order,
            amount=amount
        )
        
        # Create transaction
        Transaction.objects.create(
            user=request.user,
            transaction_type='PURCHASE',  # Use an existing transaction_type
            amount=-amount,  # Negative to indicate a debit
            description=f'Installment payment for order {installment_order.order.id}',
        )
        
        logger.info(f"Installment payment of {amount} made for user {request.user.username}, order {installment_order.order.id}")
        return Response({"message": "Payment successful", "payment": InstallmentPaymentSerializer(payment).data}, status=status.HTTP_200_OK)
    
class InstallmentOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = InstallmentOrder.objects.filter(order__user=request.user)
        serializer = InstallmentOrderSerializer(orders, many=True)
        return Response(serializer.data)

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-ordered_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Pre-check for cart items (extra safety)
        try:
            cart = Cart.objects.get(user=request.user)
            if not cart.items.exists():
                logger.error(f"Checkout attempted with empty cart for user {request.user.username}")
                return Response({"error": "Cannot checkout with an empty cart"}, status=status.HTTP_400_BAD_REQUEST)
        except Cart.DoesNotExist:
            logger.error(f"No cart found for user {request.user.username}")
            return Response({"error": "No cart found"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                order = serializer.save()
                logger.info(f"Order {order.id} placed successfully for user {request.user.username}")
                return Response({"message": "Order placed successfully", "order": OrderSerializer(order).data}, status=status.HTTP_201_CREATED)
            except ValueError as e:
                logger.error(f"Checkout failed for user {request.user.username}: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        logger.error(f"Checkout validation errors for user {request.user.username}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_id = request.data.get('cart_item_id')
        quantity = request.data.get('quantity', 1)
        if quantity < 1:
            logger.error(f"Invalid quantity {quantity} for user {request.user.username}")
            return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
        cart_item.quantity = quantity
        cart_item.save()
        logger.info(f"Updated cart item {cart_item_id} to quantity {quantity} for user {request.user.username}")
        serializer = CartItemSerializer(cart_item)
        return Response({"message": "Cart updated", "cart_item": serializer.data}, status=status.HTTP_200_OK)

class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_id = request.data.get('cart_item_id')
        cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
        cart_item.delete()
        logger.info(f"Removed cart item {cart_item_id} for user {request.user.username}")
        return Response({"message": "Item removed from cart"}, status=status.HTTP_200_OK)

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class AllProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Dashboard: Only 4 featured products
        products = Product.objects.filter(is_featured=True)[:4]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
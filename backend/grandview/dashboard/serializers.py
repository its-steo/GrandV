from rest_framework import serializers
from .models import Product, Cart, CartItem, Order, OrderItem, Image, Category, ProductImage, Coupon, LipaProgramRegistration, InstallmentOrder, InstallmentPayment
from accounts.models import CustomUser
from wallet.models import Wallet, Transaction
from decimal import Decimal
from django.utils import timezone
from django.core.mail import send_mail
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    sub_images = ProductImageSerializer(source='productimage_set', many=True, read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'main_image', 'sub_images', 'description', 'category', 'supports_installments']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    def get_subtotal(self, obj):
        return obj.product.price * obj.quantity

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    def get_total(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'items', 'total']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price_at_purchase']

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class LipaRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LipaProgramRegistration
        fields = ['id', 'user', 'full_name', 'date_of_birth', 'address', 'status', 'created_at', 'updated_at', 'id_front', 'id_back', 'passport_photo']
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']

    def validate(self, data):
        for field in ['id_front', 'id_back', 'passport_photo']:
            file = data.get(field)
            if file:
                if file.size > 5 * 1024 * 1024:  # 5MB limit
                    raise serializers.ValidationError({field: "File size must be less than 5MB."})
                if file.content_type not in ['image/jpeg', 'image/png', 'application/pdf']:
                    raise serializers.ValidationError({field: "File must be JPEG, PNG, or PDF."})
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        if LipaProgramRegistration.objects.filter(user=user).exists():
            raise serializers.ValidationError("You are already registered for Lipa Mdogo Mdogo.")
        registration = LipaProgramRegistration.objects.create(user=user, **validated_data)
        send_mail(
            'Lipa Mdogo Mdogo Registration Received',
            'Your documents are under review. We\'ll notify you soon.',
            'from@example.com',
            [user.email],
            fail_silently=True,
        )
        return registration

class InstallmentOrderSerializer(serializers.ModelSerializer):
    remaining_amount = serializers.DecimalField(source='remaining_balance', max_digits=10, decimal_places=2, read_only=True)
    status = serializers.CharField(source='installment_status', read_only=True)
    next_payment_date = serializers.DateTimeField(source='due_date', read_only=True)

    class Meta:
        model = InstallmentOrder
        fields = ['id', 'order', 'months', 'total_amount', 'initial_deposit', 'remaining_amount', 'monthly_payment', 'status', 'created_at', 'next_payment_date']
        read_only_fields = ['id', 'order', 'total_amount', 'initial_deposit', 'remaining_amount', 'monthly_payment', 'status', 'created_at', 'next_payment_date']

class InstallmentPaymentSerializer(serializers.Serializer):
    installment_order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, data):
        try:
            installment_order = InstallmentOrder.objects.get(id=data['installment_order_id'], order__user=self.context['request'].user)
        except InstallmentOrder.DoesNotExist:
            raise serializers.ValidationError("Installment order not found.")
        
        if data['amount'] <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")
        if data['amount'] > float(installment_order.remaining_balance):
            raise serializers.ValidationError("Payment amount exceeds remaining balance.")
        
        return data

    def create(self, validated_data):
        installment_order = InstallmentOrder.objects.get(id=validated_data['installment_order_id'])
        payment = InstallmentPayment.objects.create(
            installment_order=installment_order,
            amount=validated_data['amount']
        )
        # Create Transaction for payment
        Transaction.objects.create(
            user=payment.installment_order.order.user,
            amount=validated_data['amount'],
            transaction_type='INSTALLMENT_PAYMENT',
            description=f'Installment payment for Order {payment.installment_order.order.id}',
        )
        return payment

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    payment_method = serializers.ChoiceField(choices=[('FULL', 'Full Payment'), ('INSTALLMENT', 'Installment (Lipa Mdogo Mdogo)')], default='FULL')
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    installment_order = InstallmentOrderSerializer(source='installment', read_only=True, allow_null=True)
    months = serializers.IntegerField(required=False, default=3)

    class Meta:
        model = Order
        fields = ['id', 'user', 'address', 'phone', 'delivery_fee', 'total', 'discounted_total', 'status', 'payment_method', 'coupon_code', 'ordered_at', 'items', 'installment_order', 'months']

    def validate(self, data):
        request = self.context['request']
        user = request.user
        cart = Cart.objects.get(user=user)

        # Empty cart check
        if not cart.items.exists():
            raise serializers.ValidationError("Cannot create order with an empty cart")

        # Validate installment eligibility
        if data.get('payment_method') == 'INSTALLMENT':
            if not LipaProgramRegistration.objects.filter(user=user, status='APPROVED').exists():
                raise serializers.ValidationError("You must be approved for Lipa Mdogo Mdogo to use installments.")
            for item in cart.items.all():
                if not item.product.supports_installments:
                    raise serializers.ValidationError(f"Product {item.product.name} does not support installments.")

        # Calculate total (pre-discount)
        temp_total = data.get('delivery_fee', Decimal('225.00'))
        for item in cart.items.all():
            temp_total += item.product.price * item.quantity
        data['total'] = temp_total

        # Apply coupon
        coupon_code = data.pop('coupon_code', None)
        data['coupon'] = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code.strip(), is_active=True)
                if coupon.valid_until and coupon.valid_until < timezone.now():
                    raise serializers.ValidationError("Coupon has expired.")
                data['coupon'] = coupon
                temp_total = coupon.apply_to(temp_total)
            except Coupon.DoesNotExist:
                raise serializers.ValidationError("Invalid coupon code.")

        # Check wallet balance
        wallet = Wallet.objects.get(user=user)
        amount_to_deduct = temp_total
        if data.get('payment_method') == 'INSTALLMENT':
            amount_to_deduct = temp_total * Decimal('0.4')  # 40% deposit
        if user.is_marketer:
            if wallet.main_balance < amount_to_deduct:
                raise serializers.ValidationError("Insufficient main balance for order.")
        else:
            if wallet.deposit_balance < amount_to_deduct:
                raise serializers.ValidationError("Insufficient deposit balance for order.")
        data['discounted_total'] = temp_total
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.get(user=user)
        months = validated_data.pop('months', 3)  # Extract months

        with transaction.atomic():
            # Create order without installment_months
            order = Order.objects.create(**validated_data)
            
            # Create OrderItems from cart
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price_at_purchase=cart_item.product.price
                )
            
            # Clear cart after success
            cart.items.all().delete()
            
            # Trigger save with installment_months for installment logic
            order.save(installment_months=months)
            
            logger.info(f"Order {order.id} created successfully for user {user.username}")
            return order
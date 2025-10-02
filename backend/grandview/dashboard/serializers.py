from datetime import timedelta
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Category, Product, Image, ProductImage, Cart, CartItem, Coupon, InstallmentOrder, Order, OrderItem, InstallmentPayment, LipaProgramRegistration
from wallet.models import Transaction, Wallet
from accounts.models import CustomUser
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ImageSerializer(serializers.ModelSerializer):
    file = serializers.ImageField(use_url=True)

    class Meta:
        model = Image
        fields = ['id', 'file']

class ProductImageSerializer(serializers.ModelSerializer):
    image = ImageSerializer()

    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class CouponSerializer(serializers.ModelSerializer):
    applicable_products = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'is_active', 'applicable_products']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    sub_images = ProductImageSerializer(source='productimage_set', many=True, read_only=True)
    main_image = serializers.ImageField(use_url=True)
    available_coupons = CouponSerializer(source='coupons', many=True, read_only=True)
    discounted_price = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'main_image', 'sub_images', 'description', 'category', 'category_id', 'is_featured', 'supports_installments', 'available_coupons', 'discounted_price']

    def get_discounted_price(self, obj):
        coupons = obj.coupons.filter(is_active=True)
        if not coupons.exists():
            return obj.price
        min_price = obj.price
        for coupon in coupons:
            if coupon.discount_type == 'PERCENT':
                d = obj.price * (coupon.discount_value / Decimal('100'))
            else:
                d = min(coupon.discount_value, obj.price)
            min_price = min(min_price, obj.price - d)
        return min_price

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        return obj.quantity * obj.product.price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'created_at']

    def get_total(self, obj):
        return sum(item.quantity * item.product.price for item in obj.items.all())

class InstallmentPaymentSerializer(serializers.ModelSerializer):
    installment_order_id = serializers.PrimaryKeyRelatedField(queryset=InstallmentOrder.objects.all(), source='installment_order')

    class Meta:
        model = InstallmentPayment
        fields = ['id', 'amount', 'paid_at', 'installment_order_id']
        read_only_fields = ['id', 'paid_at']

    def validate(self, data):
        user = self.context['request'].user
        installment_order = data['installment_order']
        if installment_order.order.user != user:
            raise ValidationError({"installment_order_id": "This installment order does not belong to you."})
        if installment_order.installment_status in ['PAID', 'PENDING']:
            raise ValidationError({"installment_order_id": "Cannot make payment on a paid or pending installment."})
        if data['amount'] > installment_order.remaining_balance:
            raise ValidationError({"amount": "Payment amount exceeds remaining balance."})
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        installment_order = validated_data['installment_order']
        amount = validated_data['amount']

        # Deduct from wallet
        wallet = Wallet.objects.get(user=user)
        if user.is_marketer:
            # Prioritize views_earnings_balance for marketers
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
                raise ValidationError({"balance": "Insufficient deposit balance."})
            wallet.deposit_balance -= amount
            balance_type = 'deposit_balance'
        wallet.save()

        # Create payment
        payment = super().create(validated_data)

        # Create transaction
        transaction = Transaction.objects.create(
            user=user,
            amount=-amount,
            transaction_type='INSTALLMENT_PAYMENT',
            description=f"Installment payment for Order {installment_order.order.id}",
            balance_type=balance_type
        )
        payment.transaction = transaction
        payment.save()

        # Update due date for next payment
        installment_order.due_date += timedelta(days=30)
        installment_order.save()

        return payment

class InstallmentOrderSerializer(serializers.ModelSerializer):
    payments = InstallmentPaymentSerializer(many=True, read_only=True)
    remaining_amount = serializers.DecimalField(source='remaining_balance', max_digits=10, decimal_places=2)
    next_payment_date = serializers.DateTimeField(source='due_date')
    status = serializers.CharField(source='installment_status')

    class Meta:
        model = InstallmentOrder
        fields = ['id', 'order', 'initial_deposit', 'remaining_amount', 'months', 'monthly_payment', 'next_payment_date', 'status', 'payments']

class OrderSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, required=False)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True, write_only=True)
    payment_method = serializers.ChoiceField(choices=['FULL', 'INSTALLMENT'], write_only=True)
    installment_months = serializers.IntegerField(min_value=1, max_value=12, required=False, write_only=True)
    address = serializers.CharField(required=True, write_only=True)
    phone = serializers.CharField(required=True, write_only=True)
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=True, write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'total', 'discounted_total', 'coupon', 'payment_method', 'status', 'ordered_at', 'items', 'coupon_code', 'installment_months', 'address', 'phone', 'delivery_fee']
        read_only_fields = ['total', 'discounted_total', 'coupon', 'status', 'ordered_at']

    def validate(self, data):
        logger.debug(f"Validating checkout data: {data}")
        user = self.context['request'].user
        # Handle field aliases from frontend
        payment_method = data.get('payment_method') or data.get('payment_type')
        if payment_method:
            data['payment_method'] = payment_method.upper()
        installment_months = data.get('installment_months') or data.get('months')
        if installment_months:
            data['installment_months'] = installment_months
        coupon_code = data.get('coupon_code', '')

        # Fetch items from cart if not provided
        items = data.get('items', [])
        if not items:
            cart, _ = Cart.objects.get_or_create(user=user)
            items = [{'product': item.product, 'quantity': item.quantity} for item in cart.items.all()]
            if not items:
                logger.warning("No items in cart for checkout")
                raise ValidationError({"items": "Your cart is empty. Add items before checking out."})
            data['items'] = items

        # Validate items
        for item in items:
            product = item.get('product')
            quantity = item.get('quantity')
            if not product:
                logger.warning(f"Invalid product in items: {item}")
                raise ValidationError({"items": "Each item must have a valid product."})
            if not isinstance(quantity, int) or quantity <= 0:
                logger.warning(f"Invalid quantity for product {product.id}: {quantity}")
                raise ValidationError({"items": f"Invalid quantity for product {product.id}."})

        # Calculate total from items (recalculated in backend for security)
        total = sum(item['quantity'] * item['product'].price for item in items)

        # Validate payment method and installment
        payment_method = data.get('payment_method')
        installment_months = data.get('installment_months')
        if payment_method == 'INSTALLMENT':
            if not installment_months:
                logger.warning("Installment months missing for INSTALLMENT payment")
                raise ValidationError({"installment_months": "Installment months required for installment payment."})
            lipa_registration = LipaProgramRegistration.objects.filter(user=user, status='APPROVED').first()
            if not lipa_registration:
                logger.warning(f"User {user.username} not approved for Lipa Mdogo Mdogo")
                raise ValidationError({"payment_method": "Lipa Mdogo Mdogo registration not approved."})
            for item in items:
                if not item['product'].supports_installments:
                    logger.warning(f"Product {item['product'].id} does not support installments")
                    raise ValidationError({"items": f"Product {item['product'].name} does not support installment payments."})

        # Validate address and phone (required fields)
        if not data.get('address'):
            raise ValidationError({"address": "This field is required."})
        if not data.get('phone'):
            raise ValidationError({"phone": "This field is required."})

        # Apply coupon if provided
        data['discounted_total'] = total
        if coupon_code:
            coupon = Coupon.objects.filter(code=coupon_code, is_active=True).first()
            if not coupon:
                logger.warning(f"Invalid coupon code: {coupon_code}")
                raise ValidationError({"coupon_code": "Invalid or inactive coupon code."})
            applicable_products = coupon.applicable_products.all()
            has_specific_products = applicable_products.exists()
            applicable_total = Decimal('0')
            for item in items:
                if not has_specific_products or item['product'] in applicable_products:
                    applicable_total += item['quantity'] * item['product'].price
            if applicable_total <= 0:
                logger.warning(f"Coupon {coupon_code} does not apply to any items")
                raise ValidationError({"coupon_code": "This coupon does not apply to any items in your cart."})
            if coupon.discount_type == 'PERCENT':
                discount = applicable_total * (coupon.discount_value / Decimal('100'))
            else:
                discount = min(coupon.discount_value, applicable_total)
            data['discounted_total'] = total - discount
            data['coupon'] = coupon
        else:
            data['coupon'] = None
        data['total'] = total

        # Validate wallet balance
        wallet = Wallet.objects.get(user=user)
        amount_to_deduct = data['discounted_total'] if payment_method == 'FULL' else data['discounted_total'] * Decimal('0.4')
        if user.is_marketer:
            if wallet.deposit_balance + wallet.views_earnings_balance < amount_to_deduct:
                logger.warning(f"Insufficient balance for user {user.username}: {wallet.deposit_balance + wallet.views_earnings_balance} < {amount_to_deduct}")
                raise ValidationError({"balance": "Insufficient main balance."})
        else:
            if wallet.deposit_balance < amount_to_deduct:
                logger.warning(f"Insufficient deposit balance for user {user.username}: {wallet.deposit_balance} < {amount_to_deduct}")
                raise ValidationError({"balance": "Insufficient deposit balance."})

        return data

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        items_data = validated_data.pop('items')
        coupon = validated_data.get('coupon')
        payment_method = validated_data.pop('payment_method')
        installment_months = validated_data.pop('installment_months', None)
        total = validated_data['total']
        discounted_total = validated_data['discounted_total']
        address = validated_data.pop('address')
        phone = validated_data.pop('phone')
        delivery_fee = validated_data.pop('delivery_fee')

        wallet = Wallet.objects.get(user=user)
        amount_to_deduct = discounted_total if payment_method == 'FULL' else discounted_total * Decimal('0.4')

        # Determine balance_type based on user type
        if user.is_marketer:
            # For marketers, prioritize views_earnings_balance, then deposit_balance
            from_earnings = min(amount_to_deduct, wallet.views_earnings_balance)
            from_deposit = amount_to_deduct - from_earnings
            wallet.views_earnings_balance -= from_earnings
            wallet.deposit_balance -= from_deposit
            # Set balance_type based on which balance is used
            balance_type = (
                'views_earnings_balance' if from_earnings > 0 and from_deposit == 0
                else 'deposit_balance' if from_deposit > 0 and from_earnings == 0
                else 'mixed_balance'
            )
        else:
            wallet.deposit_balance -= amount_to_deduct
            balance_type = 'deposit_balance'

        wallet.save()

        order = Order.objects.create(
            user=user,
            total=total,
            discounted_total=discounted_total,
            coupon=coupon,
            payment_method=payment_method,
            status='PENDING',
            address=address,
            phone=phone,
            delivery_fee=delivery_fee
        )

        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                quantity=item_data['quantity'],
                price_at_purchase=item_data['product'].price
            )

        if payment_method == 'INSTALLMENT':
            initial_deposit = discounted_total * Decimal('0.4')
            remaining_balance = discounted_total - initial_deposit
            installment_order = InstallmentOrder.objects.create(
                order=order,
                initial_deposit=initial_deposit,
                remaining_balance=remaining_balance,
                months=installment_months
            )
            installment_order.installment_status = 'ONGOING'
            installment_order.save()

            Transaction.objects.create(
                user=user,
                amount=-initial_deposit,
                transaction_type='INSTALLMENT_PAYMENT',
                description=f"40% deposit for Order {order.id}",
                balance_type=balance_type
            )
        else:
            Transaction.objects.create(
                user=user,
                amount=-amount_to_deduct,
                transaction_type='PURCHASE',
                description=f"Full payment for Order {order.id}",
                balance_type=balance_type
            )

        # Clear the cart after successful order
        cart = Cart.objects.filter(user=user).first()
        if cart:
            cart.items.all().delete()

        return order

class LipaRegistrationSerializer(serializers.ModelSerializer):
    id_front = serializers.FileField(required=True)
    id_back = serializers.FileField(required=True)
    passport_photo = serializers.FileField(required=True)

    class Meta:
        model = LipaProgramRegistration
        fields = ['id', 'full_name', 'date_of_birth', 'address', 'id_front', 'id_back', 'passport_photo', 'status', 'created_at', 'updated_at']

    def validate(self, data):
        for field in ['id_front', 'id_back', 'passport_photo']:
            file = data.get(field)
            if file:
                if file.size > 5 * 1024 * 1024:
                    raise serializers.ValidationError(f"{field} must not exceed 5MB.")
                if not file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf')):
                    raise serializers.ValidationError(f"{field} must be a PNG, JPG, or PDF file.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        existing_registration = LipaProgramRegistration.objects.filter(user=user).first()
        if existing_registration:
            raise ValidationError("A Lipa Mdogo Mdogo registration already exists for this user.")
        validated_data['user'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if instance.status == 'APPROVED':
            raise ValidationError("Cannot update an approved Lipa Mdogo Mdogo registration.")
        return super().update(instance, validated_data)
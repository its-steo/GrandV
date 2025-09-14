from rest_framework import serializers
from .models import Product, Cart, CartItem, Order, OrderItem, Image, Category, ProductImage
from accounts.models import CustomUser
from wallet.models import Wallet
from decimal import Decimal

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    sub_images = ProductImageSerializer(source='productimage_set', many=True, read_only=True)  # Via through
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'main_image', 'sub_images', 'description', 'category']


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

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Order
        fields = ['id', 'user', 'address', 'phone', 'delivery_fee', 'total', 'status', 'ordered_at', 'items']

    def validate(self, data):
        request = self.context['request']
        user = request.user
        cart = Cart.objects.get(user=user)
        temp_total = data.get('delivery_fee', Decimal('5.00'))
        for item in cart.items.all():
            temp_total += item.product.price * item.quantity
        wallet = Wallet.objects.get(user=user)
        if user.is_marketer:
            if wallet.main_balance < temp_total:
                raise serializers.ValidationError("Insufficient main balance for order.")
        else:
            if wallet.deposit_balance < temp_total:
                raise serializers.ValidationError("Insufficient deposit balance for order.")
        return data

    def create(self, validated_data):
        request = self.context['request']
        user = request.user  # For reference, but not passed to create
        cart = Cart.objects.get(user=user)
        # Fixed: No explicit user=; HiddenField provides it in validated_data
        order = Order.objects.create(**validated_data)  # Triggers model save() for deduction, commission, email, items
        return order
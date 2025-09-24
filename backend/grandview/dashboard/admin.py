from django.contrib import admin
from .models import (
    Category, Image, Product, Cart, CartItem, Order, OrderItem,
    ProductImage, LipaProgramRegistration, InstallmentOrder,
    InstallmentPayment, Coupon
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('file',)
    search_fields = ('file',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'is_featured', 'supports_installments')
    list_filter = ('category', 'is_featured', 'supports_installments')
    search_fields = ('name', 'description')

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image')
    search_fields = ('product__name',)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__username',)

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity')
    search_fields = ('cart__user__username', 'product__name')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'is_active')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('code',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total', 'discounted_total', 'payment_method', 'status', 'ordered_at')
    list_filter = ('payment_method', 'status')
    search_fields = ('user__username',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price_at_purchase')
    search_fields = ('order__id', 'product__name')

@admin.register(InstallmentOrder)
class InstallmentOrderAdmin(admin.ModelAdmin):
    list_display = ('order', 'initial_deposit', 'remaining_balance', 'months', 'installment_status')
    list_filter = ('installment_status',)
    search_fields = ('order__id',)

@admin.register(InstallmentPayment)
class InstallmentPaymentAdmin(admin.ModelAdmin):
    list_display = ('installment_order', 'amount', 'paid_at')
    search_fields = ('installment_order__order__id',)

@admin.register(LipaProgramRegistration)
class LipaProgramRegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('full_name', 'user__username')
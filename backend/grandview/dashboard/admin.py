from django.contrib import admin
from django.forms import ModelForm
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from .models import Category, Image, Product, Cart, CartItem, Order, OrderItem, ProductImage, LipaProgramRegistration, InstallmentOrder, InstallmentPayment, Coupon

class ProductImageInlineForm(ModelForm):
    class Meta:
        model = ProductImage
        fields = ['image']

    def clean_image(self):
        image = self.cleaned_data['image']
        try:
            product = self.instance.product
        except ObjectDoesNotExist:
            return image
        if product and ProductImage.objects.filter(product=product, image=image).exists():
            raise ValidationError("This image is already added to the product.")
        return image

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    form = ProductImageInlineForm
    extra = 3
    fields = ['image']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('file',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'is_featured')
    list_filter = ('category', 'is_featured')
    search_fields = ('name',)
    inlines = [ProductImageInline]

    actions = ['mark_featured', 'mark_not_featured']

    def mark_featured(self, request, queryset):
        queryset.update(is_featured=True)
        self.message_user(request, "Selected products marked as featured.")

    mark_featured.short_description = "Mark selected as featured"

    def mark_not_featured(self, request, queryset):
        queryset.update(is_featured=False)
        self.message_user(request, "Selected products marked as not featured.")

    mark_not_featured.short_description = "Mark selected as not featured"

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'total', 'status', 'ordered_at')
    list_filter = ('status',)
    search_fields = ('user__username',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price_at_purchase')

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image')
    list_filter = ('product',)
    search_fields = ('product__name',)

@admin.register(LipaProgramRegistration)
class LipaAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'registered_at', 'approved_at', 'id_front', 'id_back', 'passport_photo')
    list_filter = ('status',)
    actions = ['approve_registrations', 'reject_registrations']

    def registered_at(self, obj):
        return obj.created_at
    registered_at.short_description = 'Registered At'

    def approved_at(self, obj):
        return obj.updated_at
    approved_at.short_description = 'Approved At'

    def approve_registrations(self, request, queryset):
        updated = queryset.update(status='APPROVED')
        self.message_user(request, f'{updated} registrations approved.')
    approve_registrations.short_description = "Approve selected registrations"

    def reject_registrations(self, request, queryset):
        updated = queryset.update(status='REJECTED')
        self.message_user(request, f'{updated} registrations rejected.')
    reject_registrations.short_description = "Reject selected registrations"

@admin.register(InstallmentOrder)
class InstallmentOrderAdmin(admin.ModelAdmin):
    list_display = ('order', 'initial_deposit', 'remaining_balance', 'installment_status', 'due_date')

@admin.register(InstallmentPayment)
class InstallmentPaymentAdmin(admin.ModelAdmin):
    list_display = ('installment_order', 'amount', 'paid_at')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'is_active')
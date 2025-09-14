from django.contrib import admin
from django.forms import ModelForm
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from .models import Category, Image, Product, Cart, CartItem, Order, OrderItem, ProductImage

class ProductImageInlineForm(ModelForm):
    class Meta:
        model = ProductImage
        fields = ['image']

    def clean_image(self):
        image = self.cleaned_data['image']
        # For new products (add view), skip duplicate check - no prior associations exist
        try:
            product = self.instance.product  # This may fail for new instances
        except ObjectDoesNotExist:
            # New product: No duplicate possible yet; return image
            return image
        
        # Existing product: Check for duplicates
        if product and ProductImage.objects.filter(product=product, image=image).exists():
            raise ValidationError("This image is already added to the product.")
        return image

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    form = ProductImageInlineForm
    extra = 3  # Default 3 new image slots
    fields = ['image']  # Only image field in inline

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

# Optional: Register through model for direct editing (if needed)
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image')
    list_filter = ('product',)
    search_fields = ('product__name',)
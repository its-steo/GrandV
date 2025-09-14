from django.db import models
from accounts.models import CustomUser
from wallet.models import Wallet
from decimal import Decimal
from django.core.mail import send_mail
from django.utils import timezone
from django.db import transaction

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Image(models.Model):
    file = models.ImageField(upload_to='products/sub_images/')

    def __str__(self):
        return self.file.name

# Custom through model (explicit for no duplicates)
class ProductImage(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('product', 'image')

    def __str__(self):
        return f"{self.product.name} - {self.image}"

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    main_image = models.ImageField(upload_to='products/')
    sub_images = models.ManyToManyField(Image, through=ProductImage, blank=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    total = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    ordered_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # On create
            cart = Cart.objects.get(user=self.user)
            with transaction.atomic():
                self.total = self.delivery_fee
                for item in cart.items.all():
                    self.total += item.product.price * item.quantity

                wallet = Wallet.objects.get(user=self.user)
                if self.user.is_marketer:
                    if wallet.main_balance < self.total:
                        raise ValueError("Insufficient main balance.")
                    from_earnings = min(self.total, wallet.views_earnings_balance)
                    from_deposit = self.total - from_earnings
                    wallet.views_earnings_balance -= from_earnings
                    wallet.deposit_balance -= from_deposit
                else:
                    if wallet.deposit_balance < self.total:
                        raise ValueError("Insufficient deposit balance.")
                    wallet.deposit_balance -= self.total
                wallet.save()

                upline = self.user.referred_by
                if upline and upline.is_marketer:
                    commission = Decimal('0.8') * self.total
                    upline_wallet = Wallet.objects.get(user=upline)
                    upline_wallet.referral_balance += commission
                    upline_wallet.save()

                super().save(*args, **kwargs)

                for cart_item in cart.items.all():
                    OrderItem.objects.create(
                        order=self,
                        product=cart_item.product,
                        quantity=cart_item.quantity,
                        price_at_purchase=cart_item.product.price
                    )

                cart.items.all().delete()

                send_mail(
                    'Order Confirmation',
                    f'Thank you for your order! Total: {self.total}. Delivery to {self.address}.',
                    'from@example.com',
                    [self.user.email],
                    fail_silently=True,
                )
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order {self.order.id}"
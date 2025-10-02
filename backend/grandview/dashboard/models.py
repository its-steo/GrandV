from django.db import models
from accounts.models import CustomUser
from wallet.models import Wallet, Transaction
from decimal import Decimal
from django.core.mail import send_mail
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import logging
from grandview.settings import S3MediaStorage

logger = logging.getLogger(__name__)

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Image(models.Model):
    file = models.ImageField(upload_to='products/sub_images/', storage=S3MediaStorage(default_acl='public-read'))

    def __str__(self):
        return self.file.name

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
    main_image = models.ImageField(upload_to='products/', storage=S3MediaStorage(default_acl='public-read'))
    sub_images = models.ManyToManyField(Image, through=ProductImage, blank=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    is_featured = models.BooleanField(default=False)
    supports_installments = models.BooleanField(default=True)

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

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=[('PERCENT', 'Percent'), ('FIXED', 'Fixed')])
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    applicable_products = models.ManyToManyField(Product, blank=True, related_name='coupons')

    def __str__(self):
        return self.code

class Order(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_total = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    ordered_at = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, choices=[('FULL', 'Full Payment'), ('INSTALLMENT', 'Installment')])
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ], default='PENDING')
    address = models.TextField()
    phone = models.CharField(max_length=20)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.PositiveIntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order {self.order.id}"

class InstallmentOrder(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    initial_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2)
    months = models.IntegerField(default=3)
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    due_date = models.DateTimeField()
    installment_status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('ONGOING', 'Ongoing'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
    ], default='PENDING')

    def save(self, *args, **kwargs):
        if not self.pk:  # Only set due_date for new objects
            self.due_date = timezone.now() + timedelta(days=30)
            self.installment_status = 'PENDING'
        if self.remaining_balance <= 0:
            self.installment_status = 'PAID'
        elif self.due_date < timezone.now() and self.remaining_balance > 0 and self.installment_status != 'PENDING':
            self.installment_status = 'OVERDUE'
        if self.monthly_payment is None and self.remaining_balance > 0:
            self.monthly_payment = self.remaining_balance / self.months
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Installment for Order {self.order.id}"

class InstallmentPayment(models.Model):
    installment_order = models.ForeignKey(InstallmentOrder, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.installment_order.remaining_balance -= self.amount
        if self.installment_order.remaining_balance <= 0:
            self.installment_order.remaining_balance = Decimal('0')
            self.installment_order.installment_status = 'PAID'
        self.installment_order.save()

    def __str__(self):
        return f"Payment of {self.amount} for Installment {self.installment_order.id}"

class LipaProgramRegistration(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    id_front = models.FileField(upload_to='lipa_documents/id_front/', storage=S3MediaStorage(default_acl='private'))
    id_back = models.FileField(upload_to='lipa_documents/id_back/', storage=S3MediaStorage(default_acl='private'))
    passport_photo = models.FileField(upload_to='lipa_documents/passport/', storage=S3MediaStorage(default_acl='private'))

    def __str__(self):
        return f"{self.full_name} - Lipa Mdogo Mdogo"
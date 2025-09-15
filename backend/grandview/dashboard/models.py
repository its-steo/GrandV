from django.db import models
from accounts.models import CustomUser
from wallet.models import Wallet, Transaction
from decimal import Decimal
from django.core.mail import send_mail
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Image(models.Model):
    file = models.ImageField(upload_to='products/sub_images/')

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
    main_image = models.ImageField(upload_to='products/')
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
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=10, choices=[('PERCENT', 'Percentage'), ('FIXED', 'Fixed Amount')])
    discount_value = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.code

    def apply_to(self, total):
        if not self.is_active or (self.valid_until and timezone.now() > self.valid_until):
            return total
        if self.discount_type == 'PERCENT':
            return total - (total * self.discount_value / 100)
        return total - self.discount_value

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_TYPE_CHOICES = [
        ('FULL', 'Full Payment'),
        ('INSTALLMENT', 'Installment'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('225.00'))
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discounted_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    coupon = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL)
    ordered_at = models.DateTimeField(auto_now_add=True)
    # Track if payment has been processed to prevent double deductions
    payment_processed = models.BooleanField(default=False)

    def save(self, *args, installment_months=3, **kwargs):
        logger.info(f"Order.save() called for Order {self.id or 'None'} for user {self.user.username}, payment_processed={self.payment_processed}")

        # Skip payment processing if already done
        if self.payment_processed:
            logger.warning(f"Payment already processed for Order {self.id or 'None'} for user {self.user.username}, skipping deduction")
            super().save(*args, **kwargs)
            return

        wallet = Wallet.objects.get(user=self.user)
        total_to_deduct = self.discounted_total
        amount_to_deduct = total_to_deduct if self.payment_method == 'FULL' else total_to_deduct * Decimal('0.4')

        # Determine deduction source and validate
        if self.user.is_marketer:
            if wallet.main_balance < amount_to_deduct:
                raise ValueError("Insufficient main balance for order")
            from_earnings = min(amount_to_deduct, wallet.views_earnings_balance)
            from_deposit = amount_to_deduct - from_earnings
            wallet.views_earnings_balance -= from_earnings
            wallet.deposit_balance -= from_deposit
            balance_desc = "main balance"
            logger.info(f"Marketer {self.user.username} deducted {amount_to_deduct} from main balance (earnings: {from_earnings}, deposit: {from_deposit})")
        else:
            if wallet.deposit_balance < amount_to_deduct:
                raise ValueError("Insufficient deposit balance for order")
            wallet.deposit_balance -= amount_to_deduct
            balance_desc = "deposit balance"
            logger.info(f"Non-marketer {self.user.username} deducted {amount_to_deduct} from deposit balance")

        wallet.save()

        # Create Transaction for logging (negative amount)
        Transaction.objects.create(
            user=self.user,
            amount=-amount_to_deduct,
            transaction_type='PURCHASE',
            description=f'Order {self.id or "pending"} - {"40% deposit" if self.payment_method == "INSTALLMENT" else "full payment"} from {balance_desc}',
        )

        # Mark payment as processed
        self.payment_processed = True

        # Save Order to assign primary key and update payment_processed
        super().save(*args, **kwargs)

        logger.info(f"Order {self.id} saved successfully for user {self.user.username}")

        # Handle installment only if it doesn't already exist
        if self.payment_method == 'INSTALLMENT':
            if not hasattr(self, 'installment') or self.installment is None:
                remaining_balance = self.discounted_total - amount_to_deduct
                monthly_payment = remaining_balance / installment_months
                InstallmentOrder.objects.create(
                    order=self,
                    months=installment_months,
                    total_amount=self.discounted_total,
                    initial_deposit=amount_to_deduct,
                    remaining_balance=remaining_balance,
                    monthly_payment=monthly_payment,
                    due_date=timezone.now() + timedelta(days=30),
                )
                logger.info(f"InstallmentOrder created for Order {self.id} for user {self.user.username}")
            else:
                logger.warning(f"InstallmentOrder already exists for Order {self.id} for user {self.user.username}, skipping creation")

        # Send email only after successful save
        remaining = total_to_deduct - amount_to_deduct
        send_mail(
            'Order Confirmation',
            f'Order {self.id} placed successfully. Total: {self.discounted_total}. Remaining: {remaining}. Delivery en route.',
            'from@example.com',
            [self.user.email],
            fail_silently=True,
        )
        logger.info(f"Confirmation email sent for Order {self.id} to {self.user.email}")

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order {self.order.id}"

class InstallmentOrder(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('PAID', 'Fully Paid'),
        ('OVERDUE', 'Overdue'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='installment')
    months = models.PositiveIntegerField(default=3)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    initial_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2)
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    installment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    due_date = models.DateTimeField(null=True, blank=True)
    delivered = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.due_date:
            self.due_date = timezone.now() + timedelta(days=30)
        if self.remaining_balance <= 0:
            self.installment_status = 'PAID'
        elif self.due_date < timezone.now() and self.remaining_balance > 0:
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
    transaction = models.ForeignKey('wallet.Transaction', on_delete=models.CASCADE, null=True, blank=True)

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
    id_front = models.FileField(upload_to='lipa_documents/id_front/')
    id_back = models.FileField(upload_to='lipa_documents/id_back/')
    passport_photo = models.FileField(upload_to='lipa_documents/passport/')

    def __str__(self):
        return f"{self.full_name} - Lipa Mdogo Mdogo"
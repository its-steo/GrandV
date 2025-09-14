from django.db import models
from accounts.models import CustomUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal

class Wallet(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    deposit_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # From deposits
    views_earnings_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # From advert submissions
    referral_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    @property
    def main_balance(self):
        return self.deposit_balance + self.views_earnings_balance

    def __str__(self):
        return f"Wallet for {self.user.username}"

class Deposit(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='deposits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    ], default='PENDING')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.status == 'COMPLETED':
            self.wallet.deposit_balance += self.amount  # Updated to add to deposit_balance
            self.wallet.save()

    def __str__(self):
        return f"Deposit of {self.amount} for {self.wallet.user.username}"

@receiver(post_save, sender=CustomUser)
def create_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.create(user=instance)

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('DEPOSIT', 'Deposit'),
        ('PURCHASE', 'Package Purchase'),
        ('COMMISSION', 'Referral Commission'),
        ('EARNING', 'Views Earnings'),  # Optional: For submission earnings
        ('WITHDRAW_PENDING', 'Withdrawal Pending'),
        ('WITHDRAW_COMPLETED', 'Withdrawal Completed'),
        ('WITHDRAW_CANCELLED', 'Withdrawal Cancelled'),
        ('WITHDRAW_REFUND', 'Withdrawal Refund'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.transaction_type} of {self.amount} for {self.user.username} at {self.created_at}"

class Withdrawal(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance_type = models.CharField(max_length=20, choices=[
        ('main_balance', 'Main Balance'),
        ('referral_balance', 'Referral Balance')
    ])
    from_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    from_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled')
    ], default='PENDING')
    pending_transaction = models.ForeignKey(Transaction, null=True, blank=True, on_delete=models.SET_NULL, related_name='withdrawal_pending')

    def save(self, *args, **kwargs):
        if self.pk:  # Update existing instance
            old = Withdrawal.objects.get(pk=self.pk)
            if self.status != old.status:
                if self.status == 'PAID':
                    if self.pending_transaction:
                        self.pending_transaction.transaction_type = 'WITHDRAW_COMPLETED'
                        self.pending_transaction.description = f"Completed withdrawal from {self.balance_type.replace('_', ' ')}"
                        self.pending_transaction.save()
                elif self.status == 'CANCELLED':
                    if self.balance_type == 'referral_balance':
                        self.wallet.referral_balance += self.amount
                    else:
                        self.wallet.deposit_balance += self.from_deposit
                        self.wallet.views_earnings_balance += self.from_earnings
                    self.wallet.save()
                    Transaction.objects.create(
                        user=self.wallet.user,
                        amount=self.amount,
                        transaction_type='WITHDRAW_REFUND',
                        description=f"Refund for cancelled withdrawal from {self.balance_type.replace('_', ' ')}"
                    )
                    if self.pending_transaction:
                        self.pending_transaction.transaction_type = 'WITHDRAW_CANCELLED'
                        self.pending_transaction.description = f"Cancelled withdrawal from {self.balance_type.replace('_', ' ')}"
                        self.pending_transaction.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Withdrawal of {self.amount} from {self.balance_type} for {self.wallet.user.username}"
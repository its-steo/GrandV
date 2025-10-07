from django.db import models
from accounts.models import CustomUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class Wallet(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    deposit_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    views_earnings_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    referral_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    @property
    def main_balance(self):
        return self.deposit_balance + self.views_earnings_balance

    def save(self, *args, **kwargs):
        bypass_commission = kwargs.pop('bypass_commission', False)
        if self.pk and not bypass_commission:  # Only for updates
            try:
                old_wallet = Wallet.objects.get(pk=self.pk)
                deposit_diff = old_wallet.deposit_balance - self.deposit_balance
                if deposit_diff > 0 and self.user.referred_by and self.user.referred_by.is_marketer:
                    with transaction.atomic():
                        commission = Decimal('0.8') * deposit_diff
                        upline = self.user.referred_by
                        upline_wallet, _ = Wallet.objects.get_or_create(user=upline)
                        upline_wallet.referral_balance += commission
                        upline_wallet.save(bypass_commission=True)  # Prevent recursive commission
                        Transaction.objects.create(
                            user=upline,
                            amount=commission,
                            transaction_type='COMMISSION',
                            description=f"Commission from downline {self.user.username}'s deposit deduction of {deposit_diff}"
                        )
                        logger.debug(f"Credited {commission} to upline {upline.username}'s referral_balance")
            except Exception as e:
                logger.error(f"Error in commission logic: {str(e)}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Wallet for {self.user.username}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('PURCHASE', 'Purchase'),
        ('EARNING', 'Earning'),
        ('COMMISSION', 'Commission'),
        ('WITHDRAW_PENDING', 'Withdraw Pending'),
        ('WITHDRAW_COMPLETED', 'Withdraw Completed'),
        ('WITHDRAW_CANCELLED', 'Withdraw Cancelled'),
        ('WITHDRAW_REFUND', 'Withdraw Refund'),
        ('INSTALLMENT_PAYMENT', 'Installment Payment'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.transaction_type} of {self.amount} for {self.user.username}"

class Deposit(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='deposits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    mpesa_code = models.CharField(max_length=20, blank=True, null=True)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.pk:  # Only for updates
            old_deposit = Deposit.objects.get(pk=self.pk)
            if old_deposit.status != 'COMPLETED' and self.status == 'COMPLETED':
                self.wallet.deposit_balance += self.amount
                self.wallet.save(bypass_commission=True)  # Prevent commission on deposit
                Transaction.objects.create(
                    user=self.wallet.user,
                    amount=self.amount,
                    transaction_type='PURCHASE',  # Assuming deposit is treated as purchase for transaction
                    description=f"Deposit of {self.amount} via M-Pesa {self.mpesa_receipt_number or 'unknown'}"
                )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Deposit of {self.amount} for {self.wallet.user.username}"

class Withdrawal(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    balance_type = models.CharField(max_length=20, choices=[('main_balance', 'Main Balance'), ('referral_balance', 'Referral Balance')])
    from_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    from_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    mpesa_number = models.CharField(max_length=15)
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    pending_transaction = models.OneToOneField(Transaction, null=True, blank=True, on_delete=models.SET_NULL, related_name='withdrawal_pending')

    def save(self, *args, **kwargs):
        if self.pk:
            old = Withdrawal.objects.get(pk=self.pk)
            if self.status != old.status:
                if self.status == 'PAID':
                    if self.pending_transaction:
                        self.pending_transaction.transaction_type = 'WITHDRAW_COMPLETED'
                        self.pending_transaction.description = f"Completed withdrawal of {self.net_amount} (after fee {self.fee}) from {self.balance_type.replace('_', ' ')} to M-Pesa {self.mpesa_number}"
                        self.pending_transaction.save()
                elif self.status == 'CANCELLED':
                    if self.pending_transaction:
                        self.pending_transaction.transaction_type = 'WITHDRAW_CANCELLED'
                        self.pending_transaction.description = f"Cancelled withdrawal of {self.amount} from {self.balance_type.replace('_', ' ')}"
                        self.pending_transaction.save()
                    if self.balance_type == 'referral_balance':
                        self.wallet.referral_balance += self.net_amount  # Refund net amount
                    else:
                        self.wallet.deposit_balance += self.from_deposit
                        self.wallet.views_earnings_balance += self.from_earnings
                    self.wallet.save(bypass_commission=True)  # Bypass commission logic
                    Transaction.objects.create(
                        user=self.wallet.user,
                        amount=self.amount,  # Refund original amount
                        transaction_type='WITHDRAW_REFUND',
                        description=f"Refund for cancelled withdrawal of {self.amount} from {self.balance_type.replace('_', ' ')}"
                    )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Withdrawal of {self.amount} (net {self.net_amount}) from {self.balance_type} to M-Pesa {self.mpesa_number} for {self.wallet.user.username}"
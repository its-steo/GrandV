# Updated models.py to add mpesa_number to Withdrawal
from django.db import models
from accounts.models import CustomUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
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
                        try:
                            send_mail(
                                'Downline Deposit Deduction Commission',
                                f'Your downline {self.user.username} had a deposit deduction. Login to check your wallet balance.',
                                settings.DEFAULT_FROM_EMAIL,
                                [upline.email],
                                fail_silently=True,
                            )
                            logger.debug(f"Sent email to upline {upline.email}")
                        except Exception as e:
                            logger.error(f"Failed to send email to {upline.username}: {str(e)}")
            except Wallet.DoesNotExist:
                logger.error(f"Wallet {self.pk} not found during save")
        super().save(*args, **kwargs)

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
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    mpesa_code = models.CharField(max_length=30, blank=True, null=True)  # Increased to 30
    mpesa_receipt_number = models.CharField(max_length=30, blank=True, null=True)  # Increased to 30
    phone_number = models.CharField(max_length=30, blank=True, null=True)  # Increased to 30

    def save(self, *args, **kwargs):
        if self.pk:
            old_deposit = Deposit.objects.get(pk=self.pk)
            old_status = old_deposit.status
        else:
            old_status = None

        super().save(*args, **kwargs)

        if self.status == 'COMPLETED' and old_status != 'COMPLETED':
            # Update wallet directly without triggering commission logic
            self.wallet.deposit_balance += self.amount
            self.wallet.save(bypass_commission=True)
            # Send confirmation email
            send_deposit_email(self.wallet.user, self.amount)

    def __str__(self):
        return f"Deposit of {self.amount} for {self.wallet.user.username}"

def send_deposit_email(user, amount):
    """Send a beautifully designed email for deposit confirmation."""
    subject = 'Deposit Confirmed - GrandView Business Platform'
    html_message = render_to_string('emails/deposit_confirmed.html', {
        'user': user,
        'amount': amount,
    })
    plain_message = f"Dear {user.username},\n\nYour deposit of KSh {amount} has been successfully added to your wallet.\n\nLogin to your GrandView dashboard to check your updated balance.\n\nBest regards,\nGrandView Team"
    try:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Deposit confirmation email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send deposit email to {user.email}: {str(e)}")

def send_withdrawal_email(user, amount, net_amount, mpesa_number):
    """Send a beautifully designed email for withdrawal approval."""
    subject = 'Withdrawal Approved - GrandView Business Platform'
    html_message = render_to_string('emails/withdrawal_approved.html', {
        'user': user,
        'amount': amount,
        'net_amount': net_amount,
        'mpesa_number': mpesa_number,
    })
    plain_message = f"Dear {user.username},\n\nYour withdrawal request of KSh {amount} has been approved. After fees, KSh {net_amount} has been sent to your M-Pesa number {mpesa_number}.\n\nThank you for using GrandView!\n\nBest regards,\nGrandView Team"
    try:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Withdrawal approval email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send withdrawal email to {user.email}: {str(e)}")

@receiver(post_save, sender=CustomUser)
def create_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.create(user=instance)

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('DEPOSIT', 'Deposit'),
        ('PURCHASE', 'Package Purchase'),
        ('COMMISSION', 'Referral Commission'),
        ('EARNING', 'Views Earnings'),
        ('WITHDRAW_PENDING', 'Withdrawal Pending'),
        ('WITHDRAW_COMPLETED', 'Withdrawal Completed'),
        ('WITHDRAW_REFUND', 'Withdrawal Refund'),
        ('WITHDRAW_CANCELLED', 'Withdrawal Cancelled'),
        ('INSTALLMENT_PAYMENT', 'Installment Payment'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    balance_type = models.CharField(
        max_length=20,
        choices=[
            ('deposit', 'Deposit'),
            ('views_earnings', 'Views Earnings'),
            ('referral', 'Referral'),
            ('main', 'Main'),
        ],
        default='deposit'
    )

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount} ({self.balance_type})"

class Withdrawal(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Original requested amount
    net_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Amount after fee
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Fee deducted
    balance_type = models.CharField(max_length=20, choices=[
        ('main_balance', 'Main Balance'),
        ('referral_balance', 'Referral Balance')
    ])
    from_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    from_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    mpesa_number = models.CharField(max_length=30, blank=False, null=False)  # Required M-Pesa number
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled')
    ], default='PENDING')
    pending_transaction = models.ForeignKey(Transaction, null=True, blank=True, on_delete=models.SET_NULL, related_name='withdrawal_pending')

    def save(self, *args, **kwargs):
        if self.pk:
            old = Withdrawal.objects.get(pk=self.pk)
            if self.status != old.status:
                if self.status == 'PAID':
                    if self.pending_transaction:
                        self.pending_transaction.transaction_type = 'WITHDRAW_COMPLETED'
                        self.pending_transaction.description = f"Completed withdrawal of {self.net_amount} (after fee {self.fee}) from {self.balance_type.replace('_', ' ')} to M-Pesa {self.mpesa_number}"
                        self.pending_transaction.save()
                    # Send approval email with net_amount and mpesa_number
                    send_withdrawal_email(self.wallet.user, self.amount, self.net_amount, self.mpesa_number)
                elif self.status == 'CANCELLED':
                    if self.pending_transaction:
                        self.pending_transaction.transaction_type = 'WITHDRAW_CANCELLED'
                        self.pending_transaction.description = f"Cancelled withdrawal of {self.amount} from {self.balance_type.replace('_', ' ')}"
                        self.pending_transaction.save()
                    if self.balance_type == 'referral_balance':
                        self.wallet.referral_balance += self.net_amount  # Refund net amount? Or original? Assuming original since fee not deducted yet
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
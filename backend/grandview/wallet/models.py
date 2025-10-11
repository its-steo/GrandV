from django.db import models
from accounts.models import CustomUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

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
                        # Send email to upline
                        try:
                            context = {
                                'user': upline,
                                'downline_username': self.user.username,
                                'deduction_amount': deposit_diff,
                                'commission': commission,
                                'site_url': settings.SITE_URL,
                            }
                            message = render_to_string('emails/commission_earned.html', context)
                            send_mail(
                                subject='New Referral Commission Earned',
                                message='',
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[upline.email],
                                html_message=message,
                                fail_silently=False,
                            )
                            logger.info(f"Commission email sent to upline {upline.email}")
                        except Exception as e:
                            logger.error(f"Failed to send commission email to {upline.email}: {str(e)}")
            except Exception as e:
                logger.error(f"Commission logic error: {str(e)}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Wallet for {self.user.username}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('DEPOSIT', 'Deposit'),
        ('EARNING', 'Earning'),
        ('COMMISSION', 'Commission'),
        ('PURCHASE', 'Purchase'),
        ('WITHDRAW_PENDING', 'Withdraw Pending'),
        ('WITHDRAW_COMPLETED', 'Withdraw Completed'),
        ('WITHDRAW_CANCELLED', 'Withdraw Cancelled'),
        ('WITHDRAW_REFUND', 'Withdraw Refund'),
    ]

    BALANCE_TYPE_CHOICES = [
        ('VIEWS_EARNINGS', 'Views Earnings'),
        ('DEPOSIT', 'Deposit'),
        ('REFERRAL', 'Referral'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    balance_type = models.CharField(max_length=20, choices=BALANCE_TYPE_CHOICES, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"

@receiver(post_save, sender=CustomUser)
def create_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.create(user=instance)

class Deposit(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='deposits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    mpesa_receipt_number = models.CharField(max_length=20, blank=True, null=True)
    mpesa_code = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=[('PENDING', 'Pending'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed')], default='PENDING')

    def save(self, *args, **kwargs):
        old_status = None
        if self.pk:
            old_deposit = Deposit.objects.get(pk=self.pk)
            old_status = old_deposit.status
        
        super().save(*args, **kwargs)
        
        # Check if status changed to COMPLETED
        if old_status != 'COMPLETED' and self.status == 'COMPLETED':
            self.wallet.deposit_balance += self.amount
            self.wallet.save()
            Transaction.objects.create(
                user=self.wallet.user,
                amount=self.amount,
                transaction_type='DEPOSIT',
                description=f"Deposit of {self.amount} via M-Pesa {self.mpesa_code or self.mpesa_receipt_number or 'manual'}"
            )
            logger.info(f"Deposit {self.pk} completed and wallet updated")
            
            # Send deposit confirmation email
            try:
                context = {
                    'user': self.wallet.user,
                    'amount': self.amount,
                    'mpesa_code': self.mpesa_code,
                    'mpesa_receipt_number': self.mpesa_receipt_number,
                    'phone_number': self.phone_number,
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string('emails/deposit_confirmed.html', context)
                send_mail(
                    subject='Deposit Confirmed - GrandView',
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[self.wallet.user.email],
                    html_message=message,
                    fail_silently=False,
                )
                logger.info(f"Deposit confirmation email sent to {self.wallet.user.email}")
            except Exception as e:
                logger.error(f"Failed to send deposit confirmation email to {self.wallet.user.email}: {str(e)}")

    def __str__(self):
        return f"Deposit of {self.amount} for {self.wallet.user.username} ({self.status})"

class Withdrawal(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_type = models.CharField(max_length=20, choices=Transaction.BALANCE_TYPE_CHOICES)
    from_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    from_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    mpesa_number = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=[('PENDING', 'Pending'), ('PAID', 'Paid'), ('CANCELLED', 'Cancelled')], default='PENDING')
    pending_transaction = models.OneToOneField(Transaction, null=True, blank=True, on_delete=models.SET_NULL, related_name='withdrawal_pending')

    def save(self, *args, **kwargs):
        old_status = None
        if self.pk:
            old = Withdrawal.objects.get(pk=self.pk)
            old_status = old.status
            if self.status != old.status:
                if self.status == 'PAID':
                    if self.pending_transaction:
                        self.pending_transaction.transaction_type = 'WITHDRAW_COMPLETED'
                        self.pending_transaction.description = f"Completed withdrawal of {self.net_amount} (after fee {self.fee}) from {self.balance_type.replace('_', ' ')} to M-Pesa {self.mpesa_number}"
                        self.pending_transaction.save()
                        
                        # Send withdrawal approved email
                        try:
                            context = {
                                'user': self.wallet.user,
                                'amount': self.amount,
                                'net_amount': self.net_amount,
                                'fee': self.fee,
                                'mpesa_number': self.mpesa_number,
                                'balance_type': self.balance_type.replace('_', ' ').title(),
                                'site_url': settings.SITE_URL,
                            }
                            message = render_to_string('emails/withdrawal_approved.html', context)
                            send_mail(
                                subject='Withdrawal Approved - GrandView',
                                message='',
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[self.wallet.user.email],
                                html_message=message,
                                fail_silently=False,
                            )
                            logger.info(f"Withdrawal approval email sent to {self.wallet.user.email}")
                        except Exception as e:
                            logger.error(f"Failed to send withdrawal approved email to {self.wallet.user.email}: {str(e)}")
                            
                elif self.status == 'CANCELLED':
                    if self.pending_transaction:
                        self.pending_transaction.transaction_type = 'WITHDRAW_CANCELLED'
                        self.pending_transaction.description = f"Cancelled withdrawal of {self.amount} from {self.balance_type.replace('_', ' ')}"
                        self.pending_transaction.save()
                    if self.balance_type == 'REFERRAL':
                        self.wallet.referral_balance += self.net_amount  # Refund net amount
                    elif self.balance_type == 'DEPOSIT':
                        self.wallet.deposit_balance += self.from_deposit
                    elif self.balance_type == 'VIEWS_EARNINGS':
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
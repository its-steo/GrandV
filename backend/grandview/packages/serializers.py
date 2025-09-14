from rest_framework import serializers
from .models import Package, Purchase
from accounts.models import CustomUser
from decimal import Decimal
from django.core.mail import send_mail
from wallet.models import Wallet, Transaction
from django.utils import timezone
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'

class PurchaseSerializer(serializers.ModelSerializer):
    package = PackageSerializer(read_only=True)  # Nested for name, rate_per_view
    days_remaining = serializers.SerializerMethodField()

    def get_days_remaining(self, obj):
        # Fixed: Use timezone.now() for aware datetime comparison
        if obj.expiry_date > timezone.now():
            return (obj.expiry_date - timezone.now()).days
        return 0

    class Meta:
        model = Purchase
        fields = ['id', 'package', 'purchase_date', 'expiry_date', 'days_remaining']

class PurchaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = ['package']

    def create(self, validated_data):
        user = self.context['request'].user
        package = validated_data['package']
        logger.debug(f"Processing purchase for user {user.username}, package {package.name}")

        active_purchases = Purchase.objects.filter(user=user, expiry_date__gt=timezone.now()).exists()
        if active_purchases:
            raise serializers.ValidationError("You already have an active package.")

        with transaction.atomic():
            user_wallet, _ = Wallet.objects.get_or_create(user=user)
            price = package.price

            if user.is_marketer:
                if user_wallet.deposit_balance + user_wallet.views_earnings_balance < price:
                    raise serializers.ValidationError("Insufficient main balance.")
                # Deduct first from views_earnings, then deposit
                from_earnings = min(price, user_wallet.views_earnings_balance)
                from_deposit = price - from_earnings
                user_wallet.views_earnings_balance -= from_earnings
                user_wallet.deposit_balance -= from_deposit
            else:
                if user_wallet.deposit_balance < price:
                    raise serializers.ValidationError("Package purchase with views earnings not supported. Please deposit amount to purchase a package.")
                # Deduct only from deposit
                user_wallet.deposit_balance -= price

            user_wallet.save()

            purchase = Purchase.objects.create(user=user, package=package)

            Transaction.objects.create(
                user=user,
                amount=-price,
                transaction_type='PURCHASE',
                description=f"Purchased {package.name}"
            )

            # Handle referral commission (non-critical, outside atomic if needed)
            upline = user.referred_by
            if upline and upline.is_marketer:
                try:
                    commission = Decimal('0.8') * package.price
                    upline_wallet, _ = Wallet.objects.get_or_create(user=upline)
                    upline_wallet.referral_balance += commission
                    upline_wallet.save()
                    logger.debug(f"Credited {commission} to upline {upline.username}'s referral_balance")
                    send_mail(
                        'Downline Package Purchase',
                        f'Your downline {user.username} has purchased a package. Login to check your wallet balance.',
                        'from@example.com',
                        [upline.email],
                        fail_silently=True,  # Prevents rollback on email failure
                    )
                    logger.debug(f"Sent email to upline {upline.email}")
                except Exception as e:
                    logger.error(f"Failed to process upline commission or email for {upline.username}: {str(e)}")
                    # Continue without rolling back purchase/deduction

        return purchase
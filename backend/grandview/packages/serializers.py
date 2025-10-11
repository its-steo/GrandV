from rest_framework import serializers
from .models import Package, Purchase
from accounts.models import CustomUser
from decimal import Decimal
from wallet.models import Wallet, Transaction
from django.utils import timezone
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class PackageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()  # Explicitly define to ensure S3 URL is returned

    class Meta:
        model = Package
        fields = ['id', 'name', 'image', 'validity_days', 'rate_per_view', 'description', 'price']

class PurchaseSerializer(serializers.ModelSerializer):
    package = PackageSerializer(read_only=True)
    days_remaining = serializers.SerializerMethodField()

    def get_days_remaining(self, obj):
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

        with transaction.atomic():
            # Check for existing active purchase to determine if upgrade
            active_purchase = Purchase.objects.filter(user=user, status='ACTIVE').first()
            is_upgrade = False
            is_premium_upgrade = False
            previous_rate = 0

            if active_purchase:
                previous_rate = active_purchase.package.rate_per_view
                if previous_rate < package.rate_per_view:
                    is_upgrade = True
                    if package.rate_per_view == 120:
                        is_premium_upgrade = True

            # Deactivate all existing active purchases for this user
            Purchase.objects.filter(user=user, status='ACTIVE').update(
                status='EXPIRED',
                expiry_date=timezone.now()
            )
            logger.info(f"Deactivated all existing active purchases for user {user.username}")

            # Delete existing purchases for this specific package
            Purchase.objects.filter(user=user, package=package).delete()

            # Always use the full price of the new package
            price = package.price

            # Handle wallet deduction based on marketer status
            user_wallet = Wallet.objects.get(user=user)
            
            if user.is_marketer:
                # Marketers can use views_earnings_balance, falling back to deposit_balance if needed
                if user_wallet.views_earnings_balance >= price:
                    user_wallet.views_earnings_balance -= price
                else:
                    from_earnings = user_wallet.views_earnings_balance
                    from_deposit = price - from_earnings
                    if user_wallet.deposit_balance < from_deposit:
                        raise serializers.ValidationError("Insufficient balance (views earnings + deposit).")
                    user_wallet.views_earnings_balance -= from_earnings
                    user_wallet.deposit_balance -= from_deposit
            else:
                # Non-marketers can only use deposit_balance
                if user_wallet.deposit_balance < price:
                    raise serializers.ValidationError("Insufficient deposit balance. Non-marketers must use deposit balance.")
                user_wallet.deposit_balance -= price

            user_wallet.save()

            purchase = Purchase.objects.create(user=user, package=package)

            Transaction.objects.create(
                user=user,
                amount=-price,
                transaction_type='PURCHASE',
                description=f"Purchased {package.name}"
            )

            return {
                'message': f'Congratulations, you have {"upgraded to" if is_upgrade else "purchased"} the {package.name} package!',
                'purchase_id': purchase.id,
                'is_upgrade': is_upgrade,
                'is_premium_upgrade': is_premium_upgrade,
                'previous_rate': previous_rate
            }
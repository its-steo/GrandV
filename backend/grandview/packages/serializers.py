from rest_framework import serializers
from .models import Package, Purchase, CashbackBonus
from accounts.models import CustomUser
from decimal import Decimal
from wallet.models import Wallet, Transaction
from django.utils import timezone
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class PackageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = Package
        fields = ['id', 'name', 'image', 'validity_days', 'rate_per_view', 'description', 'price']

class PurchaseSerializer(serializers.ModelSerializer):
    package = PackageSerializer(read_only=True)
    days_remaining = serializers.SerializerMethodField()
    bonus_amount = serializers.SerializerMethodField()
    claim_cost = serializers.SerializerMethodField()
    claimed = serializers.SerializerMethodField()

    def get_days_remaining(self, obj):
        if obj.expiry_date > timezone.now():
            return (obj.expiry_date - timezone.now()).days
        return 0

    def get_bonus_amount(self, obj):
        try:
            bonus = obj.cashback_bonus
            return bonus.amount if not bonus.claimed else Decimal('0')
        except CashbackBonus.DoesNotExist:
            return Decimal('0')

    def get_claim_cost(self, obj):
        try:
            bonus = obj.cashback_bonus
            return bonus.claim_cost if not bonus.claimed else Decimal('0')
        except CashbackBonus.DoesNotExist:
            return Decimal('0')

    def get_claimed(self, obj):
        try:
            return obj.cashback_bonus.claimed
        except CashbackBonus.DoesNotExist:
            return False

    class Meta:
        model = Purchase
        fields = ['id', 'package', 'purchase_date', 'expiry_date', 'days_remaining', 'bonus_amount', 'claim_cost', 'claimed']

class PurchaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = ['package']

    def create(self, validated_data):
        user = self.context['request'].user
        package = validated_data['package']
        logger.debug(f"Processing purchase for user {user.username}, package {package.name}")

        with transaction.atomic():
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

            Purchase.objects.filter(user=user, status='ACTIVE').update(
                status='EXPIRED',
                expiry_date=timezone.now()
            )
            logger.info(f"Deactivated all existing active purchases for user {user.username}")

            Purchase.objects.filter(user=user, package=package).delete()

            price = package.price

            user_wallet = Wallet.objects.get(user=user)
            
            if user.is_marketer:
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

            bonus_amount = Decimal('0')
            claim_cost = Decimal('0')
            if package.rate_per_view == 90:
                bonus_amount = Decimal('3000')
                claim_cost = Decimal('1200')
            elif package.rate_per_view == 100:
                bonus_amount = Decimal('6000')
                claim_cost = Decimal('2000')
            elif package.rate_per_view == 120:
                bonus_amount = Decimal('11000')
                claim_cost = Decimal('3000')

            if bonus_amount > 0:
                CashbackBonus.objects.create(
                    user=user,
                    purchase=purchase,
                    amount=bonus_amount,
                    claim_cost=claim_cost
                )

            return {
                'message': f'Congratulations, you have {"upgraded to" if is_upgrade else "purchased"} the {package.name} package!',
                'purchase_id': purchase.id,
                'is_upgrade': is_upgrade,
                'is_premium_upgrade': is_premium_upgrade,
                'previous_rate': previous_rate,
                'bonus_amount': bonus_amount
            }
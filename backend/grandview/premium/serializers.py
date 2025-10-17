# premium/serializers.py (updated)

from rest_framework import serializers
from .models import AgentVerificationPackage, AgentPurchase, WeeklyBonus, CashbackBonus
from accounts.models import CustomUser
from wallet.models import Wallet, Transaction
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
import logging
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

class AgentVerificationPackageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = AgentVerificationPackage
        fields = ['id', 'name', 'image', 'validity_days', 'description', 'price']

class AgentPurchaseSerializer(serializers.ModelSerializer):
    package = AgentVerificationPackageSerializer(read_only=True)
    days_remaining = serializers.SerializerMethodField()

    def get_days_remaining(self, obj):
        if obj.expiry_date > timezone.now():
            return (obj.expiry_date - timezone.now()).days
        return 0

    class Meta:
        model = AgentPurchase
        fields = ['id', 'package', 'purchase_date', 'expiry_date', 'days_remaining']

class AgentPurchaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentPurchase
        fields = ['package']

    def create(self, validated_data):
        user = self.context['request'].user
        package = validated_data['package']
        logger.debug(f"Processing agent purchase for user {user.username}, package {package.name}")

        with transaction.atomic():
            # Check for existing active purchase
            active_purchase = AgentPurchase.objects.filter(user=user, status='ACTIVE').first()
            if active_purchase:
                raise serializers.ValidationError("You already have an active Agent Verification package.")

            # Deduct price from wallet
            user_wallet = Wallet.objects.get(user=user)
            price = package.price
            if user.is_marketer:
                if user_wallet.views_earnings_balance >= price:
                    user_wallet.views_earnings_balance -= price
                else:
                    from_earnings = user_wallet.views_earnings_balance
                    from_deposit = price - from_earnings
                    if user_wallet.deposit_balance < from_deposit:
                        raise serializers.ValidationError("Insufficient balance (views earnings + deposit). Please top up your deposit balance if needed.")
                    user_wallet.views_earnings_balance -= from_earnings
                    user_wallet.deposit_balance -= from_deposit
            else:
                if user_wallet.deposit_balance < price:
                    raise serializers.ValidationError(f"Insufficient deposit balance. Please top up to purchase the verified agent package.")
                user_wallet.deposit_balance -= price

            user_wallet.save()

            # Create AgentPurchase
            purchase = AgentPurchase.objects.create(
                user=user,
                package=package,
                expiry_date=timezone.now() + timezone.timedelta(days=package.validity_days),
                status='ACTIVE'
            )

            # Create CashbackBonus
            CashbackBonus.objects.create(
                user=user,
                agent_purchase=purchase,
                amount=Decimal('21000'),
                claim_cost=Decimal('5000')
            )

            # Create initial WeeklyBonus
            WeeklyBonus.objects.create(
                user=user,
                amount=Decimal('10000'),
                claim_cost=Decimal('2000')
            )

            # Create transaction
            Transaction.objects.create(
                user=user,
                amount=-price,
                transaction_type='AGENT_PURCHASE',
                description=f"Agent Verification package {package.name} purchased for {price}"
            )

            return {
                'message': f'Success! You are now a verified agent.',
                'purchase_id': purchase.id,
                'bonus_amount': Decimal('21000')
            }

class WeeklyBonusSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyBonus
        fields = ['id', 'amount', 'claim_cost', 'claimed', 'claim_date', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        with transaction.atomic():
            if not AgentPurchase.objects.filter(user=user, status='ACTIVE').exists():
                raise serializers.ValidationError("You must have an active Agent Verification package to claim weekly bonuses.")
            last_bonus = WeeklyBonus.objects.filter(user=user).order_by('-created_at').first()
            if last_bonus and (timezone.now() - last_bonus.created_at).days < 7:
                raise serializers.ValidationError("Weekly bonus already issued for this week.")
            return WeeklyBonus.objects.create(user=user)

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if instance.claimed:
            raise serializers.ValidationError("This bonus has already been claimed.")
        with transaction.atomic():
            user_wallet = Wallet.objects.get(user=user)
            claim_cost = instance.claim_cost
            if user.is_marketer:
                if user_wallet.views_earnings_balance >= claim_cost:
                    user_wallet.views_earnings_balance -= claim_cost
                else:
                    from_earnings = user_wallet.views_earnings_balance
                    from_deposit = claim_cost - from_earnings
                    if user_wallet.deposit_balance < from_deposit:
                        raise serializers.ValidationError(f"Insufficient balance (views earnings + deposit) to cover claim cost of KSh {claim_cost}. Please top up your deposit balance if needed.")
                    user_wallet.views_earnings_balance -= from_earnings
                    user_wallet.deposit_balance -= from_deposit
            else:
                if user_wallet.deposit_balance < claim_cost:
                    raise serializers.ValidationError(f"You need to deposit the claim cost amount of KSh {claim_cost} in order to withdraw your bonus.")
                user_wallet.deposit_balance -= claim_cost

            user_wallet.views_earnings_balance += instance.amount
            user_wallet.save()

            if claim_cost > 0:
                Transaction.objects.create(
                    user=user,
                    amount=-claim_cost,
                    transaction_type='CLAIM_FEE',
                    description=f"Claim fee for weekly bonus of {instance.amount}"
                )
            Transaction.objects.create(
                user=user,
                amount=instance.amount,
                transaction_type='WEEKLY_BONUS',
                description=f"Weekly bonus of {instance.amount} claimed"
            )
            instance.claimed = True
            instance.claim_date = timezone.now()
            instance.save()
            try:
                context = {
                    'user': user,
                    'bonus_amount': instance.amount,
                    'claim_cost': claim_cost,
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string('emails/weekly_bonus_claim.html', context)
                send_mail(
                    subject='Weekly Bonus Claimed!',
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send weekly bonus email to {user.email}: {str(e)}")
            return instance

class CashbackBonusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashbackBonus
        fields = ['id', 'amount', 'claim_cost', 'claimed', 'claim_date']

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if instance.claimed:
            raise serializers.ValidationError("This bonus has already been claimed.")
        with transaction.atomic():
            user_wallet = Wallet.objects.get(user=user)
            claim_cost = instance.claim_cost
            if user.is_marketer:
                if user_wallet.views_earnings_balance >= claim_cost:
                    user_wallet.views_earnings_balance -= claim_cost
                else:
                    from_earnings = user_wallet.views_earnings_balance
                    from_deposit = claim_cost - from_earnings
                    if user_wallet.deposit_balance < from_deposit:
                        raise serializers.ValidationError(f"Insufficient balance (views earnings + deposit) to cover claim cost of KSh {claim_cost}. Please top up your deposit balance if needed.")
                    user_wallet.views_earnings_balance -= from_earnings
                    user_wallet.deposit_balance -= from_deposit
            else:
                if user_wallet.deposit_balance < claim_cost:
                    raise serializers.ValidationError(f"You need to deposit the claim cost amount of KSh {claim_cost} in order to withdraw your bonus.")
                user_wallet.deposit_balance -= claim_cost

            user_wallet.views_earnings_balance += instance.amount
            user_wallet.save()

            Transaction.objects.create(
                user=user,
                amount=-claim_cost,
                transaction_type='CLAIM_FEE',
                description=f"Claim fee for cashback bonus of {instance.amount}"
            )
            Transaction.objects.create(
                user=user,
                amount=instance.amount,
                transaction_type='CASHBACK',
                description=f"Cashback bonus of {instance.amount} claimed"
            )
            instance.claimed = True
            instance.claim_date = timezone.now()
            instance.save()
            try:
                context = {
                    'user': user,
                    'bonus_amount': instance.amount,
                    'claim_cost': claim_cost,
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string('emails/cashback_claim.html', context)
                send_mail(
                    subject='Cashback Bonus Claimed!',
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send cashback bonus email to {user.email}: {str(e)}")
            return instance
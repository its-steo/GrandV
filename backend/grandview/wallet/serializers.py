# Updated serializers.py to deduct full amount and calculate fee after
from rest_framework import serializers
from .models import Wallet, Transaction, Withdrawal, Deposit
from packages.models import Purchase
from django.utils import timezone
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class WalletSerializer(serializers.ModelSerializer):
    main_balance = serializers.SerializerMethodField()
    deposit_balance = serializers.ReadOnlyField()
    views_earnings_balance = serializers.ReadOnlyField()

    def get_main_balance(self, obj):
        return obj.deposit_balance + obj.views_earnings_balance

    class Meta:
        model = Wallet
        fields = ['main_balance', 'referral_balance', 'deposit_balance', 'views_earnings_balance']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['amount', 'transaction_type', 'created_at', 'description']

class DepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    deposit_method = serializers.ChoiceField(choices=['stk', 'manual'])
    phone_number = serializers.CharField(max_length=15, allow_blank=True, required=False)
    mpesa_code = serializers.CharField(max_length=20, allow_blank=True, required=False)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value

    def validate(self, attrs):
        method = attrs.get('deposit_method')
        if method == 'stk' and not attrs.get('phone_number'):
            raise serializers.ValidationError("Phone number is required for STK push deposit.")
        if method == 'manual' and not attrs.get('mpesa_code'):
            raise serializers.ValidationError("M-Pesa transaction code is required for manual deposit.")
        if method not in ['stk', 'manual']:
            raise serializers.ValidationError("Invalid deposit method.")
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        wallet, _ = Wallet.objects.get_or_create(user=user)
        amount = validated_data['amount']
        method = validated_data['deposit_method']
        deposit = Deposit.objects.create(wallet=wallet, amount=amount, status='PENDING')

        if method == 'stk':
            phone = validated_data['phone_number']
            # Format phone to 254... if necessary (assume user provides correct format)
            from wallet.payment import PaymentClient  # Import here to avoid circular
            client = PaymentClient()
            transaction_ref = f"DEP{deposit.pk}"
            response = client.initiate_stk_push(phone, amount, transaction_ref)
            if response.get('ResponseCode') == '0':
                deposit.transaction_id = response['CheckoutRequestID']
                deposit.phone_number = phone
                deposit.save()
                Transaction.objects.create(
                    user=user,
                    amount=amount,
                    transaction_type='DEPOSIT',
                    description=f"STK Push initiated for {amount} (Pending confirmation)",
                    balance_type='deposit'
                )
                return {'message': 'STK Push initiated successfully. Check your phone for PIN prompt.', 'checkout_id': response['CheckoutRequestID']}
            else:
                deposit.delete()
                raise serializers.ValidationError(f"Failed to initiate STK Push: {response.get('error', 'Unknown error')}")
        elif method == 'manual':
            deposit.mpesa_code = validated_data['mpesa_code']
            deposit.save()
            Transaction.objects.create(
                user=user,
                amount=amount,
                transaction_type='DEPOSIT',
                description=f"Manual deposit submitted for approval: {validated_data['mpesa_code']}",
                balance_type='deposit'
            )
            return {'message': 'Manual deposit submitted for admin approval. You will be notified via email once approved.', 'deposit_id': deposit.pk}
        else:
            raise serializers.ValidationError("Invalid deposit method.")

class WithdrawSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    mpesa_number = serializers.CharField(max_length=15, required=True)  # New required field

    def validate_amount(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("Amount must be positive.")
        return value

    def validate_mpesa_number(self, value):
        if not value.startswith('254') or len(value) != 12:
            raise serializers.ValidationError("Invalid M-Pesa number format. Use 254xxxxxxxxx")
        return value

    def validate(self, data):
        user = self.context['request'].user
        wallet, _ = Wallet.objects.get_or_create(user=user)
        balance_type = self.context.get('balance_type', 'main_balance')

        # Check package for views earnings withdrawal restriction
        if balance_type == 'main_balance':
            active_purchase = Purchase.objects.filter(
                user=user,
                expiry_date__gt=timezone.now()
            ).order_by('-purchase_date').first()
            if active_purchase and active_purchase.package.rate_per_view in [90, 100]:
                raise serializers.ValidationError(
                    "You are not eligible for views withdrawal. Upgrade your account to withdraw your earnings."
                )
            if wallet.deposit_balance + wallet.views_earnings_balance < data['amount']:
                raise serializers.ValidationError("Insufficient main balance.")
        else:
            if wallet.referral_balance < data['amount']:
                raise serializers.ValidationError("Insufficient referral balance.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        wallet, _ = Wallet.objects.get_or_create(user=user)
        balance_type = self.context.get('balance_type', 'main_balance')
        amount = validated_data['amount']
        mpesa_number = validated_data['mpesa_number']

        # Deduct full amount first
        from_deposit = Decimal('0')
        from_earnings = Decimal('0')

        if balance_type == 'main_balance':
            from_earnings = min(amount, wallet.views_earnings_balance)
            from_deposit = amount - from_earnings
            wallet.views_earnings_balance -= from_earnings
            wallet.deposit_balance -= from_deposit
        else:
            wallet.referral_balance -= amount

        # Now calculate fee on the withdrawn amount
        if balance_type == 'referral_balance' and user.is_marketer:
            fee = amount * Decimal('0.05')
            net_amount = amount - fee
        else:
            fee = Decimal('0')
            net_amount = amount

        wallet.save()

        pending_tx = Transaction.objects.create(
            user=user,
            amount=-amount,  # Record full withdrawn amount as negative
            transaction_type='WITHDRAW_PENDING',
            description=f"Pending withdrawal of {amount} (fee {fee}, net payout {net_amount}) from {balance_type.replace('_', ' ')} to M-Pesa {mpesa_number}"
        )

        withdrawal = Withdrawal.objects.create(
            wallet=wallet,
            amount=amount,
            net_amount=net_amount,
            fee=fee,
            balance_type=balance_type,
            from_deposit=from_deposit,
            from_earnings=from_earnings,
            mpesa_number=mpesa_number,
            pending_transaction=pending_tx
        )

        return {
            'message': f"Withdrawal requested (Pending approval) for {net_amount} after {'5% fee' if fee else 'no fee'}",
            'amount': net_amount,
            'request_id': withdrawal.id
        }
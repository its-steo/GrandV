from rest_framework import serializers
from .models import Wallet, Transaction, Withdrawal
from django.utils import timezone
from decimal import Decimal

class WalletSerializer(serializers.ModelSerializer):
    main_balance = serializers.SerializerMethodField()
    deposit_balance = serializers.ReadOnlyField()  # Added: Direct field
    views_earnings_balance = serializers.ReadOnlyField()  # Added: Direct field

    def get_main_balance(self, obj):
        return obj.deposit_balance + obj.views_earnings_balance

    class Meta:
        model = Wallet
        fields = ['main_balance', 'referral_balance', 'deposit_balance', 'views_earnings_balance']  # Added details

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['amount', 'transaction_type', 'created_at', 'description']

class DepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def create(self, validated_data):
        user = self.context['request'].user
        wallet, _ = Wallet.objects.get_or_create(user=user)
        amount = validated_data['amount']
        if amount <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        wallet.deposit_balance += amount  # Fixed: Add to deposit_balance, not main_balance
        wallet.save()
        # Log transaction
        Transaction.objects.create(
            user=user,
            amount=amount,
            transaction_type='DEPOSIT',
            description=f"Deposited {amount} to deposit balance"
        )
        return {'message': 'Deposit successful', 'amount': amount, 'new_balance': wallet.main_balance}

class WithdrawSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_amount(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("Amount must be positive.")
        return value

    def validate(self, data):
        user = self.context['request'].user
        wallet, _ = Wallet.objects.get_or_create(user=user)
        balance_type = self.context.get('balance_type', 'main_balance')  # From view context
        if balance_type == 'main_balance':
            if wallet.deposit_balance + wallet.views_earnings_balance < data['amount']:
                raise serializers.ValidationError("Insufficient main balance.")
        else:
            if wallet.referral_balance < data['amount']:
                raise serializers.ValidationError("Insufficient referral balance.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        wallet, _ = Wallet.objects.get_or_create(user=user)
        balance_type = self.context.get('balance_type', 'main_balance')  # Fetch from context
        amount = validated_data['amount']
        from_deposit = Decimal('0')
        from_earnings = Decimal('0')

        if balance_type == 'main_balance':
            # Deduct from views_earnings_balance first, then deposit_balance
            from_earnings = min(amount, wallet.views_earnings_balance)
            from_deposit = amount - from_earnings
            wallet.views_earnings_balance -= from_earnings
            wallet.deposit_balance -= from_deposit
        else:
            wallet.referral_balance -= amount

        wallet.save()

        # Create pending transaction
        pending_tx = Transaction.objects.create(
            user=user,
            amount=-amount,
            transaction_type='WITHDRAW_PENDING',
            description=f"Pending withdrawal from {balance_type.replace('_', ' ')}"
        )

        # Create withdrawal record
        withdrawal = Withdrawal.objects.create(
            wallet=wallet,
            amount=amount,
            balance_type=balance_type,
            from_deposit=from_deposit,
            from_earnings=from_earnings,
            pending_transaction=pending_tx
        )

        return {'message': 'Withdrawal requested (Pending approval)', 'amount': amount, 'request_id': withdrawal.id}
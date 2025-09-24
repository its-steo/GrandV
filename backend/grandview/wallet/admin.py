# Updated admin.py to show mpesa_number and net_amount
from django.contrib import admin
from .models import Wallet, Deposit, Transaction, Withdrawal

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'main_balance', 'referral_balance')
    search_fields = ('user__username',)

@admin.register(Deposit)
class DepositAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'amount', 'deposit_date', 'status', 'mpesa_code', 'mpesa_receipt_number')
    list_filter = ('status',)
    search_fields = ('wallet__user__username', 'mpesa_code', 'mpesa_receipt_number')
    actions = ['mark_as_completed', 'mark_as_failed']

    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='COMPLETED')
        for deposit in queryset:
            deposit.save()  # Trigger balance update and email
        self.message_user(request, f'{updated} deposit(s) marked as completed.')
    mark_as_completed.short_description = "Mark selected deposits as completed"

    def mark_as_failed(self, request, queryset):
        updated = queryset.update(status='FAILED')
        self.message_user(request, f'{updated} deposit(s) marked as failed.')
    mark_as_failed.short_description = "Mark selected deposits as failed"

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'transaction_type', 'created_at', 'description')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__username', 'description')
    date_hierarchy = 'created_at'

@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'amount', 'net_amount', 'fee', 'mpesa_number', 'balance_type', 'request_date', 'status')
    list_filter = ('status', 'balance_type')
    search_fields = ('wallet__user__username', 'mpesa_number')
    actions = ['mark_as_paid', 'mark_as_cancelled']

    def mark_as_paid(self, request, queryset):
        updated = 0
        for withdrawal in queryset.filter(status='PENDING'):
            withdrawal.status = 'PAID'
            withdrawal.save()  # Triggers email
            updated += 1
        self.message_user(request, f'{updated} withdrawal(s) marked as paid.')
    mark_as_paid.short_description = "Mark selected as paid"

    def mark_as_cancelled(self, request, queryset):
        updated = 0
        for withdrawal in queryset.filter(status='PENDING'):
            withdrawal.status = 'CANCELLED'
            withdrawal.save()
            updated += 1
        self.message_user(request, f'{updated} withdrawal(s) marked as cancelled.')
    mark_as_cancelled.short_description = "Mark selected as cancelled"
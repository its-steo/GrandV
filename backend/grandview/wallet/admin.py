from django.contrib import admin
from .models import Wallet, Deposit, Transaction, Withdrawal

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'main_balance', 'referral_balance')
    search_fields = ('user__username',)

@admin.register(Deposit)
class DepositAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'amount', 'deposit_date', 'status')
    list_filter = ('status',)
    search_fields = ('wallet__user__username',)
    actions = ['mark_as_completed']

    def mark_as_completed(self, request, queryset):
        queryset.update(status='COMPLETED')
        for deposit in queryset:
            deposit.save()  # Trigger balance update
    mark_as_completed.short_description = "Mark selected deposits as completed"

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'transaction_type', 'created_at', 'description')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__username', 'description')
    date_hierarchy = 'created_at'

@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'amount', 'balance_type', 'request_date', 'status')
    list_filter = ('status', 'balance_type')
    search_fields = ('wallet__user__username',)
    actions = ['mark_as_paid', 'mark_as_cancelled']

    def mark_as_paid(self, request, queryset):
        for withdrawal in queryset.filter(status='PENDING'):
            withdrawal.status = 'PAID'
            withdrawal.save()

    mark_as_paid.short_description = "Mark selected as paid"

    def mark_as_cancelled(self, request, queryset):
        for withdrawal in queryset.filter(status='PENDING'):
            withdrawal.status = 'CANCELLED'
            withdrawal.save()

    mark_as_cancelled.short_description = "Mark selected as cancelled"
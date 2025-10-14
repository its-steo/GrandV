from django.contrib import admin
from .models import Package, Purchase, CashbackBonus

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'rate_per_view', 'price', 'validity_days')
    search_fields = ('name',)

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'package', 'purchase_date', 'expiry_date')
    list_filter = ('package',)
    search_fields = ('user__username',)

@admin.register(CashbackBonus)
class CashbackBonusAdmin(admin.ModelAdmin):
    list_display = ('user', 'purchase', 'amount', 'claim_cost', 'claimed', 'claim_date')
    list_filter = ('claimed',)
    search_fields = ('user__username',)
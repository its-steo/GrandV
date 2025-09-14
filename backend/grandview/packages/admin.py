from django.contrib import admin
from .models import Package, Purchase

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'rate_per_view', 'price', 'validity_days')
    search_fields = ('name',)

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'package', 'purchase_date', 'expiry_date')
    list_filter = ('package',)
    search_fields = ('user__username',)
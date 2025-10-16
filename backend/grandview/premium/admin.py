# premium/admin.py
import logging
from django.contrib import admin
from django.utils import timezone
from .models import AgentVerificationPackage, AgentPurchase, WeeklyBonus, CashbackBonus

logger = logging.getLogger(__name__)

@admin.register(AgentVerificationPackage)
class AgentVerificationPackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'validity_days')
    search_fields = ('name',)

@admin.register(AgentPurchase)
class AgentPurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'package', 'purchase_date', 'expiry_date', 'status')
    list_filter = ('status',)
    search_fields = ('user__username',)

@admin.register(CashbackBonus)
class CashbackBonusAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'claim_cost', 'claimed', 'claim_date')
    list_filter = ('claimed',)
    search_fields = ('user__username',)

@admin.register(WeeklyBonus)
class WeeklyBonusAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'claimed', 'claim_date', 'created_at')
    list_filter = ('claimed',)
    search_fields = ('user__username',)
    actions = ['create_weekly_bonuses']

    def create_weekly_bonuses(self, request, queryset):
        active_purchases = AgentPurchase.objects.filter(status='ACTIVE')
        created = 0
        for purchase in active_purchases:
            user = purchase.user
            last_bonus = WeeklyBonus.objects.filter(user=user).order_by('-created_at').first()
            if not last_bonus or (timezone.now() - last_bonus.created_at).days >= 7:
                WeeklyBonus.objects.create(user=user)
                logger.info(f"Created weekly bonus for user {user.username}")
                created += 1
        self.message_user(request, f"Created {created} weekly bonuses.")
    create_weekly_bonuses.short_description = "Create weekly bonuses for eligible users"

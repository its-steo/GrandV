from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone_number', 'referral_code', 'referred_by', 'is_marketer', 'get_downline_count')
    list_filter = ('referred_by', 'is_marketer', 'is_verified_agent')
    search_fields = ('username', 'email', 'phone_number', 'referral_code')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal Info', {'fields': ('phone_number', 'referral_code', 'referred_by', 'is_marketer', 'is_verified_agent')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone_number', 'password1', 'password2'),
        }),
    )
    readonly_fields = ('referral_code',)
    ordering = ('username',)

    def get_downline_count(self, obj):
        return obj.referrals.count()
    get_downline_count.short_description = 'Downlines'

admin.site.register(CustomUser, CustomUserAdmin)
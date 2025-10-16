from django.urls import path
from .views import (
    AgentVerificationPackageListView, 
    AgentPurchaseView, 
    UserAgentPurchasesView, 
    WeeklyBonusClaimView, 
    CashbackClaimView,
    UserCashbackBonusesView,  # Added new import
    UserWeeklyBonusesView,    # Added new import
)

urlpatterns = [
    path('premium/packages/', AgentVerificationPackageListView.as_view(), name='agent_package_list'),
    path('premium/purchase/', AgentPurchaseView.as_view(), name='agent_purchase'),
    path('premium/purchases/', UserAgentPurchasesView.as_view(), name='user_agent_purchases'),
    path('premium/cashback/', UserCashbackBonusesView.as_view(), name='user_cashback_bonuses'),
    path('premium/weekly-bonus/', UserWeeklyBonusesView.as_view(), name='user_weekly_bonuses'),
    path('premium/weekly-bonus/claim/', WeeklyBonusClaimView.as_view(), name='weekly_bonus_claim'),
    path('premium/cashback/claim/', CashbackClaimView.as_view(), name='cashback_claim'),
]

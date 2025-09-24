# Updated urls.py
from django.urls import path
from .views import WalletView, WithdrawMainView, WithdrawReferralView, TransactionHistoryView, DepositView, CallbackView

urlpatterns = [
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('wallet/deposit/', DepositView.as_view(), name='deposit'),
    path('wallet/withdraw/main/', WithdrawMainView.as_view(), name='withdraw_main'),
    path('wallet/withdraw/referral/', WithdrawReferralView.as_view(), name='withdraw_referral'),
    path('wallet/transactions/', TransactionHistoryView.as_view(), name='transactions'),
    path('callback/', CallbackView.as_view(), name='mpesa_callback'),
]
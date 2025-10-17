from django.urls import path
from .views import RegisterView, LoginView, UserUpdateView, ReferralStatsView, PasswordChangeView, VerifyEmailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/update/', UserUpdateView.as_view(), name='user_update'),
    path('users/referral-stats/', ReferralStatsView.as_view(), name='referral_stats'),
    path('users/change-password/', PasswordChangeView.as_view(), name='change_password'),
    path('users/verify-email/', VerifyEmailView.as_view(), name='verify_email'),
]
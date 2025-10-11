# adverts/urls.py
from django.urls import path
from django.views.decorators.csrf import csrf_exempt  # Add this import
from .views import AdvertListView, AdvertDownloadView, SubmissionView, SubmissionHistoryView, WithdrawalView,TransactionHistoryView

urlpatterns = [
    path('adverts/', AdvertListView.as_view(), name='advert_list'),
    path('adverts/<int:pk>/download/', AdvertDownloadView.as_view(), name='advert_download'),
    path('adverts/submit/', csrf_exempt(SubmissionView.as_view()), name='advert_submit'),  # Add csrf_exempt here
    path('submissions/', csrf_exempt(SubmissionHistoryView.as_view()), name='submission_history'),  # Add csrf_exempt here
    path('withdraw/', csrf_exempt(WithdrawalView.as_view()), name='withdraw'),  # New endpoint
    path('transactions/', TransactionHistoryView.as_view(), name='transaction_history'),
]
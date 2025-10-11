# adverts/urls.py
from django.urls import path
from django.views.decorators.csrf import csrf_exempt  # Add this import
from .views import AdvertListView, AdvertDownloadView, SubmissionView, SubmissionHistoryView

urlpatterns = [
    path('adverts/', AdvertListView.as_view(), name='advert_list'),
    path('adverts/<int:pk>/download/', AdvertDownloadView.as_view(), name='advert_download'),
    path('adverts/submit/', csrf_exempt(SubmissionView.as_view()), name='advert_submit'),  # Add csrf_exempt here
    path('submissions/', (SubmissionHistoryView.as_view()), name='submission_history'),  # Add csrf_exempt here
]
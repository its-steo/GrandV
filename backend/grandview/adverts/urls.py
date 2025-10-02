from django.urls import path
from .views import AdvertListView, AdvertDownloadView, SubmissionView, SubmissionHistoryView  # Added SubmissionHistoryView

urlpatterns = [
    path('adverts/', AdvertListView.as_view(), name='advert_list'),
    path('adverts/<int:pk>/download/', AdvertDownloadView.as_view(), name='advert_download'),
    path('adverts/submit/', SubmissionView.as_view(), name='advert_submit'),
    path('submissions/', SubmissionHistoryView.as_view(), name='submission_history'),  # Added
]
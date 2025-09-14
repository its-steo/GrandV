from django.urls import path
from .views import AdvertListView, AdvertDownloadView, SubmissionView

urlpatterns = [
    path('adverts/', AdvertListView.as_view(), name='advert_list'),
    path('adverts/<int:pk>/download/', AdvertDownloadView.as_view(), name='advert_download'),
    path('adverts/submit/', SubmissionView.as_view(), name='advert_submit'),
]
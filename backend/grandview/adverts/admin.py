from django.contrib import admin
from .models import Advert, Submission

@admin.register(Advert)
class AdvertAdmin(admin.ModelAdmin):
    list_display = ('title', 'rate_category', 'upload_date')
    list_filter = ('rate_category',)
    search_fields = ('title',)

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'advert', 'views_count', 'earnings', 'submission_date')
    list_filter = ('advert__rate_category',)
    search_fields = ('user__username',)
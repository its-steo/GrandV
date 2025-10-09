# adverts/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Advert, Submission

@admin.register(Advert)
class AdvertAdmin(admin.ModelAdmin):
    list_display = ('title', 'rate_category', 'upload_date', 'file_url')
    list_filter = ('rate_category',)
    search_fields = ('title',)

    def file_url(self, obj):
        try:
            if obj.file and obj.file.name:  # Check if file and file.name are valid
                return format_html('<a href="{}" target="_blank">View File</a>', obj.file.url)
            return "No file"
        except Exception as e:
            return f"Error: {str(e)}"
    file_url.short_description = "File URL"

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'advert', 'views_count', 'earnings', 'submission_date', 'screenshot_url')
    list_filter = ('advert__rate_category',)
    search_fields = ('user__username',)

    def screenshot_url(self, obj):
        if obj.screenshot and obj.screenshot.name:  # Add similar check for screenshot
            return format_html('<a href="{}" target="_blank">View Screenshot</a>', obj.screenshot.url)
        return "No screenshot"
    screenshot_url.short_description = "Screenshot URL"
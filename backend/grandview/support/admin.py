from django.contrib import admin
from .models import SupportMessage, SupportComment, SupportLike, SupportMute, SupportBlock, PrivateMessage

@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'created_at', 'is_private', 'is_pinned')
    list_filter = ('is_private', 'is_pinned')
    search_fields = ('user__username', 'content')

@admin.register(SupportComment)
class SupportCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'content', 'created_at')
    search_fields = ('user__username', 'content')

@admin.register(SupportLike)
class SupportLikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'created_at')
    search_fields = ('user__username',)

@admin.register(SupportMute)
class SupportMuteAdmin(admin.ModelAdmin):
    list_display = ('user', 'muted_by', 'created_at', 'expires_at')
    search_fields = ('user__username', 'muted_by__username')

@admin.register(SupportBlock)
class SupportBlockAdmin(admin.ModelAdmin):
    list_display = ('user', 'blocked_by', 'created_at')
    search_fields = ('user__username', 'blocked_by__username')

@admin.register(PrivateMessage)
class PrivateMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'created_at')
    search_fields = ('sender__username', 'receiver__username', 'content')
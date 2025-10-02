from rest_framework import serializers
from .models import SupportMessage, SupportComment, SupportLike, SupportMute, SupportBlock, PrivateMessage
from accounts.models import CustomUser
from django.utils import timezone
from datetime import timedelta
import re

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'phone_number', 'referral_code', 'is_manager', 'is_staff']

class SupportMessageSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    unread_comment_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportMessage
        fields = ['id', 'user', 'content', 'image', 'created_at', 'is_private', 'is_pinned', 'like_count', 'is_liked', 'comment_count', 'unread_comment_count']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_unread_comment_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Assume comments are unread if created after the user's last view
            last_viewed = request.user.last_support_view or timezone.now() - timedelta(days=30)
            return obj.comments.filter(created_at__gt=last_viewed).count()
        return 0

    def validate(self, data):
        user = self.context['request'].user
        active_mute = SupportMute.objects.filter(
            user=user, expires_at__gt=timezone.now()
        ).exists()
        if active_mute:
            raise serializers.ValidationError("You are muted and cannot post messages.")
        if SupportBlock.objects.filter(user=user).exists():
            raise serializers.ValidationError("You are blocked and cannot post messages.")
        return data

class SupportCommentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    parent_comment = serializers.PrimaryKeyRelatedField(
        queryset=SupportComment.objects.all(),
        allow_null=True,
        required=False
    )
    mentioned_users = serializers.SerializerMethodField()

    class Meta:
        model = SupportComment
        fields = ['id', 'message', 'user', 'content', 'created_at', 'parent_comment', 'mentioned_users']
        read_only_fields = ['user', 'message', 'created_at', 'mentioned_users']

    def get_mentioned_users(self, obj):
        mentions = re.findall(r'@(\w+)', obj.content)
        users = CustomUser.objects.filter(username__in=mentions).values('id', 'username')
        return list(users)

    def validate(self, data):
        user = self.context['request'].user
        message = self.context.get('message')
        active_mute = SupportMute.objects.filter(
            user=user, expires_at__gt=timezone.now()
        ).exists()
        if active_mute:
            raise serializers.ValidationError("You are muted and cannot post comments.")
        if SupportBlock.objects.filter(user=user).exists():
            raise serializers.ValidationError("You are blocked and cannot post comments.")
        parent_comment = data.get('parent_comment')
        if parent_comment:
            if parent_comment.message != message:
                raise serializers.ValidationError("Parent comment must belong to the same message.")
        mentions = re.findall(r'@(\w+)', data['content'])
        for mention in mentions:
            if not CustomUser.objects.filter(username=mention).exists():
                raise serializers.ValidationError(f"User @{mention} does not exist.")
        return data

class SupportLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportLike
        fields = ['id', 'message', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']
        unique_together = ('message', 'user')

    def validate(self, data):
        user = self.context['request'].user
        active_mute = SupportMute.objects.filter(
            user=user, expires_at__gt=timezone.now()
        ).exists()
        if active_mute:
            raise serializers.ValidationError("You are muted and cannot like messages.")
        if SupportBlock.objects.filter(user=user).exists():
            raise serializers.ValidationError("You are blocked and cannot like messages.")
        if SupportLike.objects.filter(message=data['message'], user=user).exists():
            raise serializers.ValidationError("You have already liked this message.")
        return data

class SupportMuteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportMute
        fields = ['id', 'user', 'muted_by', 'expires_at']

    def validate(self, data):
        if not self.context['request'].user.is_staff:
            raise serializers.ValidationError("Only admins can mute users.")
        data['muted_by'] = self.context['request'].user
        data['expires_at'] = timezone.now() + timedelta(days=7)
        return data

class SupportBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportBlock
        fields = ['id', 'user', 'blocked_by']

    def validate(self, data):
        if not self.context['request'].user.is_staff:
            raise serializers.ValidationError("Only admins can block users.")
        data['blocked_by'] = self.context['request'].user
        return data

class PrivateMessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    receiver = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())

    class Meta:
        model = PrivateMessage
        fields = ['id', 'sender', 'receiver', 'content', 'image', 'created_at', 'read_at']

    def validate(self, data):
        user = self.context['request'].user
        active_mute = SupportMute.objects.filter(user=user, expires_at__gt=timezone.now()).exists()
        if active_mute:
            raise serializers.ValidationError("You are muted and cannot send messages.")
        if SupportBlock.objects.filter(user=user).exists():
            raise serializers.ValidationError("You are blocked and cannot send messages.")
        receiver = data.get('receiver')
        if not receiver:
            raise serializers.ValidationError({"receiver": "Receiver is required."})
        if receiver == user:
            raise serializers.ValidationError({"receiver": "You cannot send a message to yourself."})
        if not CustomUser.objects.filter(id=receiver.id).exists():
            raise serializers.ValidationError({"receiver": f"User with ID {receiver.id} does not exist."})
        return data
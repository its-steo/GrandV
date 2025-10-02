from django.db import models
from accounts.models import CustomUser
from django.utils import timezone
from django.core.exceptions import ValidationError

class SupportMessage(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='support_messages')
    content = models.TextField(max_length=1000, blank=True)
    image = models.ImageField(upload_to='support/images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_private = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)

    def clean(self):
        if not self.content and not self.image:
            raise ValidationError("Message must have content or an image.")
        if self.image and self.image.size > 5 * 1024 * 1024:
            raise ValidationError("Image size must not exceed 5MB.")

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"

class SupportComment(models.Model):
    message = models.ForeignKey(SupportMessage, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    parent_comment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

    def __str__(self):
        return f"Comment by {self.user.username} on {self.message.id}"

class SupportLike(models.Model):
    message = models.ForeignKey(SupportMessage, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')

    def __str__(self):
        return f"{self.user.username} liked {self.message.id}"

class SupportMute(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    muted_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='muted_users')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.user.username} muted by {self.muted_by.username}"

class SupportBlock(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    blocked_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='blocked_users')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} blocked by {self.blocked_by.username}"
    
class PrivateMessage(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_privates')
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_privates')
    content = models.TextField(max_length=1000, blank=True)
    image = models.ImageField(upload_to='private/images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if not self.content and not self.image:
            raise ValidationError("Message must have content or an image.")
        if self.image and self.image.size > 5 * 1024 * 1024:
            raise ValidationError("Image size must not exceed 5MB.")

    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username}: {self.content[:50]}"
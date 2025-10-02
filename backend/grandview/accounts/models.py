
from django.db import models
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
import uuid

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = PhoneNumberField(unique=True, blank=False)
    referral_code = models.CharField(max_length=8, unique=True, editable=False)
    referred_by = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='referrals')
    is_marketer = models.BooleanField(default=False)
    is_manager = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = str(uuid.uuid4())[:8].upper()  # e.g., "ABC12345"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
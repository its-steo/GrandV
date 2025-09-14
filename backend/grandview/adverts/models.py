from django.db import models
from accounts.models import CustomUser
from packages.models import Package
from wallet.models import Wallet
from decimal import Decimal
from datetime import datetime
from django.utils import timezone  # Add this import for timezone-aware now()
from django.core.exceptions import ValidationError  # Add this for admin-friendly error

RATE_CHOICES = [
    (90, '90 per view'),
    (100, '100 per view'),
    (120, '120 per view'),
]

class Advert(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='adverts/')
    rate_category = models.IntegerField(choices=RATE_CHOICES)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Submission(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    advert = models.ForeignKey(Advert, on_delete=models.CASCADE)
    views_count = models.PositiveIntegerField(default=1)
    screenshot = models.FileField(upload_to='submissions/')
    submission_date = models.DateTimeField(auto_now_add=True)
    earnings = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('user', 'advert', 'submission_date')

    def __str__(self):
        return f"{self.user.username} - {self.advert.title} - {self.submission_date}"

    def save(self, *args, **kwargs):
        # Removed: Wallet update and Transaction creation (handled in SubmissionView.post)
        # Only save submission data
        super().save(*args, **kwargs)
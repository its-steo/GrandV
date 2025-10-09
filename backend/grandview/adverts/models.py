# adverts/models.py
from django.db import models
from grandview.settings import S3MediaStorage  # Import the custom storage class
from accounts.models import CustomUser
from packages.models import Package
from wallet.models import Wallet
from decimal import Decimal
from django.utils import timezone
from django.core.exceptions import ValidationError

RATE_CHOICES = [
    (90, '90 per view'),
    (100, '100 per view'),
    (120, '120 per view'),
]

class Advert(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='adverts/', storage=S3MediaStorage())  # Use custom S3MediaStorage
    rate_category = models.IntegerField(choices=RATE_CHOICES)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Submission(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    advert = models.ForeignKey(Advert, on_delete=models.CASCADE)
    views_count = models.PositiveIntegerField(default=1)
    screenshot = models.FileField(upload_to='submissions/')  # Uses default local storage
    submission_date = models.DateTimeField(auto_now_add=True)
    earnings = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('user', 'advert', 'submission_date')

    def __str__(self):
        return f"{self.user.username} - {self.advert.title} - {self.submission_date}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
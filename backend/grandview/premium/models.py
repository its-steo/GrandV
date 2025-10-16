# premium/models.py
from django.db import models
from accounts.models import CustomUser
from django.utils import timezone
from datetime import timedelta
from grandview.settings import S3MediaStorage
import logging

logger = logging.getLogger(__name__)

class AgentVerificationPackage(models.Model):
    name = models.CharField(max_length=100, default="Agent Verification")
    image = models.ImageField(upload_to='premium_packages/', storage=S3MediaStorage(default_acl='public-read'))
    validity_days = models.IntegerField(default=365)
    description = models.TextField(default="Become a verified agent to unlock withdrawals and exclusive weekly bonuses.")
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class AgentPurchase(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='agent_purchases')
    package = models.ForeignKey(AgentVerificationPackage, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')

    def save(self, *args, **kwargs):
        if not self.pk:
            self.expiry_date = timezone.now() + timedelta(days=self.package.validity_days)
            self.user.is_verified_agent = True
            self.user.save()
        super().save(*args, **kwargs)
        if self.expiry_date <= timezone.now() and self.status != 'EXPIRED':
            self.status = 'EXPIRED'
            self.user.is_verified_agent = False
            self.user.save()
            super().save(*args, **kwargs)

    class Meta:
        unique_together = ('user', 'package', 'status')

    def __str__(self):
        return f"{self.user.username} - {self.package.name} ({self.status})"

class CashbackBonus(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='agent_cashback_bonuses')
    agent_purchase = models.OneToOneField(AgentPurchase, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    claim_cost = models.DecimalField(max_digits=10, decimal_places=2)
    claimed = models.BooleanField(default=False)
    claim_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Agent Cashback for {self.user.username} - {self.amount}"

class WeeklyBonus(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='weekly_bonuses')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=10000)
    claim_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    claimed = models.BooleanField(default=False)
    claim_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Weekly Bonus for {self.user.username} - {self.amount}"
from django.db import models
from accounts.models import CustomUser
from django.utils import timezone
from datetime import timedelta
from grandview.settings import S3MediaStorage  # Import the custom storage class

class Package(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='packages/', storage=S3MediaStorage())  # Use S3MediaStorage
    validity_days = models.IntegerField()
    rate_per_view = models.IntegerField()
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Purchase(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='purchases')
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')

    def save(self, *args, **kwargs):
        if not self.pk and not self.expiry_date:  # Only set on creation
            self.expiry_date = timezone.now() + timedelta(days=self.package.validity_days)
        super().save(*args, **kwargs)

    def is_active(self):
        if self.expiry_date <= timezone.now():
            self.status = 'EXPIRED'
            self.save()
        return self.status == 'ACTIVE'

    class Meta:
        unique_together = ('user', 'package', 'status')

    def __str__(self):
        return f"{self.user.username} - {self.package.name} ({self.status})"

class CashbackBonus(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='cashback_bonuses')
    purchase = models.OneToOneField(Purchase, on_delete=models.CASCADE, related_name='cashback_bonus')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    claim_cost = models.DecimalField(max_digits=10, decimal_places=2)
    claimed = models.BooleanField(default=False)
    claim_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Cashback for {self.user.username} - {self.amount}"
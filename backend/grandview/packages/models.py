from django.db import models
from accounts.models import CustomUser
from datetime import timedelta
from django.utils import timezone  # Add this import

class Package(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='packages/')
    validity_days = models.IntegerField()
    rate_per_view = models.IntegerField()
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Purchase(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='purchases')
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField()

    def save(self, *args, **kwargs):
        # Ensure purchase_date is set before calculating expiry
        if not self.purchase_date:
            self.purchase_date = timezone.now()
        if not self.expiry_date:
            self.expiry_date = self.purchase_date + timedelta(days=self.package.validity_days)
        super().save(*args, **kwargs)

    def is_active(self):
        from datetime import datetime
        return datetime.now() < self.expiry_date

    class Meta:
        unique_together = ('user', 'package')

    def __str__(self):
        return f"{self.user.username} - {self.package.name}"
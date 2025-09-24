from rest_framework import serializers
from .models import Advert, Submission
from packages.models import Package, Purchase
from django.utils import timezone

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'user', 'advert', 'views_count', 'screenshot', 'earnings', 'submission_date']

class AdvertSerializer(serializers.ModelSerializer):
    can_submit = serializers.SerializerMethodField()
    has_submitted = serializers.SerializerMethodField()

    class Meta:
        model = Advert
        fields = ['id', 'title', 'file', 'rate_category', 'upload_date', 'can_submit', 'has_submitted']

    def get_can_submit(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return False
        active_purchases = Purchase.objects.filter(
            user=request.user,
            expiry_date__gt=timezone.now()
        ).order_by('-purchase_date')  # Get latest purchase
        if not active_purchases.exists():
            return False
        active_rate = active_purchases.first().package.rate_per_view
        return obj.rate_category == active_rate

    def get_has_submitted(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return False
        today = timezone.now().date()
        return Submission.objects.filter(
            user=request.user,
            advert=obj,
            submission_date__date=today
        ).exists()
# serializers.py
from rest_framework import serializers
from .models import Advert, Submission
from packages.models import Package, Purchase
from django.utils import timezone
from rest_framework import serializers
from wallet.models import Transaction

class SubmissionSerializer(serializers.ModelSerializer):
    advert_title = serializers.CharField(source='advert.title')
    screenshot = serializers.FileField()  # Returns local URL (e.g., /media/submissions/filename)

    class Meta:
        model = Submission
        fields = ['id', 'user', 'advert', 'advert_title', 'views_count', 'screenshot', 'earnings', 'submission_date']

class AdvertSerializer(serializers.ModelSerializer):
    file = serializers.FileField()  # Returns S3 URL (e.g., https://your-bucket-name.s3.amazonaws.com/adverts/filename)
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
        ).order_by('-purchase_date')
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

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'transaction_type', 'description', 'created_at']
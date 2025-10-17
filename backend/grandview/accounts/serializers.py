from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
from phonenumber_field.phonenumber import PhoneNumber
import random
from django.utils import timezone
from datetime import timedelta

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'phone_number', 'referral_code', 'is_manager', 'is_staff', 'is_verified_agent', 'is_email_verified']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    referral_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'phone_number', 'password', 'password2', 'referral_code']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        
        referral_code = data.pop('referral_code', None)
        data['referred_by'] = None
        if referral_code:
            try:
                referrer = CustomUser.objects.get(referral_code=referral_code)
                data['referred_by'] = referrer
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError({"referral_code": "Invalid referral code."})
        
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        # Generate 6-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            email_verification_code=otp,
            email_verification_expiry=timezone.now() + timedelta(minutes=30)
        )
        if 'referred_by' in validated_data and validated_data['referred_by']:
            user.referred_by = validated_data['referred_by']
            user.save()

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class UserUpdateSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField()

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'phone_number']

    def validate_phone_number(self, value):
        try:
            parsed = PhoneNumber.from_string(value)
            if not parsed.is_valid():
                raise serializers.ValidationError("Invalid phone number format.")
            return str(parsed)
        except Exception:
            raise serializers.ValidationError("Invalid phone number format.")

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "New passwords must match."})
        if len(data['new_password']) < 8:
            raise serializers.ValidationError({"new_password": "Password must be at least 8 characters long."})
        user = self.context['request'].user
        if not user.check_password(data['current_password']):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        return data

class VerifyEmailSerializer(serializers.Serializer):
    verification_code = serializers.CharField(required=True, max_length=6)

    def validate_verification_code(self, value):
        user = self.context['request'].user
        if user.is_email_verified:
            raise serializers.ValidationError("Email is already verified.")
        if user.email_verification_code != value:
            raise serializers.ValidationError("Invalid verification code.")
        if user.email_verification_expiry < timezone.now():
            raise serializers.ValidationError("Verification code has expired.")
        return value
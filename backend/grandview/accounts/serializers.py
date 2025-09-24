from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate

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
        data['referred_by'] = None  # Default to None if no code
        if referral_code:
            try:
                referrer = CustomUser.objects.get(referral_code=referral_code)
                data['referred_by'] = referrer
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError({"referral_code": "Invalid referral code."})
        
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
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
        from phonenumber_field.phonenumber import PhoneNumber
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
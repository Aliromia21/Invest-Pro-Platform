from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    InvestmentPack, UserInvestment, Transaction,
    ReferralPack, ReferralCommission, KYCVerification, Message
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'balance', 'referral_code', 'is_verified', 'is_kyc_verified',
            'created_at', 'role', 'language'
        ]
        read_only_fields = ['id', 'referral_code', 'balance', 'created_at']


class SignupSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'first_name', 'last_name', 'referral_code'
        ]
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        referral_code = validated_data.pop('referral_code', None)
        
        # Find referrer if code provided
        referred_by = None
        if referral_code:
            try:
                referred_by = User.objects.get(referral_code=referral_code)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid referral code")
        
        user = User.objects.create_user(
            **validated_data,
            referred_by=referred_by
        )
        return user


class InvestmentPackSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentPack
        fields = '__all__'


class UserInvestmentSerializer(serializers.ModelSerializer):
    pack = InvestmentPackSerializer(read_only=True)
    pack_id = serializers.IntegerField(write_only=True, required=False)
    days_elapsed = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserInvestment
        fields = '__all__'
        read_only_fields = ['user', 'start_date', 'end_date', 'daily_return', 'total_return']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user', 'status', 'transaction_hash', 'created_at', 'updated_at']


class ReferralPackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralPack
        fields = '__all__'


class ReferralSerializer(serializers.ModelSerializer):
    referred_user = UserSerializer(read_only=True)
    
    class Meta:
        model = ReferralCommission
        fields = ['id', 'referred_user', 'amount', 'created_at']


class KYCVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCVerification
        fields = '__all__'
        read_only_fields = ['user', 'status', 'admin_note', 'reviewed_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    recipient_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender', 'created_at']

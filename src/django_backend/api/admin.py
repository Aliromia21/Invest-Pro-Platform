from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, InvestmentPack, UserInvestment, Transaction,
    ReferralPack, ReferralCommission, KYCVerification, Message
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'balance', 'is_verified', 'is_kyc_verified']
    list_filter = ['role', 'is_verified', 'is_kyc_verified', 'created_at']
    search_fields = ['username', 'email', 'referral_code']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Investment Platform', {
            'fields': ('balance', 'referral_code', 'referred_by', 'is_verified', 
                      'is_kyc_verified', 'role', 'language')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Investment Platform', {
            'fields': ('balance', 'referred_by', 'role', 'language')
        }),
    )


@admin.register(InvestmentPack)
class InvestmentPackAdmin(admin.ModelAdmin):
    list_display = ['name', 'min_amount', 'max_amount', 'daily_return_rate', 'duration_days', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']


@admin.register(UserInvestment)
class UserInvestmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'pack', 'amount', 'start_date', 'end_date', 'status', 'total_return']
    list_filter = ['status', 'start_date', 'pack']
    search_fields = ['user__username', 'user__email']
    date_hierarchy = 'start_date'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'amount', 'status', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['user__username', 'user__email', 'transaction_hash', 'wallet_address']
    date_hierarchy = 'created_at'


@admin.register(ReferralPack)
class ReferralPackAdmin(admin.ModelAdmin):
    list_display = ['name', 'required_referrals', 'reward_amount', 'icon']
    ordering = ['required_referrals']


@admin.register(ReferralCommission)
class ReferralCommissionAdmin(admin.ModelAdmin):
    list_display = ['referrer', 'referred_user', 'amount', 'created_at']
    list_filter = ['created_at']
    search_fields = ['referrer__username', 'referred_user__username']
    date_hierarchy = 'created_at'


@admin.register(KYCVerification)
class KYCVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'country', 'status', 'submitted_at', 'reviewed_at']
    list_filter = ['status', 'country', 'submitted_at']
    search_fields = ['user__username', 'user__email', 'full_name', 'id_number']
    date_hierarchy = 'submitted_at'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'date_of_birth', 'country')
        }),
        ('ID Information', {
            'fields': ('id_type', 'id_number', 'id_front_image', 'id_back_image', 'selfie_image')
        }),
        ('Verification Status', {
            'fields': ('status', 'admin_note', 'reviewed_at')
        }),
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'offer_platform', 'link_status', 'created_at']
    search_fields = ['sender__username', 'recipient__username', 'subject', 'message']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Message Details', {
            'fields': ('sender', 'recipient', 'subject', 'message', 'is_read')
        }),
        ('Offer Information', {
            'fields': ('offer_platform', 'submitted_link', 'link_status')
        }),
    )

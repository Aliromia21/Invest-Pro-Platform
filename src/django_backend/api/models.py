from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import secrets
import string
from datetime import timedelta, date


class User(AbstractUser):
    """Extended User model"""
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('admin', 'Admin'),
    ]
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('ar', 'Arabic'),
    ]
    
    balance = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    referral_code = models.CharField(max_length=10, unique=True, blank=True)
    referred_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='referrals'
    )
    is_verified = models.BooleanField(default=False)
    is_kyc_verified = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = self.generate_referral_code()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_referral_code():
        """Generate unique 8-character referral code"""
        while True:
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            if not User.objects.filter(referral_code=code).exists():
                return code


class InvestmentPack(models.Model):
    """Investment packages"""
    name = models.CharField(max_length=100)
    min_amount = models.DecimalField(max_digits=20, decimal_places=2)
    max_amount = models.DecimalField(max_digits=20, decimal_places=2)
    daily_return_rate = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage
    duration_days = models.IntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class UserInvestment(models.Model):
    """User's active investments"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investments')
    pack = models.ForeignKey(InvestmentPack, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField()
    daily_return = models.DecimalField(max_digits=20, decimal_places=2)
    total_return = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.end_date:
            self.end_date = self.start_date + timedelta(days=self.pack.duration_days)
        if not self.daily_return:
            self.daily_return = (self.amount * self.pack.daily_return_rate) / 100
        super().save(*args, **kwargs)
    
    @property
    def days_elapsed(self):
        """Calculate days since investment started"""
        if self.status != 'active':
            return (self.end_date - self.start_date).days
        return (date.today() - self.start_date).days


class Transaction(models.Model):
    """All transactions (deposits, withdrawals, earnings)"""
    TYPE_CHOICES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('earning', 'Earning'),
        ('referral_commission', 'Referral Commission'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    wallet_address = models.CharField(max_length=200, blank=True)
    transaction_hash = models.CharField(max_length=200, blank=True)
    admin_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']


class ReferralPack(models.Model):
    """Referral milestone rewards"""
    name = models.CharField(max_length=50)
    required_referrals = models.IntegerField()
    reward_amount = models.DecimalField(max_digits=20, decimal_places=2)
    icon = models.CharField(max_length=50, default='trophy')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['required_referrals']
    
    def __str__(self):
        return self.name


class ReferralCommission(models.Model):
    """Track referral commissions"""
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commissions_earned')
    referred_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referred_from')
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    investment = models.ForeignKey(UserInvestment, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class KYCVerification(models.Model):
    """KYC verification documents"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc')
    full_name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    country = models.CharField(max_length=100)
    id_type = models.CharField(max_length=50)
    id_number = models.CharField(max_length=100)
    id_front_image = models.ImageField(upload_to='kyc/id_front/')
    id_back_image = models.ImageField(upload_to='kyc/id_back/', blank=True, null=True)
    selfie_image = models.ImageField(upload_to='kyc/selfie/')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)


class Message(models.Model):
    """User-Admin messaging system"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    offer_platform = models.CharField(
        max_length=20, 
        choices=[
            ('facebook', 'Facebook'),
            ('instagram', 'Instagram'),
            ('youtube', 'YouTube'),
        ],
        blank=True
    )
    submitted_link = models.URLField(blank=True)
    link_status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        blank=True
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

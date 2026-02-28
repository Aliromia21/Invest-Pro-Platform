"""
Setup script to create initial investment packs and referral packs
Run this after migrations: python manage.py shell < setup_initial_data.py
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investment_backend.settings')
django.setup()

from api.models import InvestmentPack, ReferralPack

print("Creating initial data...")

# Check if data already exists
if InvestmentPack.objects.exists():
    print("Investment packs already exist. Skipping...")
else:
    print("Creating Investment Packs...")
    
    InvestmentPack.objects.create(
        name='Starter',
        min_amount=100,
        max_amount=4999,
        daily_return_rate=2.5,
        duration_days=60,
        is_active=True
    )
    print("✓ Created Starter pack (2.5% daily, $100-$4,999)")
    
    InvestmentPack.objects.create(
        name='Professional',
        min_amount=5000,
        max_amount=19999,
        daily_return_rate=5.0,
        duration_days=60,
        is_active=True
    )
    print("✓ Created Professional pack (5.0% daily, $5,000-$19,999)")
    
    InvestmentPack.objects.create(
        name='Premium',
        min_amount=20000,
        max_amount=49999,
        daily_return_rate=8.5,
        duration_days=60,
        is_active=True
    )
    print("✓ Created Premium pack (8.5% daily, $20,000-$49,999)")
    
    InvestmentPack.objects.create(
        name='Elite',
        min_amount=50000,
        max_amount=999999999,
        daily_return_rate=12.5,
        duration_days=60,
        is_active=True
    )
    print("✓ Created Elite pack (12.5% daily, $50,000+)")

if ReferralPack.objects.exists():
    print("\nReferral packs already exist. Skipping...")
else:
    print("\nCreating Referral Packs...")
    
    ReferralPack.objects.create(
        name='Bronze',
        required_referrals=5,
        reward_amount=25,
        icon='bronze'
    )
    print("✓ Created Bronze pack (5 referrals, $25 reward)")
    
    ReferralPack.objects.create(
        name='Silver',
        required_referrals=10,
        reward_amount=50,
        icon='silver'
    )
    print("✓ Created Silver pack (10 referrals, $50 reward)")
    
    ReferralPack.objects.create(
        name='Gold',
        required_referrals=20,
        reward_amount=150,
        icon='gold'
    )
    print("✓ Created Gold pack (20 referrals, $150 reward)")
    
    ReferralPack.objects.create(
        name='VIP',
        required_referrals=40,
        reward_amount=1000,
        icon='vip'
    )
    print("✓ Created VIP pack (40 referrals, $1,000 reward)")

print("\n" + "="*50)
print("Initial data setup complete!")
print("="*50)
print("\nYou can now:")
print("1. Create a superuser: python manage.py createsuperuser")
print("2. Start the server: python manage.py runserver")
print("3. Access admin panel: http://localhost:8000/admin/")
print("4. Start React frontend and test the platform!")

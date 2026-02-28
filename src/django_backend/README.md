# Investment Platform - Django Backend

This is the Django REST API backend for the Investment Platform.

## Features

- JWT Authentication with automatic token refresh
- User management with custom User model
- Investment packs with daily returns
- USDT deposit/withdrawal system
- Referral system with 3% commission
- Referral packs with milestone rewards
- KYC verification with document upload
- Admin dashboard with full privileges
- User-Admin messaging system with offer platform links
- Multi-language support (English/Arabic)

## Technology Stack

- Django 4.2+
- Django REST Framework
- Simple JWT for authentication
- SQLite (development) / PostgreSQL (production recommended)
- Pillow for image handling

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd django_backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and configure your settings
# At minimum, change the SECRET_KEY
```

### 4. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Admin User

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 6. Create Initial Data

Start Django shell and create initial investment and referral packs:

```bash
python manage.py shell
```

```python
from api.models import InvestmentPack, ReferralPack

# Create Investment Packs
InvestmentPack.objects.create(
    name='Starter',
    min_amount=100,
    max_amount=4999,
    daily_return_rate=2.5,
    duration_days=60
)

InvestmentPack.objects.create(
    name='Professional',
    min_amount=5000,
    max_amount=19999,
    daily_return_rate=5.0,
    duration_days=60
)

InvestmentPack.objects.create(
    name='Premium',
    min_amount=20000,
    max_amount=49999,
    daily_return_rate=8.5,
    duration_days=60
)

InvestmentPack.objects.create(
    name='Elite',
    min_amount=50000,
    max_amount=999999999,
    daily_return_rate=12.5,
    duration_days=60
)

# Create Referral Packs
ReferralPack.objects.create(
    name='Bronze',
    required_referrals=5,
    reward_amount=25,
    icon='bronze'
)

ReferralPack.objects.create(
    name='Silver',
    required_referrals=10,
    reward_amount=50,
    icon='silver'
)

ReferralPack.objects.create(
    name='Gold',
    required_referrals=20,
    reward_amount=150,
    icon='gold'
)

ReferralPack.objects.create(
    name='VIP',
    required_referrals=40,
    reward_amount=1000,
    icon='vip'
)

exit()
```

### 7. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User
- `GET /api/users/profile/` - Get user profile
- `PATCH /api/users/profile/update/` - Update profile
- `GET /api/users/stats/` - Get dashboard statistics

### Investments
- `GET /api/investments/packs/` - Get all investment packs
- `GET /api/investments/my-investments/` - Get user's investments
- `POST /api/investments/create/` - Create new investment
- `GET /api/investments/chart-data/` - Get chart data

### Transactions
- `GET /api/transactions/` - Get all user transactions
- `POST /api/transactions/deposit/` - Create deposit request
- `POST /api/transactions/withdraw/` - Create withdrawal request

### Referrals
- `GET /api/referrals/stats/` - Get referral statistics
- `GET /api/referrals/packs/` - Get referral packs
- `GET /api/referrals/my-referrals/` - Get user's referrals

### KYC
- `POST /api/kyc/submit/` - Submit KYC verification
- `GET /api/kyc/status/` - Get KYC status

### Messages
- `GET /api/messages/` - Get user's messages
- `POST /api/messages/send/` - Send message
- `POST /api/messages/mark-read/` - Mark message as read
- `POST /api/messages/submit-link/` - Submit offer link

### Admin
- `GET /api/admin/stats/` - Get admin statistics
- `GET /api/admin/users/` - Get all users
- `GET /api/admin/deposits/` - Get all deposits
- `GET /api/admin/withdrawals/` - Get all withdrawals
- `GET /api/admin/kyc/` - Get all KYC submissions
- `GET /api/admin/investments/` - Get all investments
- `GET /api/admin/messages/` - Get all messages
- `GET /api/admin/affiliates/` - Get affiliate statistics
- `POST /api/admin/transactions/approve/` - Approve transaction
- `POST /api/admin/transactions/reject/` - Reject transaction
- `POST /api/admin/kyc/approve/` - Approve KYC
- `POST /api/admin/kyc/reject/` - Reject KYC
- `POST /api/admin/messages/approve-link/` - Approve offer link
- `POST /api/admin/messages/reject-link/` - Reject offer link
- `DELETE /api/admin/users/delete/` - Delete user
- `PATCH /api/admin/users/update/` - Update user

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/`

Use the superuser credentials you created earlier.

## Database Models

### User (Custom User Model)
- Extended Django User with investment platform fields
- Balance tracking
- Referral code system
- KYC verification status
- Role-based access (customer/admin)
- Language preference

### InvestmentPack
- Investment package configuration
- Min/max amounts
- Daily return rates
- Duration

### UserInvestment
- User's active investments
- Automatic return calculation
- Status tracking

### Transaction
- Deposits, withdrawals, earnings, commissions
- Status workflow
- Wallet address tracking

### ReferralPack
- Milestone-based rewards
- Configurable referral requirements

### ReferralCommission
- Track all referral commissions
- Link to investments

### KYCVerification
- Document upload
- Review workflow
- Admin notes

### Message
- User-Admin communication
- Offer platform integration
- Link submission and approval

## Testing

### Create Test Users

```bash
python manage.py shell
```

```python
from api.models import User

# Create customer user
customer = User.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpass123',
    first_name='Test',
    last_name='User',
    role='customer'
)

# Create admin user (if not done via createsuperuser)
admin = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin123',
    role='admin'
)

exit()
```

### Test API with cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Get profile (replace TOKEN with actual token from login)
curl -X GET http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer TOKEN"
```

## Production Deployment

### Database

For production, use PostgreSQL instead of SQLite:

1. Install PostgreSQL and create a database
2. Update settings.py or use DATABASE_URL environment variable
3. Install psycopg2: `pip install psycopg2-binary`

### Static Files

```bash
python manage.py collectstatic
```

### Security

1. Change SECRET_KEY to a strong random value
2. Set DEBUG=False
3. Configure ALLOWED_HOSTS
4. Use HTTPS
5. Set up proper CORS origins
6. Configure email backend for real email sending

### WSGI Server

Use Gunicorn or uWSGI:

```bash
pip install gunicorn
gunicorn investment_backend.wsgi:application
```

## Troubleshooting

### CORS Issues

Make sure your React frontend URL is in CORS_ALLOWED_ORIGINS in settings.py or .env file.

### Token Issues

- Tokens expire after 1 hour (access) and 7 days (refresh)
- The frontend should automatically refresh tokens
- Clear localStorage if experiencing auth issues

### Database Migrations

If you make model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

## Support

For issues and questions, refer to:
- Django documentation: https://docs.djangoproject.com/
- DRF documentation: https://www.django-rest-framework.org/
- Simple JWT documentation: https://django-rest-framework-simplejwt.readthedocs.io/

from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal

from .models import *
from .serializers import *

User = get_user_model()


# ==================== Authentication Views ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """User registration"""
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Registration successful. Please check your email to verify your account.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = None
    # Try to authenticate with email
    try:
        user_obj = User.objects.get(email=email)
        user = authenticate(username=user_obj.username, password=password)
    except User.DoesNotExist:
        # Try with username
        user = authenticate(username=email, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    
    return Response({
        'detail': 'Invalid credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout"""
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Get user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats_view(request):
    """Get user dashboard statistics"""
    user = request.user
    
    # Calculate statistics
    active_investments = UserInvestment.objects.filter(user=user, status='active')
    total_invested = active_investments.aggregate(total=Sum('amount'))['total'] or 0
    total_earnings = active_investments.aggregate(total=Sum('total_return'))['total'] or 0
    
    total_referrals = ReferralCommission.objects.filter(referrer=user).count()
    referral_earnings = ReferralCommission.objects.filter(referrer=user).aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    pending_withdrawals = Transaction.objects.filter(
        user=user,
        type='withdrawal',
        status='pending'
    ).count()
    
    # Recent activities
    recent_transactions = Transaction.objects.filter(user=user)[:5]
    recent_activities = [{
        'action': t.get_type_display(),
        'amount': float(t.amount),
        'created_at': t.created_at.isoformat()
    } for t in recent_transactions]
    
    return Response({
        'total_balance': float(user.balance),
        'active_investments': active_investments.count(),
        'total_earnings': float(total_earnings),
        'total_referrals': total_referrals,
        'pending_withdrawals': pending_withdrawals,
        'recent_activities': recent_activities
    })


# ==================== Investment Views ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def investment_packs_view(request):
    """Get all active investment packs"""
    packs = InvestmentPack.objects.filter(is_active=True)
    serializer = InvestmentPackSerializer(packs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_investments_view(request):
    """Get user's investments"""
    investments = UserInvestment.objects.filter(user=request.user)
    serializer = UserInvestmentSerializer(investments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_investment_view(request):
    """Create new investment"""
    pack_id = request.data.get('pack_id')
    amount = Decimal(str(request.data.get('amount', 0)))
    
    try:
        pack = InvestmentPack.objects.get(id=pack_id, is_active=True)
    except InvestmentPack.DoesNotExist:
        return Response({'detail': 'Invalid investment pack'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate amount
    if amount < pack.min_amount or amount > pack.max_amount:
        return Response({
            'detail': f'Amount must be between {pack.min_amount} and {pack.max_amount}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check user balance
    if request.user.balance < amount:
        return Response({'detail': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create investment
    investment = UserInvestment.objects.create(
        user=request.user,
        pack=pack,
        amount=amount
    )
    
    # Deduct from balance
    request.user.balance -= amount
    request.user.save()
    
    # Process referral commission if applicable
    if request.user.referred_by:
        commission_amount = amount * Decimal('0.03')  # 3% commission
        request.user.referred_by.balance += commission_amount
        request.user.referred_by.save()
        
        # Record commission
        ReferralCommission.objects.create(
            referrer=request.user.referred_by,
            referred_user=request.user,
            amount=commission_amount,
            investment=investment
        )
        
        # Create transaction record
        Transaction.objects.create(
            user=request.user.referred_by,
            type='referral_commission',
            amount=commission_amount,
            status='completed'
        )
    
    serializer = UserInvestmentSerializer(investment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def investment_chart_data_view(request):
    """Get investment chart data"""
    investments = UserInvestment.objects.filter(
        user=request.user,
        status='active'
    ).order_by('start_date')
    
    chart_data = []
    for inv in investments:
        days = min(inv.days_elapsed, inv.pack.duration_days)
        for day in range(days + 1):
            date_obj = inv.start_date + timedelta(days=day)
            value = float(inv.daily_return * day)
            chart_data.append({
                'date': date_obj.isoformat(),
                'value': value
            })
    
    return Response(chart_data)


# ==================== Transaction Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transactions_view(request):
    """Get user's transactions"""
    transactions = Transaction.objects.filter(user=request.user)
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_view(request):
    """Create deposit request"""
    amount = request.data.get('amount')
    wallet_address = request.data.get('wallet_address')
    transaction_hash = request.data.get('transaction_hash')
    
    transaction = Transaction.objects.create(
        user=request.user,
        type='deposit',
        amount=amount,
        wallet_address=wallet_address,
        transaction_hash=transaction_hash,
        status='pending'
    )
    
    serializer = TransactionSerializer(transaction)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdrawal_view(request):
    """Create withdrawal request"""
    amount = Decimal(str(request.data.get('amount', 0)))
    wallet_address = request.data.get('wallet_address')
    
    if amount <= 0:
        return Response({'detail': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
    
    if request.user.balance < amount:
        return Response({'detail': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Deduct from balance
    request.user.balance -= amount
    request.user.save()
    
    transaction = Transaction.objects.create(
        user=request.user,
        type='withdrawal',
        amount=amount,
        wallet_address=wallet_address,
        status='pending'
    )
    
    serializer = TransactionSerializer(transaction)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ==================== Referral Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_stats_view(request):
    """Get referral statistics"""
    user = request.user
    
    referrals = ReferralCommission.objects.filter(referrer=user)
    total_referrals = referrals.count()
    total_commission = referrals.aggregate(total=Sum('amount'))['total'] or 0
    
    # Get referral packs and check achievement
    referral_packs = ReferralPack.objects.all()
    packs_progress = []
    
    for pack in referral_packs:
        packs_progress.append({
            'pack': ReferralPackSerializer(pack).data,
            'achieved': total_referrals >= pack.required_referrals
        })
    
    return Response({
        'total_referrals': total_referrals,
        'total_commission': float(total_commission),
        'packs': packs_progress
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def referral_packs_view(request):
    """Get all referral packs"""
    packs = ReferralPack.objects.all()
    serializer = ReferralPackSerializer(packs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_referrals_view(request):
    """Get user's referrals"""
    referrals = ReferralCommission.objects.filter(referrer=request.user)
    serializer = ReferralSerializer(referrals, many=True)
    return Response(serializer.data)


# ==================== KYC Views ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_kyc_view(request):
    """Submit KYC verification"""
    # Check if already submitted
    if hasattr(request.user, 'kyc'):
        return Response(
            {'detail': 'KYC already submitted'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = KYCVerificationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kyc_status_view(request):
    """Get KYC status"""
    try:
        kyc = request.user.kyc
        serializer = KYCVerificationSerializer(kyc)
        return Response(serializer.data)
    except KYCVerification.DoesNotExist:
        return Response({'status': 'not_submitted'})


# ==================== Message Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def messages_view(request):
    """Get user's messages"""
    messages = Message.objects.filter(
        Q(sender=request.user) | Q(recipient=request.user)
    )
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_view(request):
    """Send message"""
    recipient_id = request.data.get('recipient_id')
    
    try:
        recipient = User.objects.get(id=recipient_id)
    except User.DoesNotExist:
        return Response({'detail': 'Recipient not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(sender=request.user, recipient=recipient)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read_view(request):
    """Mark message as read"""
    message_id = request.data.get('message_id')
    
    try:
        message = Message.objects.get(id=message_id, recipient=request.user)
        message.is_read = True
        message.save()
        return Response({'message': 'Marked as read'})
    except Message.DoesNotExist:
        return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_offer_link_view(request):
    """Submit offer link"""
    message_id = request.data.get('message_id')
    submitted_link = request.data.get('submitted_link')
    
    try:
        message = Message.objects.get(id=message_id, recipient=request.user)
        message.submitted_link = submitted_link
        message.link_status = 'pending'
        message.save()
        
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    except Message.DoesNotExist:
        return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)


# ==================== Admin Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats_view(request):
    """Get admin dashboard statistics"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    total_users = User.objects.filter(role='customer').count()
    active_investments = UserInvestment.objects.filter(status='active').count()
    pending_deposits = Transaction.objects.filter(type='deposit', status='pending').count()
    pending_withdrawals = Transaction.objects.filter(type='withdrawal', status='pending').count()
    pending_kyc = KYCVerification.objects.filter(status='pending').count()
    
    total_platform_balance = User.objects.filter(role='customer').aggregate(
        total=Sum('balance')
    )['total'] or 0
    
    total_earnings = Transaction.objects.filter(
        type='earning',
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    recent_users = User.objects.filter(role='customer').order_by('-created_at')[:5]
    
    return Response({
        'total_users': total_users,
        'active_investments': active_investments,
        'pending_deposits': pending_deposits,
        'pending_withdrawals': pending_withdrawals,
        'pending_kyc': pending_kyc,
        'total_platform_balance': float(total_platform_balance),
        'total_earnings': float(total_earnings),
        'recent_users': UserSerializer(recent_users, many=True).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_view(request):
    """Get all users (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.filter(role='customer')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_deposits_view(request):
    """Get all deposit requests (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    deposits = Transaction.objects.filter(type='deposit')
    serializer = TransactionSerializer(deposits, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_withdrawals_view(request):
    """Get all withdrawal requests (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    withdrawals = Transaction.objects.filter(type='withdrawal')
    serializer = TransactionSerializer(withdrawals, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_kyc_view(request):
    """Get all KYC submissions (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    kyc_submissions = KYCVerification.objects.all()
    serializer = KYCVerificationSerializer(kyc_submissions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_investments_view(request):
    """Get all investments (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    investments = UserInvestment.objects.all()
    serializer = UserInvestmentSerializer(investments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_messages_view(request):
    """Get all messages (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    messages = Message.objects.all()
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_affiliates_view(request):
    """Get affiliate statistics (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get users with referrals
    users_with_referrals = User.objects.filter(
        commissions_earned__isnull=False
    ).distinct().annotate(
        referral_count=Count('commissions_earned'),
        total_commission=Sum('commissions_earned__amount')
    )
    
    data = []
    for user in users_with_referrals:
        data.append({
            'user': UserSerializer(user).data,
            'referral_count': user.referral_count,
            'total_commission': float(user.total_commission or 0)
        })
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_transaction_view(request):
    """Approve transaction (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    transaction_id = request.data.get('transaction_id')
    admin_note = request.data.get('admin_note', '')
    
    try:
        transaction = Transaction.objects.get(id=transaction_id)
        
        if transaction.type == 'deposit':
            # Add to user balance
            transaction.user.balance += transaction.amount
            transaction.user.save()
        
        transaction.status = 'approved'
        transaction.admin_note = admin_note
        transaction.save()
        
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)
    except Transaction.DoesNotExist:
        return Response({'detail': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_transaction_view(request):
    """Reject transaction (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    transaction_id = request.data.get('transaction_id')
    admin_note = request.data.get('admin_note', '')
    
    try:
        transaction = Transaction.objects.get(id=transaction_id)
        
        if transaction.type == 'withdrawal' and transaction.status == 'pending':
            # Refund to user balance
            transaction.user.balance += transaction.amount
            transaction.user.save()
        
        transaction.status = 'rejected'
        transaction.admin_note = admin_note
        transaction.save()
        
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)
    except Transaction.DoesNotExist:
        return Response({'detail': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_kyc_view(request):
    """Approve KYC (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    kyc_id = request.data.get('kyc_id')
    admin_note = request.data.get('admin_note', '')
    
    try:
        kyc = KYCVerification.objects.get(id=kyc_id)
        kyc.status = 'approved'
        kyc.admin_note = admin_note
        kyc.reviewed_at = timezone.now()
        kyc.save()
        
        # Update user
        kyc.user.is_kyc_verified = True
        kyc.user.save()
        
        serializer = KYCVerificationSerializer(kyc)
        return Response(serializer.data)
    except KYCVerification.DoesNotExist:
        return Response({'detail': 'KYC not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_kyc_view(request):
    """Reject KYC (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    kyc_id = request.data.get('kyc_id')
    admin_note = request.data.get('admin_note', '')
    
    try:
        kyc = KYCVerification.objects.get(id=kyc_id)
        kyc.status = 'rejected'
        kyc.admin_note = admin_note
        kyc.reviewed_at = timezone.now()
        kyc.save()
        
        serializer = KYCVerificationSerializer(kyc)
        return Response(serializer.data)
    except KYCVerification.DoesNotExist:
        return Response({'detail': 'KYC not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_link_view(request):
    """Approve submitted offer link (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    message_id = request.data.get('message_id')
    
    try:
        message = Message.objects.get(id=message_id)
        message.link_status = 'approved'
        message.save()
        
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    except Message.DoesNotExist:
        return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_link_view(request):
    """Reject submitted offer link (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    message_id = request.data.get('message_id')
    
    try:
        message = Message.objects.get(id=message_id)
        message.link_status = 'rejected'
        message.save()
        
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    except Message.DoesNotExist:
        return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_view(request):
    """Delete user (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    user_id = request.data.get('user_id')
    
    try:
        user = User.objects.get(id=user_id, role='customer')
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_view(request):
    """Update user (admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    user_id = request.data.get('user_id')
    
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

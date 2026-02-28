from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()

urlpatterns = [
    # Authentication
    path('auth/signup/', views.signup_view, name='signup'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('users/profile/', views.user_profile_view, name='user_profile'),
    path('users/profile/update/', views.update_profile_view, name='update_profile'),
    path('users/stats/', views.user_stats_view, name='user_stats'),
    
    # Investments
    path('investments/packs/', views.investment_packs_view, name='investment_packs'),
    path('investments/my-investments/', views.my_investments_view, name='my_investments'),
    path('investments/create/', views.create_investment_view, name='create_investment'),
    path('investments/chart-data/', views.investment_chart_data_view, name='investment_chart_data'),
    
    # Transactions
    path('transactions/', views.transactions_view, name='transactions'),
    path('transactions/deposit/', views.deposit_view, name='deposit'),
    path('transactions/withdraw/', views.withdrawal_view, name='withdraw'),
    path('transactions/history/', views.transactions_view, name='transaction_history'),
    
    # Referrals
    path('referrals/my-code/', views.user_profile_view, name='referral_code'),
    path('referrals/stats/', views.referral_stats_view, name='referral_stats'),
    path('referrals/packs/', views.referral_packs_view, name='referral_packs'),
    path('referrals/my-referrals/', views.my_referrals_view, name='my_referrals'),
    
    # KYC
    path('kyc/submit/', views.submit_kyc_view, name='submit_kyc'),
    path('kyc/status/', views.kyc_status_view, name='kyc_status'),
    
    # Messages
    path('messages/', views.messages_view, name='messages'),
    path('messages/send/', views.send_message_view, name='send_message'),
    path('messages/mark-read/', views.mark_read_view, name='mark_read'),
    path('messages/submit-link/', views.submit_offer_link_view, name='submit_offer_link'),
    
    # Admin
    path('admin/stats/', views.admin_stats_view, name='admin_stats'),
    path('admin/users/', views.admin_users_view, name='admin_users'),
    path('admin/deposits/', views.admin_deposits_view, name='admin_deposits'),
    path('admin/withdrawals/', views.admin_withdrawals_view, name='admin_withdrawals'),
    path('admin/kyc/', views.admin_kyc_view, name='admin_kyc'),
    path('admin/investments/', views.admin_investments_view, name='admin_investments'),
    path('admin/messages/', views.admin_messages_view, name='admin_messages'),
    path('admin/affiliates/', views.admin_affiliates_view, name='admin_affiliates'),
    
    # Admin Actions
    path('admin/transactions/approve/', views.approve_transaction_view, name='approve_transaction'),
    path('admin/transactions/reject/', views.reject_transaction_view, name='reject_transaction'),
    path('admin/kyc/approve/', views.approve_kyc_view, name='approve_kyc'),
    path('admin/kyc/reject/', views.reject_kyc_view, name='reject_kyc'),
    path('admin/messages/approve-link/', views.approve_link_view, name='approve_link'),
    path('admin/messages/reject-link/', views.reject_link_view, name='reject_link'),
    path('admin/users/delete/', views.delete_user_view, name='delete_user'),
    path('admin/users/update/', views.update_user_view, name='update_user'),
    
    # Router URLs
    path('', include(router.urls)),
]

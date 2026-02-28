// API Configuration for Django Backend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login/',
  SIGNUP: '/auth/signup/',
  LOGOUT: '/auth/logout/',
  REFRESH_TOKEN: '/auth/token/refresh/',
  VERIFY_EMAIL: '/auth/verify-email/',
  FORGOT_PASSWORD: '/auth/forgot-password/',
  RESET_PASSWORD: '/auth/reset-password/',
  CHANGE_PASSWORD: '/auth/change-password/',
  
  // User
  USER_PROFILE: '/users/profile/',
  UPDATE_PROFILE: '/users/profile/update/',
  USER_STATS: '/users/stats/',
  
  // Investments
  INVESTMENT_PACKS: '/investments/packs/',
  USER_INVESTMENTS: '/investments/my-investments/',
  CREATE_INVESTMENT: '/investments/create/',
  INVESTMENT_CHART_DATA: '/investments/chart-data/',
  
  // Transactions
  TRANSACTIONS: '/transactions/',
  CREATE_DEPOSIT: '/transactions/deposit/',
  CREATE_WITHDRAWAL: '/transactions/withdraw/',
  TRANSACTION_HISTORY: '/transactions/history/',
  
  // Referrals
  REFERRAL_CODE: '/referrals/my-code/',
  REFERRAL_STATS: '/referrals/stats/',
  REFERRAL_PACKS: '/referrals/packs/',
  MY_REFERRALS: '/referrals/my-referrals/',
  
  // KYC
  SUBMIT_KYC: '/kyc/submit/',
  KYC_STATUS: '/kyc/status/',
  
  // Messages
  MESSAGES: '/messages/',
  SEND_MESSAGE: '/messages/send/',
  MARK_READ: '/messages/mark-read/',
  SUBMIT_OFFER_LINK: '/messages/submit-link/',
  
  // Admin
  ADMIN_STATS: '/admin/stats/',
  ADMIN_USERS: '/admin/users/',
  ADMIN_DEPOSITS: '/admin/deposits/',
  ADMIN_WITHDRAWALS: '/admin/withdrawals/',
  ADMIN_KYC: '/admin/kyc/',
  ADMIN_INVESTMENTS: '/admin/investments/',
  ADMIN_MESSAGES: '/admin/messages/',
  ADMIN_AFFILIATES: '/admin/affiliates/',
  APPROVE_TRANSACTION: '/admin/transactions/approve/',
  REJECT_TRANSACTION: '/admin/transactions/reject/',
  APPROVE_KYC: '/admin/kyc/approve/',
  REJECT_KYC: '/admin/kyc/reject/',
  APPROVE_LINK: '/admin/messages/approve-link/',
  REJECT_LINK: '/admin/messages/reject-link/',
  DELETE_USER: '/admin/users/delete/',
  UPDATE_USER: '/admin/users/update/',
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

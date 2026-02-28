// API Types and Interfaces for Django Backend Integration

export interface User {
  id: number;
  email: string;
  username: string;

  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  country?: string;

  balance?: string;
  referral_code?: string;
  referral_counter?: number;

  is_kyc_verified?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;

  created_at?: string; 
}


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  referral_code?: string;
}

export interface InvestmentPack {
  id: number;
  name: string;
  min_amount: number;
  max_amount: number;
  daily_return_rate: number;
  duration_days: number;
  is_active: boolean;
}

export interface UserInvestment {
  id: number;
  user: number;
  pack: InvestmentPack;
  amount: number;
  start_date: string;
  end_date: string;
  daily_return: number;
  total_return: number;
  status: 'active' | 'completed' | 'cancelled';
  days_elapsed: number;
}

export interface Transaction {
  id: number;
  user: number;
  type: 'deposit' | 'withdrawal' | 'earning' | 'referral_commission';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  wallet_address?: string;
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
  admin_note?: string;
}

export interface Referral {
  id: number;
  referrer: number;
  referred_user: User;
  commission_earned: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface ReferralPack {
  id: number;
  name: string;
  required_referrals: number;
  reward_amount: number;
  icon: string;
}

export interface UserReferralProgress {
  total_referrals: number;
  total_commission: number;
  referrals: Referral[];
  packs: {
    pack: ReferralPack;
    achieved: boolean;
  }[];
}

export interface KYCVerification {
  id: number;
  user: number;
  full_name: string;
  date_of_birth: string;
  country: string;
  id_type: string;
  id_number: string;
  id_front_image: string;
  id_back_image?: string;
  selfie_image: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface Message {
  id: number;
  sender: number;
  recipient: number;
  subject: string;
  message: string;
  offer_details?: {
    platform: 'facebook' | 'instagram' | 'youtube';
    submitted_link?: string;
    link_status?: 'pending' | 'approved' | 'rejected';
  };
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_balance: number;
  active_investments: number;
  total_earnings: number;
  total_referrals: number;
  pending_withdrawals: number;
  recent_activities: {
    action: string;
    amount: number;
    created_at: string;
  }[];
}

export interface AdminStats {
  total_users: number;
  active_investments: number;
  pending_deposits: number;
  pending_withdrawals: number;
  pending_kyc: number;
  total_platform_balance: number;
  total_earnings: number;
  recent_users: User[];
}

export interface ChartData {
  date: string;
  value: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

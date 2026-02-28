import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { UserReferralProgress } from '../types/api';

class ReferralService {
  async getReferralCode(): Promise<{ referral_code: string }> {
    return apiService.get<{ referral_code: string }>(
      API_ENDPOINTS.REFERRAL_CODE
    );
  }

  async getReferralStats(): Promise<UserReferralProgress> {
    return apiService.get<UserReferralProgress>(API_ENDPOINTS.REFERRAL_STATS);
  }

  async getMyReferrals(): Promise<UserReferralProgress> {
    return apiService.get<UserReferralProgress>(API_ENDPOINTS.MY_REFERRALS);
  }
}

export const referralService = new ReferralService();

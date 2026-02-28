// Admin Service

import { adminApiService as apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  AdminStats,
  User,
  Transaction,
  KYCVerification,
  UserInvestment,
  Message,
  PaginatedResponse,
} from '../types/api';

class AdminService {
  // Dashboard Stats
  async getAdminStats(): Promise<AdminStats> {
    return apiService.get<AdminStats>(API_ENDPOINTS.ADMIN_STATS);
  }

  // User Management
  async getUsers(
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append('search', search);
    
    return apiService.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.ADMIN_USERS}?${params.toString()}`
    );
  }

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    return apiService.patch<User>(
      `${API_ENDPOINTS.UPDATE_USER}${userId}/`,
      data
    );
  }

  async deleteUser(userId: number): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.DELETE_USER}${userId}/`);
  }

  // Deposit Management
  async getDepositRequests(
    page: number = 1,
    status?: string
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({ 
      page: page.toString(),
      type: 'deposit' 
    });
    if (status) params.append('status', status);
    
    return apiService.get<PaginatedResponse<Transaction>>(
      `${API_ENDPOINTS.ADMIN_DEPOSITS}?${params.toString()}`
    );
  }

  async approveDeposit(
    transactionId: number,
    transactionHash: string
  ): Promise<Transaction> {
    return apiService.post<Transaction>(
      `${API_ENDPOINTS.APPROVE_TRANSACTION}${transactionId}/`,
      { transaction_hash: transactionHash }
    );
  }

  async rejectDeposit(
    transactionId: number,
    reason: string
  ): Promise<Transaction> {
    return apiService.post<Transaction>(
      `${API_ENDPOINTS.REJECT_TRANSACTION}${transactionId}/`,
      { reason }
    );
  }

  // Withdrawal Management
  async getWithdrawalRequests(
    page: number = 1,
    status?: string
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({ 
      page: page.toString(),
      type: 'withdrawal' 
    });
    if (status) params.append('status', status);
    
    return apiService.get<PaginatedResponse<Transaction>>(
      `${API_ENDPOINTS.ADMIN_WITHDRAWALS}?${params.toString()}`
    );
  }

  async approveWithdrawal(
    transactionId: number,
    transactionHash: string
  ): Promise<Transaction> {
    return apiService.post<Transaction>(
      `${API_ENDPOINTS.APPROVE_TRANSACTION}${transactionId}/`,
      { transaction_hash: transactionHash }
    );
  }

  async rejectWithdrawal(
    transactionId: number,
    reason: string
  ): Promise<Transaction> {
    return apiService.post<Transaction>(
      `${API_ENDPOINTS.REJECT_TRANSACTION}${transactionId}/`,
      { reason }
    );
  }

  // KYC Management
  async getKYCRequests(
    page: number = 1,
    status?: string
  ): Promise<PaginatedResponse<KYCVerification>> {
    const params = new URLSearchParams({ page: page.toString() });
    if (status) params.append('status', status);
    
    return apiService.get<PaginatedResponse<KYCVerification>>(
      `${API_ENDPOINTS.ADMIN_KYC}?${params.toString()}`
    );
  }

  async approveKYC(kycId: number, note?: string): Promise<KYCVerification> {
    return apiService.post<KYCVerification>(
      `${API_ENDPOINTS.APPROVE_KYC}${kycId}/`,
      { note }
    );
  }

  async rejectKYC(kycId: number, reason: string): Promise<KYCVerification> {
    return apiService.post<KYCVerification>(
      `${API_ENDPOINTS.REJECT_KYC}${kycId}/`,
      { reason }
    );
  }

  // Investment Management
  async getAllInvestments(
    page: number = 1,
    status?: string
  ): Promise<PaginatedResponse<UserInvestment>> {
    const params = new URLSearchParams({ page: page.toString() });
    if (status) params.append('status', status);
    
    return apiService.get<PaginatedResponse<UserInvestment>>(
      `${API_ENDPOINTS.ADMIN_INVESTMENTS}?${params.toString()}`
    );
  }

  // Message Management
  async getAdminMessages(
    page: number = 1
  ): Promise<PaginatedResponse<Message>> {
    return apiService.get<PaginatedResponse<Message>>(
      `${API_ENDPOINTS.ADMIN_MESSAGES}?page=${page}`
    );
  }

  async sendCustomOffer(
    userId: number,
    subject: string,
    message: string,
    platform: 'facebook' | 'instagram' | 'youtube'
  ): Promise<Message> {
    return apiService.post<Message>(API_ENDPOINTS.SEND_MESSAGE, {
      recipient: userId,
      subject,
      message,
      offer_details: { platform },
    });
  }

  async approveLink(messageId: number): Promise<Message> {
    return apiService.post<Message>(
      `${API_ENDPOINTS.APPROVE_LINK}${messageId}/`
    );
  }

  async rejectLink(messageId: number, reason: string): Promise<Message> {
    return apiService.post<Message>(
      `${API_ENDPOINTS.REJECT_LINK}${messageId}/`,
      { reason }
    );
  }

  // Affiliate Overview
  async getAffiliateStats(): Promise<{
    total_referrals: number;
    total_commissions: number;
    active_referrers: number;
    top_referrers: User[];
  }> {
    return apiService.get(API_ENDPOINTS.ADMIN_AFFILIATES);
  }
}

export const adminService = new AdminService();

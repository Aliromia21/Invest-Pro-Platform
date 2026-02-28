// Transaction Service

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { Transaction, PaginatedResponse } from '../types/api';

class TransactionService {
  async getTransactions(
    page: number = 1,
    type?: string,
    status?: string
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({ page: page.toString() });
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    return apiService.get<PaginatedResponse<Transaction>>(
      `${API_ENDPOINTS.TRANSACTIONS}?${params.toString()}`
    );
  }

  async createDeposit(
    amount: number,
    walletAddress: string
  ): Promise<Transaction> {
    return apiService.post<Transaction>(API_ENDPOINTS.CREATE_DEPOSIT, {
      amount,
      wallet_address: walletAddress,
    });
  }

  async createWithdrawal(
    amount: number,
    walletAddress: string
  ): Promise<Transaction> {
    return apiService.post<Transaction>(API_ENDPOINTS.CREATE_WITHDRAWAL, {
      amount,
      wallet_address: walletAddress,
    });
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    return apiService.get<Transaction[]>(API_ENDPOINTS.TRANSACTION_HISTORY);
  }
}

export const transactionService = new TransactionService();

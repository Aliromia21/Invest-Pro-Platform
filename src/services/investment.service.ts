import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { 
  InvestmentPack, 
  UserInvestment,
  ChartData 
} from '../types/api';

class InvestmentService {
  async getInvestmentPacks(): Promise<InvestmentPack[]> {
    return apiService.get<InvestmentPack[]>(API_ENDPOINTS.INVESTMENT_PACKS);
  }

  async getUserInvestments(): Promise<UserInvestment[]> {
    return apiService.get<UserInvestment[]>(API_ENDPOINTS.USER_INVESTMENTS);
  }

  async createInvestment(packId: number, amount: number): Promise<UserInvestment> {
    return apiService.post<UserInvestment>(API_ENDPOINTS.CREATE_INVESTMENT, {
      pack_id: packId,
      amount,
    });
  }

  async getChartData(
    investmentId?: number,
    period: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<ChartData[]> {
    const params = new URLSearchParams({ period });
    if (investmentId) {
      params.append('investment_id', investmentId.toString());
    }
    
    return apiService.get<ChartData[]>(
      `${API_ENDPOINTS.INVESTMENT_CHART_DATA}?${params.toString()}`
    );
  }
}

export const investmentService = new InvestmentService();

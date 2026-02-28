
import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { DashboardStats } from '../types/api';

class DashboardService {
  async getUserStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>(API_ENDPOINTS.USER_STATS);
  }
}

export const dashboardService = new DashboardService();

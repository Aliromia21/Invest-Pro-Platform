
import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  SignupRequest 
} from '../types/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    
    // Store tokens
    apiService.setTokens(response.access, response.refresh);
    
    return response;
  }

  async signup(data: SignupRequest): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(API_ENDPOINTS.SIGNUP, data);
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.clearTokens();
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(API_ENDPOINTS.VERIFY_EMAIL, {
      token,
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_ENDPOINTS.FORGOT_PASSWORD,
      { email }
    );
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(API_ENDPOINTS.RESET_PASSWORD, {
      token,
      new_password: newPassword,
    });
  }

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_ENDPOINTS.CHANGE_PASSWORD,
      {
        old_password: oldPassword,
        new_password: newPassword,
      }
    );
  }

  async getProfile(): Promise<User> {
    return apiService.get<User>(API_ENDPOINTS.USER_PROFILE);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.patch<User>(API_ENDPOINTS.UPDATE_PROFILE, data);
  }

  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }

  clearSession(): void {
    apiService.clearTokens();
  }
}

export const authService = new AuthService();

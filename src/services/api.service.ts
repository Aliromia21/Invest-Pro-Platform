

import type { AxiosInstance, AxiosRequestConfig } from "axios";

import { api as customerClient } from "@/api/client";
import { adminApi as adminClient } from "@/api/adminApi";
import {
  getAccessToken as tsGetAccessToken,
  getRefreshToken as tsGetRefreshToken,
  setTokens as tsSetTokens,
  clearTokens as tsClearTokens,
  isAuthenticated as tsIsAuthenticated,
  type TokenScope,
} from "@/lib/auth/tokenStorage";

class ApiService {
  private session: TokenScope;
  private client: AxiosInstance;

  constructor(session: TokenScope, client: AxiosInstance) {
    this.session = session;
    this.client = client;
  }

  private getAccessToken(): string | null {
    return tsGetAccessToken(this.session);
  }

  private getRefreshToken(): string | null {
    return tsGetRefreshToken(this.session);
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    tsSetTokens(accessToken, refreshToken, this.session);
  }

  clearTokens(): void {
    tsClearTokens(this.session);
  }

  isAuthenticated(): boolean {
    return tsIsAuthenticated(this.session);
  }

  
  async refreshAccessToken(): Promise<boolean> {
    return !!this.getRefreshToken();
  }

  private async request<T>(
    method: AxiosRequestConfig["method"],
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const res = await this.client.request<T>({
        url: endpoint,
        method,
        data,
        ...config,
      });
      return res.data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.message ??
        "Request failed";

      if (err?.response?.status === 401 && this.getAccessToken()) {
        this.clearTokens();
      }

      throw new Error(msg);
    }
  }

  get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("get", endpoint, undefined, config);
  }

  post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("post", endpoint, data, config);
  }

  put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("put", endpoint, data, config);
  }

  patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("patch", endpoint, data, config);
  }

  delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("delete", endpoint, undefined, config);
  }

  uploadFile<T>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("post", endpoint, formData, {
      headers: {
        ...(config?.headers || {}),
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
  }
}

export const customerApiService = new ApiService("customer", customerClient);
export const adminApiService = new ApiService("admin", adminClient);

export const apiService = customerApiService;

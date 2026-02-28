import { api } from "./client";
import type { User, ApiResponse, LoginData } from "@/types/user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  country: string;
  phone: string;
  referral_code?: string;
}

export async function login(payload: LoginPayload): Promise<LoginData> {
  const res = await api.post<ApiResponse<LoginData>>("customer/login/", payload);
  return res.data.data;
}

export async function logout(): Promise<void> {
  const refresh = localStorage.getItem("refresh") || "";
  await api.post("customer/logout/", { refresh });
}

export async function fetchProfile(): Promise<User> {
  const res = await api.get<ApiResponse<User>>("customer/profile/");
  return res.data.data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await api.post<ApiResponse<User>>("customer/register/", payload);
  return res.data.data;
}

import { adminApi } from "./adminApi"; 
import type { ApiResponse, LoginData, User } from "@/types/user";

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export async function adminLogin(payload: AdminLoginPayload): Promise<LoginData> {
  const res = await adminApi.post<ApiResponse<LoginData>>("admin/login/", payload);
  return res.data.data;
}

export async function adminLogout(): Promise<void> {
  await adminApi.post("admin/logout/");
}

export async function fetchAdminProfile(): Promise<User> {
  await adminApi.get("admin/support-tickets/");

  return {
    id: 0,
    email: "admin",
    username: "admin",
    is_staff: true,
    is_superuser: true,
  } as unknown as User;
}

import { adminApi } from "./adminApi";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

export type AdminUser = {
  id: number;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await adminApi.get<ApiResponse<AdminUser[]>>("admin/users/");
  return res.data.data ?? [];
}

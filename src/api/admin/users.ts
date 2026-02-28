import { adminApi } from "@/api/adminApi";

export type AdminUser = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  country: string;
  balance: string;
  referral_code: string;
  referral_counter: number;
  is_kyc_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

function apiErr(res: ApiResponse<any>) {
  return res?.errors?.detail || res?.message || "Request failed";
}

// =======================
// GET all users
// =======================
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await adminApi.get<ApiResponse<AdminUser[]>>("/admin/users/");
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data ?? [];
}

// =======================
// GET single user
// =======================
export async function fetchAdminUser(userId: number): Promise<AdminUser> {
  const res = await adminApi.get<ApiResponse<AdminUser>>(`/admin/users/${userId}/`);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

// =======================
// PUT user update 
// =======================
export async function updateAdminUser(
  userId: number,
  payload: Partial<Pick<AdminUser, "is_active" | "is_kyc_verified">>
): Promise<AdminUser> {
  const res = await adminApi.put<ApiResponse<AdminUser>>(`/admin/users/${userId}/`, payload);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

export async function setAdminUserActive(userId: number, is_active: boolean) {
  return updateAdminUser(userId, { is_active });
}

export async function setAdminUserKycVerified(userId: number, is_kyc_verified: boolean) {
  return updateAdminUser(userId, { is_kyc_verified });
}

// =======================
// Adjust balance 
// =======================
export type AdjustBalancePayload = {
  amount: string; // "100.00"
  direction: "credit" | "debit";
  tx_type: string; // "DEPOSIT"
  reference?: string;
  metadata?: Record<string, any>;
};

export async function adjustAdminUserBalance(userId: number, payload: AdjustBalancePayload) {
  const res = await adminApi.post<
    ApiResponse<{
      user: AdminUser;
      transaction: any;
      new_balance: string;
    }>
  >(`/admin/users/${userId}/balance/adjust/`, payload);

  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data; // { user, transaction, new_balance }
}

// =======================
// DELETE user 
// =======================
export async function deleteAdminUser(userId: number) {
  const res = await adminApi.delete<ApiResponse<AdminUser>>(`/admin/users/${userId}/`);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

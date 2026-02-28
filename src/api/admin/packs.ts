import { adminApi } from "@/api/adminApi";

export type AdminPayoutType = "daily" | "end" | string;

export type AdminPack = {
  id: number;
  name: string;
  is_active?: boolean;
  min_amount?: string;
  max_amount?: string;
  duration_days?: number;
  roi_percent?: string; 
  payout_type?: AdminPayoutType;
  created_at?: string;
};

export type AdminPackUpsertPayload = {
  name: string;
  is_active: boolean;
  min_amount: string;
  max_amount: string;
  duration_days: number;
  roi_percent: string;
  payout_type: "daily" | "end";
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
// GET all packs
// =======================
export async function fetchAdminPacks(): Promise<AdminPack[]> {
  const res = await adminApi.get<ApiResponse<AdminPack[]>>("/admin/packs/");
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data ?? [];
}

// =======================
// GET single pack
// =======================
export async function fetchAdminPack(packId: number): Promise<AdminPack> {
  const res = await adminApi.get<ApiResponse<AdminPack>>(`/admin/packs/${packId}/`);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

// =======================
// CREATE pack
// =======================
export async function createAdminPack(payload: AdminPackUpsertPayload): Promise<AdminPack> {
  const res = await adminApi.post<ApiResponse<AdminPack>>("/admin/packs/", payload);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}


export async function updateAdminPack(packId: number, payload: AdminPackUpsertPayload): Promise<AdminPack> {
  const res = await adminApi.put<ApiResponse<AdminPack>>(`/admin/packs/${packId}/`, payload);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

// =======================
export async function toggleAdminPackActive(packId: number, is_active: boolean): Promise<AdminPack> {
  const res = await adminApi.put<ApiResponse<AdminPack>>(`/admin/packs/${packId}/`, { is_active } as any);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

// =======================
// DELETE pack
// =======================
export async function deleteAdminPack(packId: number): Promise<AdminPack> {
  const res = await adminApi.delete<ApiResponse<AdminPack>>(`/admin/packs/${packId}/`);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

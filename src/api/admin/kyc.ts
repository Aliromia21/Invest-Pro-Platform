import { adminApi } from "@/api/adminApi";

export type AdminKycStatus = "pending" | "approved" | "rejected";

export type AdminKycItem = {
  id: number;
  user_id: number;
  status: AdminKycStatus;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
  passport_image?: string | null;
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

export async function fetchAdminKycList(): Promise<AdminKycItem[]> {
  const res = await adminApi.get<ApiResponse<AdminKycItem[]>>("/admin/kyc/");
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data ?? [];
}

export async function approveAdminKyc(kycId: number, notes: string) {
  const res = await adminApi.post<ApiResponse<{ kyc: AdminKycItem; user: any }>>(
    `/admin/kyc/${kycId}/approve/`,
    { notes }
  );
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data; 
}

export async function rejectAdminKyc(kycId: number, notes: string) {
  const res = await adminApi.post<ApiResponse<{ kyc: AdminKycItem; user: any }>>(
    `/admin/kyc/${kycId}/reject/`,
    { notes }
  );
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data; 
}

export async function fetchAdminKycDetail(kycId: number): Promise<AdminKycItem> {
  const res = await adminApi.get<ApiResponse<AdminKycItem>>(`/admin/kyc/${kycId}/`);
  if (!res.data.success) throw new Error(apiErr(res.data));
  if (!res.data.data) throw new Error("Empty response data");
  return res.data.data;
}

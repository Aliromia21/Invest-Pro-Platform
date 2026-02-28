import { adminApi } from "@/api/adminApi";

export type AdminDepositStatus = "pending" | "approved" | "rejected";

export type AdminDepositRequest = {
  id: number;
  user_id: number;
  amount: string;
  status: AdminDepositStatus;
  payment_method: string;
  proof: string;
  reference: string;
  transaction_id: number | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  notes: string;
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

export async function fetchAdminDepositRequests(): Promise<AdminDepositRequest[]> {
  const res = await adminApi.get<ApiResponse<AdminDepositRequest[]>>(
    "/admin/deposits/requests/"
  );
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data ?? [];
}

export async function approveAdminDepositRequest(id: number, notes?: string) {
  const res = await adminApi.post<ApiResponse<AdminDepositRequest>>(
    `/admin/deposits/requests/${id}/approve/`,
    { notes: notes || "" }
  );
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

export async function rejectAdminDepositRequest(id: number, notes: string) {
  const res = await adminApi.post<ApiResponse<AdminDepositRequest>>(
    `/admin/deposits/requests/${id}/reject/`,
    { notes }
  );
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

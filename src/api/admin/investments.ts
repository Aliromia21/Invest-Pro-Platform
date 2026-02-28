import { adminApi } from "@/api/adminApi";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

function apiErr(res: ApiResponse<any>) {
  return res?.errors?.detail || res?.message || "Request failed";
}

export type AdminInvestment = {
  id: number;
  user_id?: number;
  amount?: string;
  [k: string]: any;
};

export async function fetchAdminInvestments(): Promise<AdminInvestment[]> {
  const res = await adminApi.get<ApiResponse<AdminInvestment[]>>("/admin/investments/");
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data ?? [];
}

export async function fetchAdminInvestment(investmentId: number): Promise<AdminInvestment> {
  const res = await adminApi.get<ApiResponse<AdminInvestment>>(`/admin/investments/${investmentId}/`);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

export async function forcePayoutAdminInvestment(
  investmentId: number
): Promise<{ paid?: string; investment?: { id: number } } & Record<string, any>> {
  const res = await adminApi.post<ApiResponse<any>>(`/admin/investments/${investmentId}/payout/`);
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

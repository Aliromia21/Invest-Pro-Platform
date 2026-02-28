import { api } from "@/api/api";

export type CustomerDepositStatus = "pending" | "approved" | "rejected";

export type CustomerDepositRequest = {
  id: number;
  user_id: number;
  amount: string;
  status: CustomerDepositStatus;
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

export async function createCustomerDepositRequest(payload: {
  amount: string;
  payment_method?: string;
  proof?: string;
  notes?: string;
}) {
  const res = await api.post<ApiResponse<CustomerDepositRequest>>(
    "/customer/deposits/request/",
    payload
  );
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data;
}

export async function fetchCustomerDepositRequests(): Promise<CustomerDepositRequest[]> {
  const res = await api.get<ApiResponse<CustomerDepositRequest[]>>(
    "/customer/deposits/requests/"
  );
  if (!res.data.success) throw new Error(apiErr(res.data));
  return res.data.data ?? [];
}

import { adminApi } from "./adminClient";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

export type AdminDepositRequest = {
  id: number;
  status: "pending" | "approved" | "rejected" | string;
  amount: string; 
  payment_method?: string;
  
  proof?: string;
  proof_url?: string;
  proof_image?: string;
  tx_hash?: string;
  wallet_address?: string;
  created_at: string;

  user?: {
    id: number;
    email: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
  user_id?: number;
};

export async function fetchDepositRequests(): Promise<AdminDepositRequest[]> {
  const res = await adminApi.get<ApiResponse<AdminDepositRequest[]>>(
    "admin/deposits/requests/"
  );
  return res.data.data ?? [];
}

export async function approveDepositRequest(requestId: number): Promise<void> {
  await adminApi.post(`admin/deposits/requests/${requestId}/approve/`);
}

export async function rejectDepositRequest(requestId: number): Promise<void> {
  await adminApi.post(`admin/deposits/requests/${requestId}/reject/`);
}

import { api } from "@/api/client";
import type { ApiResponse } from "@/types/user";
import type { WithdrawalRequest } from "@/types/withdrawal";

export type CreateWithdrawalPayload = {
  amount: string;          
  payout_address: string;  
  notes?: string;        
};

export async function createWithdrawalRequest(payload: CreateWithdrawalPayload) {
  const res = await api.post<ApiResponse<WithdrawalRequest>>(
    "customer/withdrawals/request/",
    payload
  );
  return res.data.data;
}

export async function fetchMyWithdrawalRequests() {
  const res = await api.get<ApiResponse<WithdrawalRequest[]>>(
    "customer/withdrawals/requests/"
  );
  return res.data.data ?? [];
}

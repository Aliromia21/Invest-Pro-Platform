import { adminApi } from "@/api/adminApi";

export type AdminWithdrawalRequest = {
  id: number;
  user_id: number;
  amount: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed" | string;
  payout_address: string;
  reference: string;
  transaction_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  notes: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: any;
};

function extractApiError(data: any, fallback: string) {
  return (
    data?.errors?.detail ||
    data?.detail ||
    data?.message ||
    fallback
  );
}

// =======================
// GET all withdrawal requests
// =======================
export async function fetchAdminWithdrawalRequests() {
  const res = await adminApi.get<ApiResponse<AdminWithdrawalRequest[]>>(
    "/admin/withdrawals/requests/"
  );
  return res.data?.data ?? [];
}

// =======================
// APPROVE withdrawal
// =======================
export async function approveAdminWithdrawalRequest(
  requestId: number,
  payload: {
    transaction_id?: string;
    notes?: string;
  }
) {
  const res = await adminApi.post<ApiResponse<any>>(
    `/admin/withdrawals/requests/${requestId}/approve/`, 
    payload
  );

  if (!res.data?.success) {
    throw new Error(extractApiError(res.data, "Approve failed"));
  }

  return res.data.data;
}

// =======================
// REJECT withdrawal
// =======================
export async function rejectAdminWithdrawalRequest(
  requestId: number,
  payload: {
    notes?: string;
  }
) {
  const res = await adminApi.post<ApiResponse<any>>(
    `/admin/withdrawals/requests/${requestId}/reject/`, 
    payload
  );

  if (!res.data?.success) {
    throw new Error(extractApiError(res.data, "Reject failed"));
  }

  return res.data.data;
}

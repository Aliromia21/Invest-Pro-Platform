import { adminApi } from "../adminApi";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any | null;
};

export type VerificationStatus = "pending" | "approved" | "rejected";
export type UserResponse = "pending" | "accepted" | "declined";

export type AdminMessage = {
  id: number;
  subject: string;
  body: string;
  reward: string;
  created_at: string;
};

export type MessageRecipient = {
  id: number;
  message: AdminMessage;
  user_id: number;
  user_response: UserResponse;
  submitted_link: string | null;
  verification_status: VerificationStatus;
  reward_given: boolean;
  reviewed_at: string | null;
};

export type ApproveRecipientData = {
  paid: string;
  recipient: MessageRecipient;
};

const base = "/admin/message-recipients/";

export async function listMessageRecipients(): Promise<ApiResponse<MessageRecipient[]>> {
  try {
    const res = await adminApi.get<ApiResponse<MessageRecipient[]>>(base);
    return res.data;
  } catch (err: any) {
    throw err?.response?.data ?? err;
  }
}

export async function getMessageRecipient(id: number): Promise<ApiResponse<MessageRecipient>> {
  try {
    const res = await adminApi.get<ApiResponse<MessageRecipient>>(`${base}${id}`);
    return res.data;
  } catch (err: any) {
    throw err?.response?.data ?? err;
  }
}

export async function approveMessageRecipient(
  id: number
): Promise<ApiResponse<ApproveRecipientData>> {
  try {
    const res = await adminApi.post<ApiResponse<ApproveRecipientData>>(
      `${base}${id}/approve/`,
      {}
    );
    return res.data;
  } catch (err: any) {
    throw err?.response?.data ?? err;
  }
}

export async function rejectMessageRecipient(
  id: number,
  notes: string
): Promise<ApiResponse<MessageRecipient>> {
  try {
    const res = await adminApi.post<ApiResponse<MessageRecipient>>(
      `${base}${id}/reject/`,
      { notes }
    );
    return res.data;
  } catch (err: any) {
    throw err?.response?.data ?? err;
  }
}

export function extractRecipientFromApprove(
  res: ApiResponse<ApproveRecipientData>
) {
  return { paid: res.data.paid, recipient: res.data.recipient };
}

export function extractRecipientFromReject(res: ApiResponse<MessageRecipient>) {
  return res.data;
}

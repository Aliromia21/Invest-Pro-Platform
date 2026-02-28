import { api } from "../api";
import type { ApiResponse } from "@/types/user";

export type MessageListItem = {
  id: number;
  user_response?: "pending" | "accepted" | "rejected" | string;
  reward_given?: boolean;
};

export type MessageEntryDetail = {
  id: number;
  submitted_link?: string;
  user_response?: string;
  reward_given?: boolean;
};

export async function listCustomerMessages(): Promise<MessageListItem[]> {
  const res = await api.get<ApiResponse<MessageListItem[]>>("customer/messages/");
  return (res.data as any)?.data ?? [];
}

export async function getMessageDetail(recipientId: number): Promise<MessageEntryDetail> {
  const res = await api.get<ApiResponse<MessageEntryDetail>>(`customer/messages/${recipientId}/`);
  return (res.data as any)?.data;
}

export async function submitMessageLink(recipientId: number, submitted_link: string) {
  const res = await api.put<ApiResponse<MessageEntryDetail>>(`customer/messages/${recipientId}/`, {
    submitted_link,
  });
  return (res.data as any)?.data;
}

export async function acceptMessageTask(recipientId: number) {
  const res = await api.post<ApiResponse<MessageEntryDetail>>(`customer/messages/${recipientId}/accept/`);
  return (res.data as any)?.data;
}

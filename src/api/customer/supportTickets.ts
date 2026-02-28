import { customerApi } from "@/api/customerApi";

export type ApiResp<T> = { success: boolean; message: string; data: T; errors: any };

export type SupportTicket = {
  id: number;
  user_id: number;
  name: string;
  whatsapp: string;
  telegram: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type CreateTicketPayload = {
  name: string;
  whatsapp: string;
  telegram: string;
  email: string;
  message: string;
};

export async function fetchCustomerSupportTickets(): Promise<SupportTicket[]> {
  const { data } = await customerApi.get<ApiResp<SupportTicket[]>>("/customer/support-tickets/");
  return data.data ?? [];
}

export async function createCustomerSupportTicket(
  payload: CreateTicketPayload
): Promise<SupportTicket> {
  const { data } = await customerApi.post<ApiResp<SupportTicket>>(
    "/customer/support-tickets/",
    payload
  );
  return data.data;
}

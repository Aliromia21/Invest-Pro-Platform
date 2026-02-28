import { adminApi } from "@/api/adminApi";

export type ApiResp<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

export type AdminSupportTicket = {
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

export async function fetchAdminSupportTickets(): Promise<AdminSupportTicket[]> {
  const { data } = await adminApi.get<ApiResp<AdminSupportTicket[]>>(
    "/admin/support-tickets/"
  );
  return Array.isArray(data?.data) ? data.data : [];
}

export async function updateAdminSupportTicket(
  id: number,
  is_read: boolean
): Promise<AdminSupportTicket> {
  const { data } = await adminApi.put<ApiResp<AdminSupportTicket>>(
    `/admin/support-tickets/${id}/`,
    { is_read }
  );
  return data.data;
}

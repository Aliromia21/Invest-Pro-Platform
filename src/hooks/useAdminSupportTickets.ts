import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/adminApi";

type ApiResp<T> = {
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

async function fetchAdminSupportTickets(): Promise<
  ApiResp<AdminSupportTicket[]>
> {
  const { data } = await adminApi.get<
    ApiResp<AdminSupportTicket[]>
  >("/admin/support-tickets/");

  return data;
}

export function useAdminSupportTickets() {
  return useQuery({
    queryKey: ["adminSupportTickets"],
    queryFn: fetchAdminSupportTickets,
  });
}

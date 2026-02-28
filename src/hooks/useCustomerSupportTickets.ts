import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/api/customerApi";

type ApiResp<T> = { success: boolean; message: string; data: T; errors: any };

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

export function useCustomerTickets() {
  return useQuery({
    queryKey: ["customer-support-tickets"],
    queryFn: async () => {
      const { data } = await customerApi.get<ApiResp<SupportTicket[]>>(
        "/customer/support-tickets/"
      );
      return data;
    },
  });
}

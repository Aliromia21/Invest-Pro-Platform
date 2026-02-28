import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export type CreateTicketPayload = {
  name: string;
  whatsapp: string;
  telegram: string;
  email: string;
  message: string;
};

export function useCreateCustomerTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTicketPayload) => {
      const { data } = await customerApi.post<ApiResp<SupportTicket>>(
        "/customer/support-tickets/",
        payload
      );
      return data.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customerSupportTickets"] });
    },
  });
}

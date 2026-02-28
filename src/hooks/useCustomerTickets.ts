import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/api/customerApi";

// ================== Types ==================
type ApiResp<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

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

// ================== API Call ==================
async function fetchCustomerTickets(): Promise<ApiResp<SupportTicket[]>> {
  const { data } = await customerApi.get<ApiResp<SupportTicket[]>>(
    "/customer/support-tickets/"
  );

  return data;
}

// ================== Hook ==================
export function useCustomerTickets() {
  return useQuery({
    queryKey: ["customerSupportTickets"],
    queryFn: fetchCustomerTickets,
  });
}

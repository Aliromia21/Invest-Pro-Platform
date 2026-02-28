import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/api/customerApi";

type ApiResp<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

export type CustomerWallet =
  | {
      address: string;
      network: string;
      updated_at: string;
    }
  | null;

async function fetchCustomerWallet(): Promise<ApiResp<CustomerWallet>> {
  const { data } = await customerApi.get<ApiResp<CustomerWallet>>(
    "/customer/wallet/"
  );
  return data;
}

export function useCustomerWallet() {
  return useQuery({
    queryKey: ["customerWallet"],
    queryFn: fetchCustomerWallet,
    staleTime: 60_000,
  });
}

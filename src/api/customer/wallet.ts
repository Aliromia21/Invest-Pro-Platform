import { customerApi } from "@/api/customerApi";

export type ApiResp<T> = { success: boolean; message: string; data: T; errors: any };

export type CustomerWallet =
  | { address: string; network: string; updated_at: string }
  | null;

export async function fetchCustomerWallet(): Promise<CustomerWallet> {
  const { data } = await customerApi.get<ApiResp<CustomerWallet>>("/customer/wallet/");
  return data.data; 
}

import { api } from "@/api/client"; 

export type AdminTx = {
  id: number;
  user_id: number;
  tx_type: string;
  direction: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type AdminTxResponse = {
  success: boolean;
  message: string;
  data: AdminTx[];
  errors: unknown;
};

export async function fetchAllTransactions(): Promise<AdminTx[]> {
  const res = await api.get<AdminTxResponse>("/admin/transactions");
  if (!res.data.success) throw new Error(res.data.message || "Failed");
  return res.data.data ?? [];
}

export type WithdrawalStatus = "pending" | "approved" | "rejected" | string;

export type WithdrawalRequest = {
  id: number;
  user_id: number;
  amount: string;
  status: WithdrawalStatus;
  payout_address: string;
  reference: string;
  transaction_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null; 
  notes: string;
};

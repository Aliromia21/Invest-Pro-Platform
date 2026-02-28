import { api } from "@/api/client";

export type ReferralPackDto = {
  id: number;
  name: string;
  bonus: string; 
  is_claimed: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

export async function getReferralPacks(): Promise<ReferralPackDto[]> {
  const res = await api.get<ApiEnvelope<ReferralPackDto[]>>("customer/referral-packs");
  return (res.data as any)?.data ?? [];
}

export async function claimReferralPack(packId: number): Promise<{
  pack_id: number;
  bonus: string;
  new_balance: string;
}> {
  const res = await api.post(`/customer/referral-packs/${packId}/claim/`); 
  return res.data?.data;
}
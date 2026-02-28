import { adminApi } from "@/api/adminApi";

export type ApiResp<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: any;
};

export type AdminWallet = {
  address: string;
  network: string;
  updated_at: string;
};

export type CreateWalletPayload = {
  address: string;
  network: string;
};

export type UpdateWalletPayload = {
  address?: string;
  network?: string;
};

export async function createAdminWallet(
  payload: CreateWalletPayload
): Promise<ApiResp<AdminWallet>> {
  const { data } = await adminApi.post<ApiResp<AdminWallet>>(
    "/admin/wallet/",
    payload
  );
  return data;
}

export async function updateAdminWallet(
  payload: UpdateWalletPayload
): Promise<ApiResp<AdminWallet | null>> {
  const { data } = await adminApi.put<ApiResp<AdminWallet | null>>(
    "/admin/wallet/",
    payload
  );
  return data;
}

export async function upsertAdminWalletSmart(payload: {
  address: string;
  network: string;
}): Promise<AdminWallet> {
  const putRes = await updateAdminWallet({
    address: payload.address,
    network: payload.network,
  });

  if (putRes?.success && putRes.data) return putRes.data;

  const detail =
    putRes?.errors?.detail ||
    putRes?.errors?.message ||
    putRes?.message ||
    "";

  const looksNotCreated =
    String(detail).toLowerCase().includes("not created") ||
    String(detail).toLowerCase().includes("wallet not created");

  if (looksNotCreated) {
    const postRes = await createAdminWallet({
      address: payload.address,
      network: payload.network,
    });

    if (postRes?.success && postRes.data) return postRes.data;

    throw new Error(postRes?.message || "Failed to create wallet");
  }

  throw new Error(
    putRes?.errors?.detail ||
      putRes?.message ||
      "Failed to update wallet"
  );
}

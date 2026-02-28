import { adminApi } from "../adminApi";

export async function createAdminMessage(payload: { subject: string; body: string; reward: string }) {
  const res = await adminApi.post("/admin/messages/", payload);
  return res.data;
}

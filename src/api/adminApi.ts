import { createApiClient } from "@/lib/http/axiosFactory";


const RAW_BASE_URL =
  (import.meta as any).env?.VITE_ADMIN_API_BASE_URL ??
  (import.meta as any).env?.VITE_API_BASE_URL ??
  "https://investpro-company.com/api";

const BASE_URL = String(RAW_BASE_URL).replace(/\/+$/, "") + "/";


export const adminApi = createApiClient({
  baseURL: BASE_URL,
  scope: "admin"
});

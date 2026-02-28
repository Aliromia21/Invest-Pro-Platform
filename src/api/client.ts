import { createApiClient } from "@/lib/http/axiosFactory";

const RAW_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "https://investpro-company.com/api";

export const API_BASE_URL = String(RAW_BASE_URL).replace(/\/+$/, "") + "/";

const PUBLIC_PATHS = [
  "customer/login/",
  "customer/register/",
  "customer/login",
  "customer/register",
  "auth/login/",
  "auth/signup/",
];

export const api = createApiClient({
  baseURL: API_BASE_URL,
  scope: "customer",
  publicPaths: PUBLIC_PATHS
});

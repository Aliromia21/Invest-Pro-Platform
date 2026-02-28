import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  type TokenScope,
} from "@/lib/auth/tokenStorage";

type CreateClientOptions = {
  baseURL: string;
  scope: TokenScope;
  publicPaths?: string[];
  refreshEndpoint?: string;
 
  extractAccessToken?: (data: any) => string | null;
};

export function createApiClient(opts: CreateClientOptions): AxiosInstance {
  const publicSet = new Set((opts.publicPaths ?? []).map((p) => p.replace(/^\/+/, "")));

  const client = axios.create({
    baseURL: opts.baseURL,
    withCredentials: false,
  });

  client.interceptors.request.use((config) => {
    
    const rawUrl = String(config.url ?? "");
    const normalized = rawUrl.replace(/^\/+/, "");
    config.url = normalized;
    const path = normalized;

    
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers = config.headers ?? {};
      delete (config.headers as any)["Content-Type"];
      delete (config.headers as any)["content-type"];
    }

    if (publicSet.has(path)) return config;

    const token = getAccessToken(opts.scope);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      const status = err?.response?.status;
      const original: AxiosRequestConfig & { _retry?: boolean } = err?.config ?? {};

      if (status !== 401) return Promise.reject(err);

      const rawUrl = String(original.url ?? "");
      const path = rawUrl.replace(/^\/+/, "");


      if (
        path === "customer/messages/" ||
        path.startsWith("customer/messages/")
      ) {
        return Promise.reject(err);
      }


      if (publicSet.has(path)) {
        return Promise.reject(err);
      }

      if (!original._retry && opts.refreshEndpoint) {
        const refreshToken = getRefreshToken(opts.scope);
        if (refreshToken) {
          original._retry = true;
          try {
            const refreshRes = await axios.post(
              joinUrl(opts.baseURL, opts.refreshEndpoint),
              { refresh: refreshToken },
              { headers: { "Content-Type": "application/json" } }
            );

            const access =
              opts.extractAccessToken?.(refreshRes.data) ??
              (typeof refreshRes.data?.access === "string" ? refreshRes.data.access : null);

            if (access) {
              setTokens(access, undefined, opts.scope);
              return client(original);
            }
          } catch {
          }
        }
      }

      const shouldForceLogout =
        path.startsWith("customer/profile/") ||
        path.startsWith("customer/wallet/");

      if (shouldForceLogout) {
        clearTokens(opts.scope);
        emitUnauthorized(opts.scope);
      }

      return Promise.reject(err);

    }
  );

  return client;
}

function joinUrl(base: string, path: string): string {
  const b = String(base).replace(/\/+$/, "");
  const p = String(path).replace(/^\/+/, "");
  return `${b}/${p}`;
}

function emitUnauthorized(scope: TokenScope) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("auth:unauthorized", { detail: { scope } }));
  } catch {
  }
}


export type TokenScope = "customer" | "admin";

const KEYS = {
  customer: {
    access: ["access_token", "access"],
    refresh: ["refresh_token", "refresh"],
  },
  admin: {
    access: ["admin_access", "admin_access_token"],
    refresh: ["admin_refresh", "admin_refresh_token"],
  },
} as const;

function firstExisting(keys: readonly string[]): string | null {
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

function setAll(keys: readonly string[], value: string): void {
  for (const k of keys) localStorage.setItem(k, value);
}

function clearAll(keys: readonly string[]): void {
  for (const k of keys) localStorage.removeItem(k);
}

export function getAccessToken(scope: TokenScope = "customer"): string | null {
  return firstExisting(KEYS[scope].access);
}

export function getRefreshToken(scope: TokenScope = "customer"): string | null {
  return firstExisting(KEYS[scope].refresh);
}

export function setTokens(
  accessToken: string,
  refreshToken?: string,
  scope: TokenScope = "customer"
): void {
  setAll(KEYS[scope].access, accessToken);
  if (refreshToken) setAll(KEYS[scope].refresh, refreshToken);
}

export function clearTokens(scope: TokenScope = "customer"): void {
  clearAll(KEYS[scope].access);
  clearAll(KEYS[scope].refresh);
}

export function isAuthenticated(scope: TokenScope = "customer"): boolean {
  return !!getAccessToken(scope);
}

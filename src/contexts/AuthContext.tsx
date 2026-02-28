import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { User, LoginData } from "@/types/user";
import {
  login as customerLoginApi,
  logout as customerLogoutApi,
  fetchProfile as fetchCustomerProfile,
} from "@/api/auth";
import {
  adminLogin as adminLoginApi,
  adminLogout as adminLogoutApi,
  fetchAdminProfile,
} from "@/api/adminAuth";

type SessionKind = "customer" | "admin" | null;

interface AuthContextValue {
  user: User | null;

  booting: boolean;

  loading: boolean;

  isAuthenticated: boolean;
  isAdmin: boolean;
  sessionKind: SessionKind;

  loginCustomer: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEYS = {
  customer: { access: "access", refresh: "refresh" },
  admin: { access: "admin_access", refresh: "admin_refresh" },
};

function readToken(kind: Exclude<SessionKind, null>) {
  return localStorage.getItem(TOKEN_KEYS[kind].access);
}

function clearTokens(kind: Exclude<SessionKind, null>) {
  localStorage.removeItem(TOKEN_KEYS[kind].access);
  localStorage.removeItem(TOKEN_KEYS[kind].refresh);
}

function saveTokens(kind: Exclude<SessionKind, null>, data: LoginData) {
  localStorage.setItem(TOKEN_KEYS[kind].access, data.access);
  localStorage.setItem(TOKEN_KEYS[kind].refresh, data.refresh);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionKind, setSessionKind] = useState<SessionKind>(null);

  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);

  const isAdmin = !!user?.is_staff || !!user?.is_superuser;

  useEffect(() => {
    const handler = (ev: any) => {
      const scope = ev?.detail?.scope as SessionKind | undefined;
      if (!scope) return;

      setUser(null);
      setSessionKind(null);

      if (scope === "customer" || scope === "admin") {
        clearTokens(scope);
      }
    };

    window.addEventListener("auth:unauthorized", handler as any);
    return () => window.removeEventListener("auth:unauthorized", handler as any);
  }, []);

  useEffect(() => {
    const customerAccess = readToken("customer");
    const adminAccess = readToken("admin");

    const kind: SessionKind = adminAccess ? "admin" : customerAccess ? "customer" : null;

    if (!kind) {
      setBooting(false);
      return;
    }

    setSessionKind(kind);

    (async () => {
      try {
        if (kind === "admin") {
          const u = await fetchAdminProfile();
          setUser(u);
        } else {
          const u = await fetchCustomerProfile();
          setUser(u);
        }
      } catch {
        clearTokens(kind);
        setUser(null);
        setSessionKind(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const loginCustomer = async (email: string, password: string) => {
    setLoading(true);
    try {
      clearTokens("admin");

      const data: LoginData = await customerLoginApi({ email, password });
      saveTokens("customer", data);

      setUser(data.user);
      setSessionKind("customer");
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    setLoading(true);
    try {
      clearTokens("customer");

      const data: LoginData = await adminLoginApi({ email, password });
      saveTokens("admin", data);

      setUser(data.user);
      setSessionKind("admin");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    const kind = sessionKind;

    try {
      if (kind === "customer") {
        await customerLogoutApi();
      }
    } catch {
      
    } finally {
      if (kind) clearTokens(kind);
      setUser(null);
      setSessionKind(null);
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      booting,
      loading,
      isAuthenticated: !!user,
      isAdmin,
      sessionKind,
      loginCustomer,
      loginAdmin,
      logout,
    }),
    [user, booting, loading, isAdmin, sessionKind]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

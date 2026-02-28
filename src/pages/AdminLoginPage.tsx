import { useMemo, useState } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin, loading, sessionKind, isAdmin, user } = useAuth();

  const [params] = useSearchParams();
  const k = params.get("k");
  const expectedKey = import.meta.env.VITE_ADMIN_LOGIN_KEY as string | undefined;

  if (!expectedKey || k !== expectedKey) {
    return <Navigate to="/" replace />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const isAlreadyAdminAuthed = useMemo(() => {
    return !!user && sessionKind === "admin" && isAdmin;
  }, [user, sessionKind, isAdmin]);

  if (isAlreadyAdminAuthed) {
    return <Navigate to="/admin" replace />;
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      await loginAdmin(email.trim(), password);
      toast.success("Admin logged in successfully.");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl">Admin Login</h1>
            <p className="text-blue-200 text-sm">InvestPro Management Panel</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-200 text-sm mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="admin@company.com"
              className="w-full h-12 px-4 rounded-lg bg-black/30 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 text-sm mb-2">Password</label>

            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-12 px-4 pr-12 rounded-lg bg-black/30 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-green-400"
              />

              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-9 w-9 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              canSubmit
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90"
                : "bg-white/10 text-white/50 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Back to Landing
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-blue-200">
          This area is restricted to authorized administrators only.
        </div>
      </div>
    </div>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";
import { Home, Users, ShieldCheck } from "lucide-react";
import { Toaster } from "sonner";
import ReferralCapture from "./ReferralCapture.tsx";
import LandingPageApp from "./LandingPageApp";
import CustomerApp from "./CustomerApp";
import AdminApp from "./AdminApp";
import AdminLoginPage from "./pages/AdminLoginPage";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { user, booting, loading, sessionKind, isAdmin } = useAuth();

  const isCustomerAuthed =
    !booting && sessionKind === "customer" && !!user;

  const isAdminAuthed =
    !booting && sessionKind === "admin" && !!user && isAdmin;

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Toaster richColors position="top-right" />

      <Routes>
        {/* Landing + Auth */}
        <Route path="/" element={<LandingPageApp />} />

        {/* Customer (Protected) */}
        <Route
          path="/app/*"
          element={
            isCustomerAuthed ? (
              <CustomerApp />
            ) : (
              <Navigate to="/?page=login" replace />
            )
          }
        />

        {/* Admin Login (Public) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin (Protected) */}
        <Route
          path="/admin/*"
          element={
            isAdminAuthed ? (
              <AdminApp />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route path="/preview" element={<PreviewSelector />} />
        {/* Referral Link Capture */}
        <Route path="/ref/:code" element={<ReferralCapture />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}


function PreviewSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-white mb-4">InvestPro Platform</h1>
          <p className="text-blue-200 text-lg">
            Select a section to preview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Landing */}
          <a
            href="/"
            className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400 hover:bg-white/20 transition-all"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white mb-3">Landing Page & Auth</h2>
            <p className="text-blue-200 text-sm">
              Public website, login, signup, verification, forgot password
            </p>
          </a>

          {/* Customer */}
          <a
            href="/app"
            className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-purple-400 hover:bg-white/20 transition-all"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white mb-3">Customer Dashboard</h2>
            <p className="text-blue-200 text-sm">
              Investments, deposits, withdrawals, referrals
            </p>
          </a>

          {/* Admin */}
          <a
            href="/admin"
            className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-green-400 hover:bg-white/20 transition-all"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white mb-3">Admin Dashboard</h2>
            <p className="text-blue-200 text-sm">
              Users, KYC, deposits, withdrawals, affiliates
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}

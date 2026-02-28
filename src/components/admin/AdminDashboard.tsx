import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, LogOut } from 'lucide-react';

import { AdminOverview } from './AdminOverview';
import { UsersManagement } from './UsersManagement';
import { DepositRequests } from './DepositRequests';
import { AdminPacks } from './AdminPacks';
import { WithdrawalRequests } from './WithdrawalRequests';
import { MessageRecipientsTab } from "@/components/admin/messages/MessageRecipientsTab";
import { InvestmentManagement } from './InvestmentManagement';
import { KYCVerification } from './KYCVerification';
import { AdminSupportTickets } from "./AdminSupportTickets";
import { AdminWallet } from "./AdminWallet";
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';

type AdminTab =
  | 'overview'
  | 'users'
  | 'kyc'
  | 'deposits'
  | 'withdrawals'
  | 'investments'
  | 'packs'
  | 'support'
  | "wallet";


export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const navigate = useNavigate();
  const { user, isAdmin, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      navigate('/admin/login', { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  if (loading) return null;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white mb-1">Admin Dashboard</h1>
                <p className="text-blue-200 text-sm">InvestPro Management Panel</p>

                <p className="text-blue-300 text-xs mt-1">
                  Logged in as <span className="font-mono">{user.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="bg-white/10 backdrop-blur-sm rounded-xl p-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              Users
            </button>

            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === 'kyc'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              KYC Requests
            </button>

            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === 'deposits'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              Deposits
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === 'withdrawals'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              Withdrawals
            </button>

            <button
              onClick={() => setActiveTab('investments')}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === 'investments'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              Investments
            </button>

                        <button
              onClick={() => setActiveTab('packs')}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === 'packs'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              Packs
            </button>


            

            <button
              onClick={() => setActiveTab("wallet")}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === "wallet"
                  ? "bg-blue-500 text-white"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              Wallet
            </button>


            

            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-3 rounded-lg transition-all text-sm ${
                activeTab === 'support'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              Support Tickets
            </button>
          </nav>
        </header>

        {/* Content */}
        <main>
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === "wallet" && <AdminWallet />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'kyc' && <KYCVerification />}
          {activeTab === 'deposits' && <DepositRequests />}
          {activeTab === 'withdrawals' && <WithdrawalRequests />}
          {activeTab === 'investments' && <InvestmentManagement />}
          {activeTab === 'packs' && <AdminPacks />}
          {activeTab === 'affiliates' && <AffiliateOverview />}
          {activeTab === "messages" && <MessageRecipientsTab />}
          {activeTab === "support" && <AdminSupportTickets />}

        </main>
      </div>
    </div>
  );
}

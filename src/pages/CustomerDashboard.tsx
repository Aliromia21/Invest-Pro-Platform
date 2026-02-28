import { useMemo } from 'react';
import { Dashboard } from '../components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-blue-200">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-blue-200">
          Please log in to view your dashboard.
        </p>
      </div>
    );
  }

  const numericBalance = useMemo(
    () => parseFloat(user.balance ?? '0'),
    [user.balance]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-white mb-2">InvestPro Platform</h1>
              <p className="text-blue-200">Your Gateway to Smart Investing</p>
              <p className="text-blue-300 text-sm mt-1">
                Logged in as <span className="font-mono">{user.email}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Total Balance</p>
              <p className="text-white">
                {user.balance} USDT
              </p>
            </div>
          </div>
        </header>

        <main>
          <Dashboard
            balance={numericBalance}
            selectedPack="Professional Pack"
            referralCode={user.referral_code}
          />
        </main>
      </div>
    </div>
  );
}

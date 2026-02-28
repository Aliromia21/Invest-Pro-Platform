import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Dashboard } from './components/Dashboard';
import { InvestmentPacks } from './components/InvestmentPacks';
import { Transactions } from './components/Transactions';
import { Referrals } from './components/Referrals';
import { OfferPopup, Offer } from './components/OfferPopup';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useAuth } from './contexts/AuthContext';
import { api } from './api/api';
import { toast } from 'sonner';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';


type DashboardTab = 'dashboard' | 'invest' | 'transactions' | 'referrals';

type Investment = {
  id: number;
  amount: string;
  status: 'active' | 'completed' | 'cancelled' | string;
  expected_total_return?: string;
  duration_days?: number;
};

export type Tx = {
  id: number;
  tx_type: string;
  amount: string;
  created_at?: string;
};

const OFFERS_ENABLED = false;


const mockOffer: Offer = {
  id: 'offer-1',
  userId: 'current-user',
  title: 'Share & Earn $20!',
  message:
    'Share our platform on your Facebook profile and earn an instant $20 bonus to your account! Help us grow our community and get rewarded.',
  reward: '$20 USDT',
  actionLabel: 'Share on Facebook',
  actionUrl: 'https://www.facebook.com/sharer/sharer.php?u=https://investpro.com',
  createdAt: new Date().toISOString(),
};

export default function CustomerApp() {
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  useMessageNotifications(user?.id);


  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

  // balance الحقيقي من profile
  const [balance, setBalance] = useState<number>(() =>
    user ? parseFloat(user.balance ?? '0') : 0
  );

  // referralCount الحقيقي من profile (لا تعتمد على user في AuthContext)
  const [referralCount, setReferralCount] = useState<number>(0);

  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [activeInvestment, setActiveInvestment] = useState<Investment | null>(null);

  const [transactions, setTransactions] = useState<Tx[]>([]);

  const referralCode = useMemo(() => user?.referral_code ?? '—', [user?.referral_code]);

  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [dismissedOffers, setDismissedOffers] = useState<string[]>([]);

  // حماية
  useEffect(() => {
    if (!user) navigate('/', { replace: true });
  }, [user, navigate]);

  // 1) Profile -> balance + referralCount
  const fetchProfile = useCallback(async () => {
    const res = await api.get('/customer/profile/');
    const u = res.data?.data ?? res.data?.user ?? res.data;

    const b = parseFloat(u?.balance ?? '0');
    if (Number.isFinite(b)) setBalance(b);

    setReferralCount(Number(u?.referral_counter ?? 0));
  }, []);

  // 2) Investments -> activeInvestment + selectedPack
  const fetchInvestments = useCallback(async () => {
    const res = await api.get('/customer/investments/');
    const list: Investment[] = res.data?.data ?? [];

    const activeBase = list.find((inv) => String(inv.status).toLowerCase() === 'active') ?? list[0] ?? null;

    // نحاول جلب تفاصيل الاستثمار النشط للحصول على expected_total_return (إن توفر).
    let active: Investment | null = activeBase;
    if (activeBase?.id) {
      try {
        const detail = await api.get(`/customer/investments/${activeBase.id}/`);
        const d = detail.data?.data;
        if (d && typeof d === 'object') {
          active = { ...activeBase, ...d };
        }
      } catch {
        // ignore detail failure
      }
    }

    setActiveInvestment(active);
    setSelectedPack(active ? `Investment #${active.id}` : null);
  }, []);

  // 3) Transactions
  const fetchTransactions = useCallback(async () => {
    const res = await api.get('/customer/transactions/');
    const list: Tx[] = res.data?.data ?? [];
    setTransactions(list);
  }, []);

  // أول تحميل
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const results = await Promise.allSettled([fetchProfile(), fetchInvestments(), fetchTransactions()]);

        // Report partial failures without killing the whole dashboard
        const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
        if (failed.length) {
          console.log("Initial fetch partial failures", failed);
          toast.error("Some account data failed to load.");
        }
      } catch (e) {
        console.log('Initial fetch failed', e);
        toast.error('Failed to load your account data.');
      }
    })();
  }, [user, fetchProfile, fetchInvestments, fetchTransactions]);

  // Offers
  useEffect(() => {
  if (!OFFERS_ENABLED) return;
  if (!user) return;

  const offerKey = `offer-seen-${mockOffer.id}-user-${user.id}`;
  const hasSeenOffer = localStorage.getItem(offerKey);

  if (!hasSeenOffer && !dismissedOffers.includes(mockOffer.id)) {
    const timer = setTimeout(() => setCurrentOffer(mockOffer), 1000);
    return () => clearTimeout(timer);
  }
}, [user, dismissedOffers]);


  const handleAcceptOffer = (offerId: string) => {
    if (!user) return;
    const offerKey = `offer-seen-${offerId}-user-${user.id}`;
    localStorage.setItem(offerKey, 'accepted');
    setCurrentOffer(null);

    toast.success('Offer accepted. Reward will be credited after verification.');
  };

  const handleDeclineOffer = (offerId: string) => {
    if (!user) return;
    const offerKey = `offer-seen-${offerId}-user-${user.id}`;
    localStorage.setItem(offerKey, 'declined');
    setDismissedOffers((prev) => [...prev, offerId]);
    setCurrentOffer(null);

    toast.message('Offer dismissed.');
  };

  const handleLogout = async () => {
    try {
      await authLogout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  // آخر 5 معاملات للـ Dashboard (مُرتّبة بالأحدث)
  const last5Transactions = useMemo(() => {
    return (transactions ?? [])
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [transactions]);

  if (!user) return null;

  return (
    <>
      <OfferPopup
        offer={OFFERS_ENABLED ? currentOffer : null}
        onAccept={handleAcceptOffer}
        onDecline={handleDeclineOffer}
      />


      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="mb-8">
             <div className="flex flex-col gap-6 mb-8 
                lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-white mb-2">InvestPro Platform</h1>
                <p className="text-blue-200">Your Gateway to Smart Investing</p>
                <p className="text-blue-300 text-sm mt-1">
                  Logged in as <span className="font-mono">{user.email}</span>
                </p>

                {activeInvestment && (
                  <p className="text-blue-200 text-xs mt-1">
                    Active Investment: <span className="font-mono">#{activeInvestment.id}</span>
                  </p>
                )}
              </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <LanguageSwitcher />
                <div className="text-right">
                  <p className="text-blue-200 text-sm">Total Balance</p>
                  <p className="text-white">{balance.toFixed(2)} USDT</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

           <nav className="bg-white/10 backdrop-blur-sm rounded-xl p-2 
                flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('invest')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'invest'
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                Investment Packs
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                Transactions
              </button>

              <button
                onClick={() => setActiveTab('referrals')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'referrals'
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                Referrals
              </button>
            </nav>
          </header>

          <main>
            {activeTab === 'dashboard' && (
              <Dashboard
                balance={balance}
                selectedPack={selectedPack}
                referralCode={referralCode}
                referralCount={referralCount}
                transactions={last5Transactions}
                activeInvestment={activeInvestment}
              />
            )}

            {activeTab === 'invest' && (
              <InvestmentPacks
                selectedPack={selectedPack}
                balance={balance}
                setBalance={setBalance}
                onSelectPack={(_, packName) => {
                  setSelectedPack(packName); // UI سريع
                }}
                onAfterInvest={async () => {
                  const results = await Promise.allSettled([fetchProfile(), fetchInvestments(), fetchTransactions()]);

        // Report partial failures without killing the whole dashboard
        const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
        if (failed.length) {
          console.log("Initial fetch partial failures", failed);
          toast.error("Some account data failed to load.");
        }
                }}
              />
            )}

            {activeTab === 'transactions' && (
              <Transactions
                balance={balance}
                setBalance={setBalance}
                transactions={transactions}
                onRefresh={fetchTransactions}
              />
            )}

            {activeTab === 'referrals' && <Referrals referralCode={referralCode} />}
          </main>
        </div>
      </div>
    </>
  );
}

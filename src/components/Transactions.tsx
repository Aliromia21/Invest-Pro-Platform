import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { useLanguage } from '../contexts/LanguageContext';


function toMediaUrlSafe(maybeUrl?: string | null): string {
  const v = (maybeUrl ?? '').toString().trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;

  const base = (api.defaults.baseURL ?? '').toString().trim();
  let origin = window.location.origin;
  try {
    if (base) origin = new URL(base).origin;
  } catch {
  }

  let path = v;
  if (!path.startsWith('/')) path = `/${path}`;
  if (!path.startsWith('/media/') && /\/deposits\/proofs\//i.test(path)) {
    path = `/media${path}`;
  }
  return `${origin}${path}`;
}

type Tx = {
  id: number;
  user_id: number;
  tx_type: string;
  direction: 'credit' | 'debit' | string;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference: string;
  metadata: Record<string, any>;
  created_at: string;
};

type WithdrawalRequest = {
  id: number;
  user_id: number;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | string;
  payout_address: string;
  reference: string;
  transaction_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  notes: string;
};

type DepositRequest = {
  id: number;
  user_id: number;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  payment_method: string;
  proof: string;
  reference: string;
  transaction_id: number | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  notes: string;
};

interface TransactionsProps {
  balance: number;
  setBalance: (balance: number) => void;
}

function toNumber(v: any, fallback = 0) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function humanizeType(txType: string, t: (k: string, vars?: any) => string) {
  const key = (txType || '').toLowerCase();
  if (key === 'deposit') return t('tx.type.deposit');
  if (key === 'withdrawal') return t('tx.type.withdrawal');
  if (key === 'earning') return t('tx.type.earning');
  if (key === 'reward') return t('tx.type.reward');
  if (key === 'investment_create') return t('tx.type.investment_create');
  return (txType || '').replace(/_/g, ' ');
}

const TYPE_FILTERS = [
  { key: 'all', labelKey: 'tx.filters.all' },
  { key: 'deposit', labelKey: 'tx.filters.deposits' },
  { key: 'withdrawal', labelKey: 'tx.filters.withdrawals' },
  { key: 'earning', labelKey: 'tx.filters.earnings' },
  { key: 'reward', labelKey: 'tx.filters.rewards' },
  { key: 'investment_create', labelKey: 'tx.filters.investments' },
] as const;

type TypeFilterKey = (typeof TYPE_FILTERS)[number]['key'];
type DirFilterKey = 'all' | 'credit' | 'debit';

function statusPill(status: string, t: (k: string, vars?: any) => string) {
  const s = String(status || '').toLowerCase();

  const cls =
    s === 'pending'
      ? 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30'
      : s === 'approved' || s === 'completed'
      ? 'bg-green-500/15 text-green-300 border-green-400/30'
      : s === 'rejected'
      ? 'bg-red-500/15 text-red-300 border-red-400/30'
      : 'bg-white/10 text-blue-100 border-white/20';

  const label =
    s === 'pending'
      ? t('tx.withdraw.status.pending')
      : s === 'approved'
      ? t('tx.withdraw.status.approved')
      : s === 'processing'
      ? t('tx.withdraw.status.processing')
      : s === 'completed'
      ? t('tx.withdraw.status.completed')
      : s === 'rejected'
      ? t('tx.withdraw.status.rejected')
      : status;

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs border ${cls}`}>
      {label}
    </span>
  );
}

export function Transactions({ balance, setBalance }: TransactionsProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [items, setItems] = useState<Tx[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<TypeFilterKey>('all');
  const [dirFilter, setDirFilter] = useState<DirFilterKey>('all');
  const [query, setQuery] = useState('');

  // Withdraw dialog state
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  // Deposit dialog state
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositProofFile, setDepositProofFile] = useState<File | null>(null);
  const [depositSubmitting, setDepositSubmitting] = useState(false);

  const [depositWallet, setDepositWallet] = useState<
    { address: string; network?: string; updated_at?: string } | null
  >(null);
  const [depositWalletLoading, setDepositWalletLoading] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);


  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await api.get('/customer/transactions/');
      const list: Tx[] = res.data?.data ?? [];
      const normalized = Array.isArray(list) ? list : [];

      normalized.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setItems(normalized);

      // Update balance from latest transaction
      if (normalized.length > 0) {
        const latestAfter = toNumber(normalized[0].balance_after, NaN);
        if (Number.isFinite(latestAfter)) setBalance(latestAfter);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        t('tx.errors.loadFail');
      setErrorMsg(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const res = await api.get('/customer/withdrawals/requests/');
      const list: WithdrawalRequest[] = res.data?.data ?? [];
      const normalized = Array.isArray(list) ? list : [];
      normalized.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setWithdrawals(normalized);
    } catch {
      setWithdrawals([]);
    }
  };

  const fetchDepositRequests = async () => {
    try {
      const res = await api.get('/customer/deposits/requests/');
      const list: DepositRequest[] = res.data?.data ?? [];
      const normalized = Array.isArray(list) ? list : [];
      normalized.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setDeposits(normalized);
    } catch {
      setDeposits([]);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchTransactions(), fetchWithdrawalRequests(), fetchDepositRequests()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    (async () => {
      setDepositWalletLoading(true);
      try {
        const res = await api.get('/customer/wallet/');
        const payload = res?.data;
        if (payload?.success && payload?.data?.address) {
          setDepositWallet(payload.data);
        } else {
          setDepositWallet(null);
        }
      } catch {
        setDepositWallet(null);
      } finally {
        setDepositWalletLoading(false);
      }
    })();
  }, []);

  function normKey(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")   
    .replace(/^_+|_+$/g, "")      
    .replace(/_+/g, "_");         
}

function normDir(v: any) {
  return String(v ?? "").trim().toLowerCase();
}


  const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();

  return items.filter((tx) => {
    const txType = normKey(tx.tx_type);
    const txDir = normDir(tx.direction);

    const matchesType =
      typeFilter === "all" ? true : txType.includes(typeFilter);

    const matchesDir =
      dirFilter === "all" ? true : txDir === dirFilter;

    const matchesQuery =
      !q
        ? true
        : [
            String(tx.id),
            txType,
            txDir,
            String(tx.amount),
            String(tx.reference),
            String(tx.created_at),
          ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q));

    return matchesType && matchesDir && matchesQuery;
  });
}, [items, typeFilter, dirFilter, query]);


  const submitWithdraw = async () => {
    const amountNum = toNumber(withdrawAmount, NaN);
    const addr = withdrawAddress.trim();

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error(t('tx.withdraw.validation.amountInvalid'));
      return;
    }
    if (amountNum > balance) {
      toast.error(t('tx.withdraw.validation.exceedsBalance'));
      return;
    }
    if (!addr || addr.length < 10) {
      toast.error(t('tx.withdraw.validation.addressInvalid'));
      return;
    }

    setWithdrawSubmitting(true);
    try {
      const res = await api.post('/customer/withdrawals/request/', {
        amount: amountNum.toFixed(2),
        payout_address: addr,
      });

      const created: WithdrawalRequest | undefined = res.data?.data;
      toast.success(
        t('tx.withdraw.created', {
          ref: created?.reference ? ` (${created.reference})` : '',
        })
      );

      setWithdrawOpen(false);
      setWithdrawAmount('');
      setWithdrawAddress('');

      await refreshAll();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.detail ||
        err?.response?.data?.detail ||
        err?.message ||
        t('tx.withdraw.createFail');
      toast.error(String(msg));
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const submitDeposit = async () => {
    const amountNum = toNumber(depositAmount, NaN);

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error(t('tx.deposit.validation.amountInvalid'));
      return;
    }

    if (!depositProofFile) {
      toast.error(t('tx.deposit.validation.proofRequired'));
      return;
    }

    if (!depositWallet?.address) {
      toast.error(t('tx.deposit.validation.walletMissing'));
      return;
    }

    setDepositSubmitting(true);
    try {
      const form = new FormData();
      form.append('amount', amountNum.toFixed(2));
      form.append('payment_method', 'USDT');
      form.append('proof', depositProofFile);

      const res = await api.post('/customer/deposits/request/', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const created = res.data?.data;

      toast.success(t('tx.deposit.created', { amount: amountNum.toFixed(2) }));

      setDepositOpen(false);
      setDepositAmount('');
      setDepositProofFile(null);

      await fetchDepositRequests();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.detail ||
        err?.response?.data?.detail ||
        err?.message ||
        t('tx.deposit.createFail');
      toast.error(String(msg));
    } finally {
      setDepositSubmitting(false);
    }
  };

  const copyDepositWallet = async () => {
    const addr = depositWallet?.address;
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 1200);
    } catch {
    }
  };


  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <p className="text-white">{t('tx.loading')}</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4">
        <p className="text-white">{t('tx.errors.loadFail')}</p>
        <p className="text-blue-200 text-sm">{errorMsg}</p>
        <button
          onClick={refreshAll}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header / Controls */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-white mb-1">{t('tx.title')}</h2>
            <p className="text-blue-200 text-sm">
              {t('tx.showing', { shown: filtered.length, total: items.length })}
            </p>
          </div>

          <div className={isRTL ? 'text-left' : 'text-right'}>
            <p className="text-blue-200 text-sm">{t('tx.currentBalance')}</p>
            <p className="text-white">
              {balance.toFixed(2)} {t('common.usdt')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col lg:flex-row gap-3">
          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  typeFilter === f.key
                    ? 'bg-blue-500 text-white border-blue-400'
                    : 'bg-white/5 text-blue-100 border-white/10 hover:bg-white/10'
                }`}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>

          {/* Direction filter */}
          <div className="flex gap-2">
            {(['all', 'credit', 'debit'] as DirFilterKey[]).map((d) => (
              <button
                key={d}
                onClick={() => setDirFilter(d)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  dirFilter === d
                    ? 'bg-white/15 text-white border-white/30'
                    : 'bg-white/5 text-blue-100 border-white/10 hover:bg-white/10'
                }`}
              >
                {d === 'all'
                  ? t('tx.dir.all')
                  : d === 'credit'
                  ? t('tx.dir.credit')
                  : t('tx.dir.debit')}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('tx.searchPlaceholder')}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200"
            />
          </div>

          <button
            onClick={refreshAll}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            {t('common.refresh')}
          </button>

          <Button
            onClick={() => setDepositOpen(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            {t('tx.deposit.open')}
          </Button>


          <Button onClick={() => setWithdrawOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-500">
            {t('tx.withdraw.open')}
          </Button>
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-10 border border-white/20 text-center">
          <p className="text-white mb-2">{t('tx.empty.title')}</p>
          <p className="text-blue-200 text-sm">{t('tx.empty.subtitle')}</p>
        </div>
      ) : (
        /* Transactions Table */
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[110px]">
                    {t('tx.table.id')}
                  </th>
                  <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[180px]">
                    {t('tx.table.type')}
                  </th>
                  <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[140px]">
                    {t('tx.table.direction')}
                  </th>
                  <th className="text-right text-blue-200 text-xs font-medium px-6 py-4 w-[170px]">
                    {t('tx.table.amount')}
                  </th>
                  <th className="text-right text-blue-200 text-xs font-medium px-6 py-4 w-[190px]">
                    {t('tx.table.balanceAfter')}
                  </th>
                  <th className="text-left text-blue-200 text-xs font-medium px-6 py-4">
                    {t('tx.table.reference')}
                  </th>
                  <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[190px]">
                    {t('tx.table.created')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((tx) => {
                  const dir = (tx.direction || '').toLowerCase();
                  const amountNum = toNumber(tx.amount, 0);
                  const sign = dir === 'debit' ? '-' : '+';

                  const badge =
                    dir === 'credit'
                      ? 'bg-green-500/20 text-green-300 border-green-400/30'
                      : dir === 'debit'
                      ? 'bg-red-500/20 text-red-300 border-red-400/30'
                      : 'bg-white/10 text-blue-100 border-white/20';

                  return (
                    <tr key={tx.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white text-sm font-mono">#{tx.id}</td>

                      <td className="px-6 py-4 text-white text-sm">
                        {humanizeType(tx.tx_type, t)}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${badge}`}>
                          {tx.direction}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={dir === 'debit' ? 'text-red-300' : 'text-green-300'}>
                          {sign}
                          {amountNum.toFixed(2)} {t('common.usdt')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right text-white">
                        {toNumber(tx.balance_after, 0).toFixed(2)} {t('common.usdt')}
                      </td>

                      <td className="px-6 py-4 text-blue-100 text-sm truncate max-w-[1px]" title={tx.reference || ''}>
                        {tx.reference ? tx.reference : <span className="text-blue-200/70">—</span>}
                      </td>

                      <td className="px-6 py-4 text-blue-100 text-sm">{formatDate(tx.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdrawal Requests */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-white mb-1">{t('tx.withdraw.listTitle')}</h3>
            <p className="text-blue-200 text-sm">{t('tx.withdraw.listSubtitle')}</p>
          </div>
          <Button onClick={fetchWithdrawalRequests} variant="outline" className="bg-white/10 border-white/20">
            {t('common.refresh')}
          </Button>
        </div>

        {withdrawals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-blue-200">{t('tx.withdraw.empty')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white">
                      {t('tx.withdraw.request')} <span className="font-mono">#{w.id}</span> · {w.amount}{' '}
                      {t('common.usdt')}
                    </p>
                    <p className="text-blue-300 text-sm">
                      {w.reference} · {formatDate(w.created_at)}
                    </p>
                    <p className="text-blue-200 text-xs mt-1 break-all">
                      {t('tx.withdraw.address')}: <span className="font-mono">{w.payout_address}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">{statusPill(w.status, t)}</div>
                </div>

                {(w.notes || w.transaction_id) && (
                  <div className="mt-3 border-t border-white/10 pt-3 text-sm">
                    {w.transaction_id && (
                      <p className="text-blue-200">
                        {t('tx.withdraw.txHash')}: <span className="font-mono text-white break-all">{w.transaction_id}</span>
                      </p>
                    )}
                    {w.notes && <p className="text-red-200">{t('tx.withdraw.note')}: {w.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Requests */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-white mb-1">{t('tx.deposit.listTitle')}</h3>
            <p className="text-blue-200 text-sm">{t('tx.deposit.listSubtitle')}</p>
          </div>
          <Button onClick={fetchDepositRequests} variant="outline" className="bg-white/10 border-white/20">
            {t('common.refresh')}
          </Button>
        </div>

        {deposits.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-blue-200">{t('tx.deposit.empty')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {deposits.map((d) => (
              <div key={d.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white">
                      {t('tx.deposit.request')} <span className="font-mono">#{d.id}</span> · {d.amount}{' '}
                      {t('common.usdt')}
                    </p>
                    <p className="text-blue-300 text-sm">
                      {d.reference} · {formatDate(d.created_at)}
                    </p>

                    {d.payment_method && (
                      <p className="text-blue-200 text-xs mt-1">
                        {t('tx.deposit.method')}: {d.payment_method}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">{statusPill(d.status, t)}</div>
                </div>

                {(d.notes || d.reviewed_at) && (
                  <div className="mt-3 border-t border-white/10 pt-3 text-sm">
                    {d.reviewed_at && (
                      <p className="text-blue-200">
                        {t('tx.deposit.reviewedAt')}: {formatDate(d.reviewed_at)}
                      </p>
                    )}
                    {d.notes && (
                      <p className="text-red-200">
                        {t('tx.deposit.note')}: {d.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="bg-slate-900 text-white border-white/20 max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('tx.withdraw.dialogTitle')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm block mb-2">{t('tx.withdraw.amountLabel')}</label>
              <Input
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={t('tx.withdraw.amountPlaceholder')}
                className="bg-white/10 border-white/20 text-white"
              />
              <p className="text-blue-300 text-xs mt-1">
                {t('tx.withdraw.available', { balance: balance.toFixed(2), usdt: t('common.usdt') })}
              </p>
            </div>

            <div>
              <label className="text-blue-200 text-sm block mb-2">{t('tx.withdraw.addressLabel')}</label>
              <Input
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={t('tx.withdraw.addressPlaceholder')}
                className="bg-white/10 border-white/20 text-white font-mono"
              />
              <p className="text-blue-300 text-xs mt-1">{t('tx.withdraw.addressHint')}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setWithdrawOpen(false)}
              className="bg-transparent border-white/20"
              disabled={withdrawSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={submitWithdraw}
              disabled={withdrawSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {withdrawSubmitting ? t('common.submitting') : t('tx.withdraw.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent 
        className="bg-slate-900 text-white border-white/20"
        style={{
          width: "560px",
          maxWidth: "92vw",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "16px",
  }}
>
          <DialogHeader>
            <DialogTitle>{t('tx.deposit.dialogTitle')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 1) Amount */}
            <div>
              <label className="text-blue-200 text-sm block mb-2">{t('tx.deposit.amountLabel')}</label>
              <Input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={t('tx.deposit.amountPlaceholder')}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* 2) Fixed method */}
            <div>
              <label className="text-blue-200 text-sm block mb-2">{t('tx.deposit.methodLabel')}</label>
              <Input
                value={t('tx.deposit.methodFixed')}
                readOnly
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* 3) Proof image */}
            <div>
              <label className="text-blue-200 text-sm block mb-2">{t('tx.deposit.proofLabel')}</label>
              <div className="flex flex-col gap-2">
                <input
                  id="deposit-proof"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDepositProofFile(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="deposit-proof"
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/20 cursor-pointer select-none"
                  >
                    {depositProofFile ? 'Change file' : 'Choose file'}
                  </label>

                  {depositProofFile ? (
                    <span className="text-blue-100 text-sm truncate max-w-[50vw] sm:max-w-[260px]">
                      {depositProofFile.name}
                    </span>
                  ) : (
                    <span className="text-blue-300 text-xs">
                      No file chosen
                    </span>
                  )}

                  {depositProofFile ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDepositProofFile(null)}
                      className="bg-transparent border-white/20 px-3"
                    >
                      Clear
                    </Button>
                  ) : null}
                </div>
              </div>
              {depositProofFile ? (
                <p className="text-blue-300 text-xs mt-1">
                  {t('tx.deposit.selectedFile', { name: depositProofFile.name })}
                </p>
              ) : (
                <p className="text-blue-300 text-xs mt-1">{t('tx.deposit.proofHint')}</p>
              )}
            </div>

            {/* 4) Wallet address */}
            <div>
              <label className="text-blue-200 text-sm block mb-2">{t('tx.deposit.walletLabel')}</label>
              <div className="flex gap-2">
                <Input
                  value={
                    depositWalletLoading
                      ? t('tx.deposit.walletLoading')
                      : depositWallet?.address || ''
                  }
                  readOnly
                  className="bg-white/10 border-white/20 text-white font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyDepositWallet}
                  disabled={depositWalletLoading || !depositWallet?.address}
                  className="bg-transparent border-white/20 whitespace-nowrap"
                >
                  {walletCopied ? t('tx.deposit.copied') : t('tx.deposit.copy')}
                </Button>
              </div>
              {depositWallet?.network && (
                <p className="text-blue-300 text-xs mt-1">{depositWallet.network}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDepositOpen(false)}
              className="bg-transparent border-white/20"
              disabled={depositSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={submitDeposit}
              disabled={depositSubmitting}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {depositSubmitting ? t('common.submitting') : t('tx.deposit.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}


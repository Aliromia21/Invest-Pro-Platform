import { useEffect, useMemo, useState } from 'react';
import { Check, Star, Crown, Zap, Rocket } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

import { api } from '../api/api';
import { useLanguage } from '../contexts/LanguageContext';

interface InvestmentPacksProps {
  onSelectPack: (packId: string, packName: string) => void;
  selectedPack: string | null;
  balance: number;
  setBalance: (balance: number) => void;
  onAfterInvest?: () => Promise<void> | void;
}

type UIPack = {
  id: string;
  name: string;
  icon: any;
  minInvestment: number;
  maxInvestment: number;
  roiPercent: number; // 0.08 => 8%
  durationDays: number;
  payoutType: 'daily' | 'end' | string;
  color: string;
  popular?: boolean;
  isActive: boolean;

  keyGuess: 'prime' | 'extra' | 'premium' | 'elite';
};

// utils
function toNumber(v: any, fallback = 0) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function safeErrorMsg(err: any) {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    (typeof err?.response?.data === 'string' ? err.response.data : '') ||
    err?.message ||
    'Something went wrong'
  );
}

const iconByKey: Record<string, any> = {
  prime: Star,
  extra: Zap,
  premium: Crown,
  elite: Rocket,
};

const colorByKey: Record<string, string> = {
  prime: 'from-blue-500 to-cyan-500',
  extra: 'from-purple-500 to-pink-500',
  premium: 'from-yellow-500 to-orange-500',
  elite: 'from-emerald-500 to-teal-500',
};

function mapBackendPackToUi(pack: any, index: number): UIPack {
  const id = String(pack?.id ?? index);
  const name = String(pack?.name ?? `Pack ${index + 1}`);
  const nameLower = name.toLowerCase();

  const keyGuess: UIPack['keyGuess'] =
    nameLower.includes('prime')
      ? 'prime'
      : nameLower.includes('extra')
      ? 'extra'
      : nameLower.includes('premium')
      ? 'premium'
      : nameLower.includes('elite')
      ? 'elite'
      : 'extra';

  const Icon = iconByKey[keyGuess] ?? Zap;
  const color = colorByKey[keyGuess] ?? 'from-purple-500 to-pink-500';

  const minInvestment = toNumber(pack?.min_amount ?? 0, 0);
  const maxInvestment = toNumber(pack?.max_amount ?? 0, 0);
  const durationDays = toNumber(pack?.duration_days ?? 60, 60);

  const roiRaw = toNumber(pack?.roi_percent ?? 0, 0);
  const roiPercent = roiRaw <= 1 ? roiRaw * 100 : roiRaw;

  const payoutType = String(pack?.payout_type ?? 'daily').toLowerCase();
  const isActive = Boolean(pack?.is_active ?? true);

  const popular = keyGuess === 'extra' || index === 1;

  return {
    id,
    name,
    icon: Icon,
    minInvestment,
    maxInvestment,
    roiPercent,
    durationDays,
    payoutType,
    color,
    popular,
    isActive,
    keyGuess,
  };
}

export function InvestmentPacks({
  onSelectPack,
  selectedPack,
  balance,
  setBalance,
  onAfterInvest,
}: InvestmentPacksProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [packs, setPacks] = useState<UIPack[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [packsError, setPacksError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPackData, setSelectedPackData] = useState<UIPack | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getFeatures = (pack: UIPack) => {
    const payoutLabel =
      String(pack.payoutType).toLowerCase() === 'daily'
        ? t('packs.payoutDaily')
        : t('packs.payoutEnd');

    return [
      t('packs.featureRoi', { roi: pack.roiPercent.toFixed(2) }),
      t('packs.featureDuration', { days: pack.durationDays }),
      t('packs.featurePayout', { payout: payoutLabel }),
      t('packs.featureWithdrawAnytime'),
      t('packs.featureSupportIncluded'),
    ];
  };

  // fetch packs
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingPacks(true);
        setPacksError(null);

        const res = await api.get('/customer/packs/');
        const raw = res.data?.data ?? res.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.results) ? raw.results : [];
        const ui = list.map(mapBackendPackToUi);

        if (!mounted) return;
        setPacks(ui);
      } catch (err: any) {
        if (!mounted) return;
        setPacksError(safeErrorMsg(err));
      } finally {
        if (!mounted) return;
        setLoadingPacks(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const amountNum = useMemo(() => toNumber(investmentAmount, 0), [investmentAmount]);

  const canSubmit = useMemo(() => {
    if (!selectedPackData) return false;
    if (!investmentAmount) return false;
    if (amountNum <= 0) return false;
    if (amountNum < selectedPackData.minInvestment) return false;
    if (amountNum > selectedPackData.maxInvestment) return false;
    if (amountNum > balance) return false;
    return true;
  }, [selectedPackData, investmentAmount, amountNum, balance]);

  const handlePackClick = (pack: UIPack) => {
    if (!pack.isActive) {
      toast.error(t('packs.notActive'));
      return;
    }
    setSelectedPackData(pack);
    setIsDialogOpen(true);
    setInvestmentAmount(String(pack.minInvestment || 0));
  };

  const handleInvest = async () => {
    if (!selectedPackData) return;

    if (!canSubmit) {
      toast.error(t('packs.checkAmountAndBalance'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/customer/investments/', {
        pack_id: Number(selectedPackData.id),
        amount: amountNum,
      });

      onSelectPack(selectedPackData.id, selectedPackData.name);
      setBalance(Number((balance - amountNum).toFixed(2)));

      toast.success(t('packs.investSuccessTitle'), {
        description: t('packs.investSuccessDesc', {
          amount: fmtMoney(amountNum),
          pack: selectedPackData.name,
        }),
      });

      setIsDialogOpen(false);

      if (onAfterInvest) await onAfterInvest();
      void res;
    } catch (err: any) {
      toast.error(t('packs.investFailTitle'), { description: safeErrorMsg(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPacks) {
    return (
      <div className="text-center py-12">
        <p className="text-white">{t('packs.loading')}</p>
      </div>
    );
  }

  if (packsError) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-white">{t('packs.loadFail')}</p>
        <p className="text-blue-200 text-sm">{packsError}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          {t('common.reload')}
        </Button>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-8 text-center">
        <h2 className="text-white mb-2">{t('packs.title')}</h2>
        <p className="text-blue-200">{t('packs.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packs.map((pack) => {
          const Icon = pack.icon;
          const features = getFeatures(pack);

          const displayName = t(`packs.names.${pack.keyGuess}`, { defaultValue: pack.name });

          return (
            <div
              key={pack.id}
              className={`relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 transition-all cursor-pointer hover:border-white/40 ${
                selectedPack === pack.name ? 'ring-2 ring-blue-400' : ''
              } ${!pack.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => pack.isActive && handlePackClick(pack)}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs">
                    {t('packs.mostPopular')}
                  </span>
                </div>
              )}

              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${pack.color} flex items-center justify-center mb-4`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-white mb-2">{displayName}</h3>

              <div className="mb-4">
                <p className="text-blue-200 text-sm">{t('packs.range')}</p>
                <p className="text-white">
                  {fmtMoney(pack.minInvestment)} - {fmtMoney(pack.maxInvestment)} {t('common.usdt')}
                </p>
              </div>

              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <p className="text-center text-green-400">{pack.roiPercent.toFixed(2)}%</p>
                <p className="text-center text-blue-200 text-xs">
                  {t('packs.roiLabel', {
                    payout:
                      String(pack.payoutType).toLowerCase() === 'daily'
                        ? t('packs.payoutDailyShort')
                        : t('packs.payoutEndShort'),
                  })}
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-100 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full bg-gradient-to-r ${pack.color}`}
                disabled={!pack.isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePackClick(pack);
                }}
              >
                {!pack.isActive
                  ? t('packs.inactive')
                  : selectedPack === pack.name
                  ? t('packs.active')
                  : t('packs.select')}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Investment Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (submitting) return;
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="bg-slate-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>
              {t('packs.investIn', { pack: selectedPackData?.name ?? '' })}
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              {t('packs.investHint', {
                min: fmtMoney(selectedPackData?.minInvestment ?? 0),
                max: fmtMoney(selectedPackData?.maxInvestment ?? 0),
                usdt: t('common.usdt'),
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-blue-200 mb-2 block">
                {t('packs.amountLabel', { usdt: t('common.usdt') })}
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                min={selectedPackData?.minInvestment}
                max={selectedPackData?.maxInvestment}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                placeholder={t('packs.amountPlaceholder')}
                disabled={submitting}
              />
              <p className="text-xs text-blue-300 mt-2">
                {t('packs.availableBalance', { balance: fmtMoney(balance), usdt: t('common.usdt') })}
              </p>

              {!submitting && investmentAmount && selectedPackData && amountNum > balance && (
                <p className="text-red-400 text-xs mt-2">{t('packs.insufficientBalance')}</p>
              )}
            </div>

            {selectedPackData && investmentAmount && amountNum > 0 && (
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">{t('packs.dialogRoi')}</span>
                  <span className="text-green-400">{selectedPackData.roiPercent.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">{t('packs.dialogDuration')}</span>
                  <span className="text-white">
                    {t('packs.days', { days: selectedPackData.durationDays })}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">{t('packs.dialogExpectedReturn')}</span>
                  <span className="text-green-400">
                    {fmtMoney((amountNum * selectedPackData.roiPercent) / 100)} {t('common.usdt')}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">{t('packs.dialogPayoutType')}</span>
                  <span className="text-white">
                    {String(selectedPackData.payoutType).toLowerCase() === 'daily'
                      ? t('packs.payoutDaily')
                      : t('packs.payoutEnd')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border-white/20 text-white"
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>

            <Button
              onClick={handleInvest}
              className={`bg-gradient-to-r ${selectedPackData?.color ?? 'from-purple-500 to-pink-500'}`}
              disabled={!canSubmit || submitting}
            >
              {submitting ? t('common.processing') : t('packs.confirmInvestment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

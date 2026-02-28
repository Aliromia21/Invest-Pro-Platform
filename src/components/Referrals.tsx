import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

import { Button } from "./ui/button";
import { ReferralPacks } from "./ReferralPacks";
import { api } from "../api/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReferralsProps {
  referralCode: string;
}

type Tx = {
  id: number;
  tx_type: string;
  direction: "credit" | "debit" | string;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference: string;
  metadata: Record<string, any>;
  created_at: string;
};

function toNumber(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

export function Referrals({ referralCode }: ReferralsProps) {
  const { t, isRTL } = useLanguage();

  const [copiedField, setCopiedField] = useState<"code" | "link" | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [referralCounter, setReferralCounter] = useState<number>(0);
  const [haveDeposited, setHaveDeposited] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Tx[]>([]);

const referralLink = useMemo(() => `${window.location.origin}/ref/${referralCode}`, [referralCode]);

  const handleCopy = async (text: string, field: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);

      toast.success(field === "code" ? t("ref.copy.code") : t("ref.copy.link"));
      setTimeout(() => setCopiedField(null), 1200);
    } catch {
      toast.error(t("common.copyFail"));
    }
  };

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const [profileRes, txRes] = await Promise.all([api.get("/customer/profile/"), api.get("/customer/transactions/")]);

        if (!mounted) return;

        const profile = profileRes.data?.data ?? profileRes.data;

        setReferralCounter(Number(profile?.referral_counter ?? 0));
        setHaveDeposited(Boolean(profile?.have_deposited));

        const list: Tx[] = txRes.data?.data ?? [];
        setTransactions(list);
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail || err?.response?.data?.message || err?.message || t("ref.loadFail");
        if (mounted) setErrorMsg(String(msg));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [t]);

  // Referral earnings from reward transactions
  const totalReferralEarnings = useMemo(() => {
    return transactions.filter((x) => x.tx_type === "reward").reduce((sum, x) => sum + toNumber(x.amount, 0), 0);
  }, [transactions]);

  const totalReferrals = referralCounter;

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-white">{t("ref.loading")}</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-white">{t("ref.loadFailTitle")}</p>
            <p className="text-blue-200 text-sm mt-1">{errorMsg}</p>

            <Button className="mt-4 bg-white/10 hover:bg-white/20 text-white" onClick={() => window.location.reload()}>
              {t("common.reload")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Notice */}
      {!haveDeposited && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-200">
          {t("ref.noticeFirstDeposit")}
        </div>
      )}

      <ReferralPacks activeReferrals={totalReferrals} totalEarned={totalReferralEarnings} haveDeposited={haveDeposited} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Referrals */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>

            <div>
              <p className="text-blue-200 text-sm">{t("ref.stats.totalReferrals")}</p>
              <p className="text-white">{totalReferrals}</p>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>

            <div>
              <p className="text-blue-200 text-sm">{t("ref.stats.totalEarnings")}</p>
              <p className="text-white">{totalReferralEarnings.toFixed(2)} USDT</p>
            </div>
          </div>
        </div>

        {/* Team Investment placeholder */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>

            <div>
              <p className="text-blue-200 text-sm">{t("ref.stats.teamInvestment")}</p>
              <p className="text-white">—</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-8 border border-purple-300/30">
        <div className="text-center mb-6">
          <h3 className="text-white mb-2">{t("ref.section.title")}</h3>
          <p className="text-purple-100">{t("ref.section.subtitle")}</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          {/* Code */}
          <div>
            <label className="text-sm text-purple-200 mb-2 block">{t("ref.section.codeLabel")}</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={referralCode}
                readOnly
                className="flex-1 bg-black/30 border border-purple-300/30 rounded-lg px-4 py-3 text-white text-center tracking-widest"
              />

              <Button onClick={() => handleCopy(referralCode, "code")} variant="outline" className="bg-white/10 border-purple-300/30">
                {copiedField === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="text-sm text-purple-200 mb-2 block">{t("ref.section.linkLabel")}</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-black/30 border border-purple-300/30 rounded-lg px-4 py-3 text-white text-sm"
              />

              <Button onClick={() => handleCopy(referralLink, "link")} variant="outline" className="bg-white/10 border-purple-300/30">
                {copiedField === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

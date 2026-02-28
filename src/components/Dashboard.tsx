import { useMemo, useState } from "react";
import {
  TrendingUp,
  Users,
  Wallet,
  Package,
  Mail,
  LifeBuoy,
  Copy,
  Send,
} from "lucide-react";
import { CustomerKycPanel } from "@/components/customer/CustomerKycPanel";
import { ProfessionalChart } from "./ProfessionalChart";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessagesModalContent } from "@/components/customer/MessagesModalContent";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useCustomerWallet } from "@/hooks/useCustomerWallet";
import { useCustomerTickets } from "@/hooks/useCustomerTickets";
import { useCreateCustomerTicket } from "@/hooks/useCreateCustomerTicket";

export type Tx = {
  id: number;
  tx_type: string;
  amount: string;
  created_at?: string;
};

export type Investment = {
  id: number;
  amount: string;
  status: "active" | "completed" | "cancelled" | string;
  expected_total_return?: string;
};

interface DashboardProps {
  balance: number;
  selectedPack: string | null;
  referralCode: string;
  referralCount?: number;
  transactions?: Tx[];
  activeInvestment?: Investment | null;
  pendingMessagesCount?: number;
}

function formatTxType(txType: string) {
  const map: Record<string, string> = {
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    earning: "Earnings",
    reward: "Reward",
    investment_create: "Investment",
  };
  return map[txType] ?? txType.replace(/_/g, " ");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function toNumber(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function safeTrim(s: string) {
  return (s ?? "").trim();
}

export function Dashboard({
  balance,
  selectedPack,
  referralCode,
  referralCount = 0,
  transactions = [],
  activeInvestment = null,
  pendingMessagesCount = 0,
}: DashboardProps) {
  const { language, isRTL, t: tr } = useLanguage();

  // Wallet + Tickets
  const { data: walletResp, isLoading: walletLoading } = useCustomerWallet();
  const wallet = walletResp?.data ?? null;

  const { data: ticketsResp, isLoading: ticketsLoading } = useCustomerTickets();
  const tickets = ticketsResp?.data ?? [];
  const unreadTicketsCount = useMemo(
    () => tickets.filter((t: any) => !t.is_read).length,
    [tickets]
  );

  const createTicket = useCreateCustomerTicket();

  // ================= Pagination =================
const PAGE_SIZE = 2;
const [ticketsPage, setTicketsPage] = useState(1);

const ticketsSorted = useMemo(() => {
  return tickets
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
}, [tickets]);

const totalPages = Math.max(
  1,
  Math.ceil(ticketsSorted.length / PAGE_SIZE)
);

const pageTickets = useMemo(() => {
  const start = (ticketsPage - 1) * PAGE_SIZE;
  return ticketsSorted.slice(start, start + PAGE_SIZE);
}, [ticketsSorted, ticketsPage]);


  // Local UI state
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    name: "",
    whatsapp: "",
    telegram: "",
    email: "",
    message: "",
  });

  // Existing logic
  const last5 = transactions.slice(0, 5);
  const inv = activeInvestment?.status === "active" ? activeInvestment : null;

  
  const expectedTotalReturn = inv ? toNumber(inv.expected_total_return, 0) : 0;

  const totalEarnings = transactions.reduce((sum, tx) => {
    const ttype = String(tx.tx_type).toLowerCase();
    if (ttype !== "earning" && ttype !== "reward") return sum;
    return sum + toNumber(tx.amount, 0);
  }, 0);

  const totalEarningsText = transactions.length > 0 ? `${totalEarnings.toFixed(2)} USDT` : "—";

  async function handleCopyWallet() {
    if (!wallet?.address) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

   async function submitTicket() {
  createTicket.reset();

  const payload = {
    name: safeTrim(ticketForm.name),
    whatsapp: safeTrim(ticketForm.whatsapp),
    telegram: safeTrim(ticketForm.telegram),
    email: safeTrim(ticketForm.email),
    message: safeTrim(ticketForm.message),
  };

  if (!payload.name || !payload.email || !payload.message) return;

  try {
    await createTicket.mutateAsync(payload);

    setTicketForm({ name: "", whatsapp: "", telegram: "", email: "", message: "" });

    createTicket.reset();
  } catch {
  }
}



  return (
    <div className={`space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <Wallet className="w-8 h-8 text-blue-400 mb-4" />
          <p className="text-blue-200 text-sm mb-1">{tr('dash.availableBalance')}</p>
          <p className="text-white">{balance.toFixed(2)} USDT</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <Package className="w-8 h-8 text-green-400 mb-4" />
          <p className="text-blue-200 text-sm mb-1">{tr('dash.activeInvestment')}</p>
          <p className="text-white">{selectedPack || tr('common.none')}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <TrendingUp className="w-8 h-8 text-yellow-400 mb-4" />
          <p className="text-blue-200 text-sm mb-1">{tr('dash.totalEarnings')}</p>
          <p className="text-white">{totalEarningsText}</p>
          {inv && expectedTotalReturn > 0 ? (
            <p className="text-blue-300 text-xs mt-1">
              Expected total return: {expectedTotalReturn.toFixed(2)} USDT
            </p>
          ) : null}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <Users className="w-8 h-8 text-purple-400 mb-4" />
          <p className="text-blue-200 text-sm mb-1">{tr('dash.referrals')}</p>
          <p className="text-white">{referralCount}</p>
        </div>
      </div>

      {/* KYC Verification */}
      <div>
        <CustomerKycPanel />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Referral */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-300/30">
          <h3 className="text-white mb-4">{tr('dash.referralCode')}</h3>
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <p className="text-center text-white tracking-widest">{referralCode}</p>
          </div>
          <p className="text-purple-100 text-sm">{tr('dash.referralHint')}</p>
        </div>

        {/* Deposit Wallet */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="w-8 h-8 text-green-400" />
              <h3 className="text-white">{tr('dash.depositWallet')}</h3>
            </div>

            {walletLoading ? (
              <p className="text-blue-200 text-sm">
                {language === "ar" ? "جارٍ التحميل..." : "Loading..."}
              </p>
            ) : !wallet ? (
              <p className="text-yellow-300 text-sm">{tr('dash.walletNotConfigured')}</p>
            ) : (
              <>
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <p className="text-white break-all text-sm">{wallet.address}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-blue-200 text-xs">{wallet.network}</p>
                  <button
                    onClick={handleCopyWallet}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm inline-flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? tr('common.copied') : tr('common.copy')}
                  </button>
                </div>
                <p className="text-blue-300 text-xs mt-2">
                  {tr('dash.updatedAt')} {formatTime(wallet.updated_at)}
                </p>
              </>
            )}
          </div>

          {!wallet && (
            <button
              onClick={() => setSupportOpen(true)}
              className="mt-4 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
            >
              {language === "ar" ? "تواصل مع الدعم" : "Contact Support"}
            </button>
          )}
        </div>

        {/* Support */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <LifeBuoy className="w-8 h-8 text-yellow-400" />
              <h3 className="text-white">{tr('dash.support')}</h3>
            </div>

            {ticketsLoading ? (
              <p className="text-blue-200 text-sm">
                {language === "ar" ? "جارٍ التحميل..." : "Loading..."}
              </p>
            ) : (
              <>
                <p className="text-blue-200 text-sm">
                  {language === "ar" ? `عدد التذاكر: ${tickets.length}` : `Tickets: ${tickets.length}`}
                </p>
                {unreadTicketsCount > 0 && (
                  <p className="text-yellow-300 text-sm">
                    {language === "ar"
                      ? `غير مقروءة: ${unreadTicketsCount}`
                      : `Unread: ${unreadTicketsCount}`}
                  </p>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setSupportOpen(true)}
            className="mt-4 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
          >
            {tr('dash.openSupport')}
          </button>
        </div>

        {/* Messages */}
        
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-white mb-4">{tr('dash.recentActivity')}</h3>

        {last5.length === 0 ? (
          <p className="text-blue-200 text-sm">{tr('dash.noTx')}</p>
        ) : (
          <div className="space-y-3">
            {last5.map((tx) => {
              const ttype = String(tx.tx_type).toLowerCase();
              const credit = !(ttype.includes("withdraw") || ttype.includes("debit"));
              const sign = credit ? "+" : "-";
              const amount = toNumber(tx.amount, 0);
              const amountText = `${sign}${amount.toFixed(2)} USDT`;
              const color = credit ? "text-green-400" : "text-red-400";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                >
                  <div>
                    <p className="text-white text-sm">{tr(`tx.type.${String(tx.tx_type).toLowerCase()}`, { defaultValue: formatTxType(tx.tx_type) })}</p>
                    <p className="text-blue-200 text-xs">{formatTime(tx.created_at)}</p>
                  </div>
                  <p className={color}>{amountText}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ProfessionalChart activeInvestment={activeInvestment} />

      {inv ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-white mb-4">{tr('dash.investmentPerformance')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-blue-200 text-sm mb-1">{tr('dash.amount')}</p>
              <p className="text-white">{toNumber(inv.amount, 0).toFixed(2)} USDT</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">{tr('dash.status')}</p>
              <p className="text-white">{String(inv.status)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Expected</p>
              <p className="text-white">
                {expectedTotalReturn > 0 ? `${expectedTotalReturn.toFixed(2)} USDT` : "—"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Messages Modal */}
      <Dialog open={messagesOpen} onOpenChange={setMessagesOpen}>
        <DialogContent className="bg-slate-900 text-white border-white/20 max-w-5xl h-[90vh] overflow-y-auto">
          <DialogTitle className="text-white">{tr('dash.messages')}</DialogTitle>
          <DialogDescription className="text-blue-200">
            {tr('dash.messagesDescription')}
          </DialogDescription>

          <MessagesModalContent />
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
                <Dialog
            open={supportOpen}
            onOpenChange={(open) => {
              setSupportOpen(open);
              if (open) setTicketsPage(2); // reset page
            }}
          >

        <DialogContent className="bg-slate-900 text-white border-white/20 max-w-5xl h-[90vh] overflow-y-auto">
          <DialogTitle className="text-white">{tr('dash.support')}</DialogTitle>
          <DialogDescription className="text-blue-200">
            {language === "ar"
              ? "إنشاء تذكرة ومتابعة التذاكر"
              : "Create and view your tickets"}
          </DialogDescription>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-7 h-7 text-yellow-400" />
                <h2 className="text-xl font-semibold">{tr('dash.support')}</h2>
              </div>
              <button
                onClick={() => setSupportOpen(false)}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
              >
                {tr('common.close')}
              </button>
            </div>

            {/* Create Ticket */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">{tr('dash.createTicket')}</h3>
                {createTicket.isSuccess && (
                  <span className="text-green-400 text-sm">{tr('dash.ticketCreated')}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-blue-200 text-xs">{tr('dash.form.name')}</label>
                  <input
                    value={ticketForm.name}
                    onChange={(e) => setTicketForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    placeholder={language === "ar" ? "الاسم" : "Name"}
                  />
                </div>

                <div>
                  <label className="text-blue-200 text-xs">{tr('dash.form.email')}</label>
                  <input
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm((p) => ({ ...p, email: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    placeholder={language === "ar" ? "البريد" : "Email"}
                  />
                </div>

                <div>
                  <label className="text-blue-200 text-xs">{tr('dash.form.whatsapp')}</label>
                  <input
                    value={ticketForm.whatsapp}
                    onChange={(e) => setTicketForm((p) => ({ ...p, whatsapp: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    placeholder="+971..."
                  />
                </div>

                <div>
                  <label className="text-blue-200 text-xs">{tr('dash.form.telegram')}</label>
                  <input
                    value={ticketForm.telegram}
                    onChange={(e) => setTicketForm((p) => ({ ...p, telegram: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    placeholder="@username"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-blue-200 text-xs">{tr('dash.form.message')}</label>
                  <textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm((p) => ({ ...p, message: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white min-h-[120px]"
                    placeholder={language === "ar" ? "اكتب رسالتك..." : "Write your message..."}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={submitTicket}
                  disabled={createTicket.isPending}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white inline-flex items-center gap-2 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {createTicket.isPending ? tr('common.sending') : tr('common.submit')}
                </button>
              </div>

              {createTicket.isError && (
                <p className="text-red-400 text-sm mt-2">
                  {language === "ar" ? "فشل إنشاء التذكرة" : "Failed to create ticket"}
                </p>
              )}
            </div>

  {/* Tickets List */}
<div className="bg-white/5 border border-white/10 rounded-xl p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-white font-medium">
      {tr('dash.myTickets')}
    </h3>

    {!ticketsLoading && (
      <span className="text-blue-200 text-sm">
        {language === "ar"
          ? `الإجمالي: ${tickets.length}`
          : `Total: ${tickets.length}`}
        {unreadTicketsCount > 0
          ? ` • ${tr('dash.unread')}: ${unreadTicketsCount}`
          : ""}
      </span>
    )}
  </div>

  {ticketsLoading ? (
    <p className="text-blue-200 text-sm">
      {language === "ar" ? "جارٍ التحميل..." : "Loading..."}
    </p>
  ) : tickets.length === 0 ? (
    <p className="text-blue-200 text-sm">
      {language === "ar"
        ? "لا توجد تذاكر بعد."
        : "No tickets yet."}
    </p>
  ) : (
    <div className="space-y-3">
      {pageTickets.map((tk) => (
        <div
          key={tk.id}
          className="rounded-lg border border-white/10 bg-black/20 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white text-sm">
                #{tk.id} • {formatTime(tk.created_at)}
              </p>

              <p className="text-blue-200 text-xs mt-1">
                {tk.email}
                {tk.whatsapp ? ` • ${tk.whatsapp}` : ""}
                {tk.telegram ? ` • ${tk.telegram}` : ""}
              </p>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                tk.is_read
                  ? "text-green-300 border-green-300/30 bg-green-300/10"
                  : "text-yellow-300 border-yellow-300/30 bg-yellow-300/10"
              }`}
            >
              {tk.is_read
                ? language === "ar"
                  ? "مقروءة"
                  : "Read"
                : language === "ar"
                ? "غير مقروءة"
                : "Unread"}
            </span>
          </div>

          <p className="text-white text-sm mt-2 whitespace-pre-wrap">
            {tk.message}
          </p>
        </div>
      ))}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-blue-200 text-sm">
          {language === "ar"
            ? `صفحة ${ticketsPage} من ${totalPages}`
            : `Page ${ticketsPage} of ${totalPages}`}
        </p>

        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm disabled:opacity-50"
            disabled={ticketsPage <= 1}
            onClick={() =>
              setTicketsPage((p) =>
                Math.max(1, p - 1)
              )
            }
          >
            {language === "ar" ? "السابق" : "Prev"}
          </button>

          <button
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm disabled:opacity-50"
            disabled={ticketsPage >= totalPages}
            onClick={() =>
              setTicketsPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
          >
            {language === "ar" ? "التالي" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

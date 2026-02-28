import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Sparkles, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

import {
  fetchAdminInvestments,
  fetchAdminInvestment,
  forcePayoutAdminInvestment,
  type AdminInvestment,
} from "@/api/admin/investments";

function fmtMoney(v: any) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  if (!Number.isFinite(n)) return String(v ?? "0.00");
  return n.toFixed(2);
}

function fmtPercent(v: any) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(2)}%`;
}

function fmtDate(v: any) {
  if (!v) return "—";
  return String(v).replace("T", " ").replace("Z", "");
}

function StatusBadge({ status }: { status?: any }) {
  const s = String(status ?? "").toLowerCase();
  const cls =
    s === "active"
      ? "bg-green-500/15 text-green-300 border-green-400/30"
      : s === "completed" || s === "finished"
      ? "bg-blue-500/15 text-blue-300 border-blue-400/30"
      : s === "pending"
      ? "bg-yellow-500/15 text-yellow-300 border-yellow-400/30"
      : "bg-white/10 text-white/80 border-white/20";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm text-white text-right break-words">{value}</div>
    </div>
  );
}

function normalizePack(pack: any) {
  if (!pack) return null;
  if (typeof pack === "string") {
    try {
      return JSON.parse(pack);
    } catch {
      return null;
    }
  }
  if (typeof pack === "object") return pack;
  return null;
}

function InvestmentDetailsPretty({ detail }: { detail: AdminInvestment }) {
  const pack = normalizePack((detail as any).pack);

  const packName = pack?.name ?? "—";
  const roi = fmtPercent(pack?.roi_percent ?? pack?.roi_percent);
  const duration = pack?.duration_days ?? pack?.duration ?? null;
  const payoutType = pack?.payout_type ?? "—";
  const minAmount = pack?.min_amount ?? "—";
  const maxAmount = pack?.max_amount ?? "—";

  return (
    <div className="space-y-5">
      {/* Header chips */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md border text-xs bg-white/10 text-white/80 border-white/20">
          Investment #{detail.id}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md border text-xs bg-white/10 text-white/80 border-white/20">
          User ID: {(detail as any).user_id ?? "—"}
        </span>
        <StatusBadge status={(detail as any).status} />
        <span className="inline-flex items-center px-2.5 py-1 rounded-md border text-xs bg-white/10 text-white/80 border-white/20">
          Matured: {(detail as any).is_matured ? "Yes" : "No"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold mb-3">Pack</div>
          <div className="space-y-2">
            <Field label="Name" value={packName} />
            <Field label="ROI" value={roi} />
            <Field label="Duration" value={duration ? `${duration} days` : "—"} />
            <Field label="Payout Type" value={String(payoutType)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Min" value={`${fmtMoney(minAmount)} USDT`} />
              <Field label="Max" value={`${fmtMoney(maxAmount)} USDT`} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold mb-3">Investment</div>
          <div className="space-y-2">
            <Field label="Amount" value={`${fmtMoney((detail as any).amount)} USDT`} />
            <Field label="Status" value={<StatusBadge status={(detail as any).status} />} />
            <Field label="Start Date" value={fmtDate((detail as any).start_date)} />
            <Field label="End Date" value={fmtDate((detail as any).end_date)} />
          </div>
        </div>
      </div>

      {/* Returns */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-white font-semibold mb-3">Returns</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Field
            label="Expected"
            value={`${fmtMoney((detail as any).expected_total_return)} USDT`}
          />
          <Field
            label="Earned"
            value={`${fmtMoney((detail as any).earned_so_far)} USDT`}
          />
          <Field
            label="Paid"
            value={`${fmtMoney((detail as any).accrued_return_paid)} USDT`}
          />
        </div>
      </div>
    </div>
  );
}




export function InvestmentManagement() {
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [items, setItems] = useState<AdminInvestment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<AdminInvestment | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminInvestments();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(String(e?.message || "Failed to load investments"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = items.reduce((sum, it) => sum + (parseFloat(String(it.amount ?? 0)) || 0), 0);
    const count = items.length;
    const uniqueUsers = new Set(items.map((i) => i.user_id).filter(Boolean)).size;
    return { total, count, uniqueUsers };
  }, [items]);

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await fetchAdminInvestment(id);
      setDetail(d);
    } catch (e: any) {
      toast.error(String(e?.message || "Failed to load investment"));
    } finally {
      setDetailLoading(false);
    }
  };

  const payout = async (id: number) => {
    const ok = confirm(`Force payout for investment #${id}?`);
    if (!ok) return;

    setMutating(true);
    try {
      const res = await forcePayoutAdminInvestment(id);
      const paid = res?.paid ? `${res.paid} USDT` : "Payout processed";
      toast.success("Payout processed", { description: paid });
      await load();
    } catch (e: any) {
      toast.error(String(e?.message || "Payout failed"));
    } finally {
      setMutating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <p className="text-white">Loading investments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-3">
        <p className="text-white">Failed to load investments</p>
        <p className="text-blue-200 text-sm">{error}</p>
        <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white" disabled={mutating}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Total Investments</p>
          <p className="text-white text-2xl">{stats.count}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Unique Users</p>
          <p className="text-white text-2xl">{stats.uniqueUsers}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Total Invested (approx)</p>
          <p className="text-white text-2xl">{fmtMoney(stats.total)} USDT</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white">Investments</h3>
          <p className="text-blue-200 text-sm">List, inspect, and force payout for investments</p>
        </div>
        <Button
          onClick={load}
          variant="outline"
          className="bg-white/10 border-white/20 text-white"
          disabled={mutating}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left text-blue-200 text-sm px-6 py-4">ID</th>
                <th className="text-left text-blue-200 text-sm px-6 py-4">User ID</th>
                <th className="text-left text-blue-200 text-sm px-6 py-4">Amount</th>
                <th className="text-right text-blue-200 text-sm px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv.id} className="border-t border-white/10">
                  <td className="px-6 py-4 text-white">#{inv.id}</td>
                  <td className="px-6 py-4 text-white">{inv.user_id ?? "—"}</td>
                  <td className="px-6 py-4 text-white">{fmtMoney(inv.amount)} USDT</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white"
                        onClick={() => openDetail(inv.id)}
                        disabled={mutating}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => payout(inv.id)}
                        disabled={mutating}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Force Payout
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-blue-200" colSpan={4}>
                    No investments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription className="text-blue-200">
              {detailLoading ? "Loading..." : detail ? `#${detail.id}` : ""}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
  <div className="py-6 text-blue-200">Loading investment...</div>
) : detail ? (
  <InvestmentDetailsPretty detail={detail} />
) : (
  <div className="py-6 text-blue-200">No data.</div>
)}


          <DialogFooter>
            <Button
              onClick={() => setDetailOpen(false)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

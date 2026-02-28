import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Eye, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import type { AdminWithdrawal } from "../../api/admin/withdrawals";
import {
  fetchAdminWithdrawalRequests,
  approveAdminWithdrawalRequest,
  rejectAdminWithdrawalRequest,
} from "../../api/admin/withdrawals";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function toNumber(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function extractApiError(err: any, fallback = "Something went wrong") {
  const data = err?.response?.data;
  return (
    data?.message ||
    data?.errors?.detail ||
    data?.detail ||
    err?.message ||
    fallback
  );
}

function statusPill(status: string) {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "pending"
      ? "bg-yellow-500/15 text-yellow-300 border-yellow-400/30"
      : s === "approved" || s === "completed"
      ? "bg-green-500/15 text-green-300 border-green-400/30"
      : s === "rejected"
      ? "bg-red-500/15 text-red-300 border-red-400/30"
      : s === "processing"
      ? "bg-blue-500/15 text-blue-200 border-blue-400/30"
      : "bg-white/10 text-blue-100 border-white/20";

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs border ${cls}`}>
      {status}
    </span>
  );
}

type StatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "approved"
  | "completed"
  | "rejected";

function canProcess(status?: string) {
  const s = String(status || "").toLowerCase();
  return s === "pending" || s === "processing";
}

export function WithdrawalRequests() {
  const [items, setItems] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("pending");

  // Review dialog
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdminWithdrawal | null>(null);
  const [txHash, setTxHash] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const list = await fetchAdminWithdrawalRequests();
      const normalized = Array.isArray(list) ? list : [];

      normalized.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(normalized);

      if (selected) {
        const fresh = normalized.find((x) => x.id === selected.id) || null;
        setSelected(fresh);
      }
    } catch (err: any) {
      setErrorMsg(extractApiError(err, "Failed to load withdrawal requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const pending = items.filter(
      (x) => String(x.status).toLowerCase() === "pending"
    );
    const pendingAmount = pending.reduce(
      (sum, x) => sum + toNumber(x.amount, 0),
      0
    );

    return {
      total: items.length,
      pendingCount: pending.length,
      pendingAmount,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((w) => {
      const matchesStatus =
        status === "all" ? true : String(w.status).toLowerCase() === status;

      const matchesQuery =
        !q
          ? true
          : [
              String(w.id),
              String(w.user_id),
              w.amount,
              w.status,
              w.reference,
              w.payout_address,
              w.created_at,
              w.transaction_id,
              w.notes,
            ]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [items, query, status]);

  const openReview = (w: AdminWithdrawal) => {
    setSelected(w);
    setTxHash(w.transaction_id ?? "");
    setNotes(w.notes ?? "");
    setOpen(true);
  };

  const approve = async () => {
    if (!selected) return;

    if (!canProcess(selected.status)) {
      toast.error("Request already processed");
      return;
    }

    setSubmitting(true);
    try {
      await approveAdminWithdrawalRequest(selected.id, {
        transaction_id: txHash.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      toast.success("Withdrawal approved");
      setOpen(false);
      setSelected(null);
      setTxHash("");
      setNotes("");
      await load();
    } catch (err: any) {
      toast.error(extractApiError(err, "Failed to approve withdrawal"));
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    if (!selected) return;

    if (!canProcess(selected.status)) {
      toast.error("Request already processed");
      return;
    }

    if (!notes.trim()) {
      toast.error("Please add a rejection note");
      return;
    }

    setSubmitting(true);
    try {
      await rejectAdminWithdrawalRequest(selected.id, {
        notes: notes.trim(),
      });

      toast.success("Withdrawal rejected");
      setOpen(false);
      setSelected(null);
      setTxHash("");
      setNotes("");
      await load();
    } catch (err: any) {
      toast.error(extractApiError(err, "Failed to reject withdrawal"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <p className="text-white">Loading withdrawal requests...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4">
        <p className="text-white">Failed to load withdrawal requests</p>
        <p className="text-blue-200 text-sm">{errorMsg}</p>
        <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Total Requests</p>
          <p className="text-white text-2xl">{stats.total}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Pending Requests</p>
          <p className="text-white text-2xl">{stats.pendingCount}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Pending Amount</p>
          <p className="text-white text-2xl">{stats.pendingAmount.toFixed(2)} USDT</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, user_id, reference, address, tx hash..."
            className="bg-white/10 border-white/20 text-white"
          />

          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20 text-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white">
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[90px]">
                  ID
                </th>
                <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[110px]">
                  User
                </th>
                <th className="text-right text-blue-200 text-xs font-medium px-6 py-4 w-[150px]">
                  Amount
                </th>
                <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[150px]">
                  Status
                </th>
                <th className="text-left text-blue-200 text-xs font-medium px-6 py-4">
                  Address
                </th>
                <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[260px]">
                  Reference
                </th>
                <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[190px]">
                  Created
                </th>
                <th className="text-left text-blue-200 text-xs font-medium px-6 py-4 w-[130px]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((w) => (
                <tr
                  key={w.id}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-white text-sm font-mono">#{w.id}</td>
                  <td className="px-6 py-4 text-white text-sm">#{w.user_id}</td>
                  <td className="px-6 py-4 text-right text-white text-sm">
                    {toNumber(w.amount, 0).toFixed(2)} USDT
                  </td>
                  <td className="px-6 py-4">{statusPill(w.status)}</td>

                  <td
                    className="px-6 py-4 text-blue-100 text-sm truncate max-w-[1px]"
                    title={w.payout_address}
                  >
                    {w.payout_address}
                  </td>

                  <td
                    className="px-6 py-4 text-blue-100 text-sm truncate max-w-[1px]"
                    title={w.reference}
                  >
                    {w.reference}
                  </td>

                  <td className="px-6 py-4 text-blue-100 text-sm">
                    {formatDate(w.created_at)}
                  </td>

                  <td className="px-6 py-4">
                    <Button
                      onClick={() => openReview(w)}
                      className="bg-blue-500 hover:bg-blue-600"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-blue-200">
                    No withdrawal requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (submitting) return;
          if (!v) {
            setSelected(null);
            setTxHash("");
            setNotes("");
          }
          setOpen(v);
        }}
      >
        <DialogContent className="bg-slate-900 text-white border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-blue-400" />
              Review Withdrawal Request
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Request ID</p>
                    <p className="text-white font-mono">#{selected.id}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">User ID</p>
                    <p className="text-white font-mono">#{selected.user_id}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Amount</p>
                    <p className="text-white text-xl">
                      {toNumber(selected.amount, 0).toFixed(2)} USDT
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Status</p>
                    {statusPill(selected.status)}
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-blue-200 text-sm mb-1">Payout Address</p>
                    <p className="text-white font-mono break-all">
                      {selected.payout_address}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-blue-200 text-sm mb-1">Reference</p>
                    <p className="text-white font-mono break-all">{selected.reference}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-blue-200 text-sm mb-1">Created At</p>
                    <p className="text-white">{formatDate(selected.created_at)}</p>
                  </div>

                  {(selected.reviewed_at || selected.reviewed_by) && (
                    <div className="md:col-span-2 border-t border-white/10 pt-4">
                      {selected.reviewed_at && (
                        <p className="text-blue-200 text-sm">
                          Reviewed at:{" "}
                          <span className="text-white">{formatDate(selected.reviewed_at)}</span>
                        </p>
                      )}
                      {selected.reviewed_by && (
                        <p className="text-blue-200 text-sm">
                          Reviewed by:{" "}
                          <span className="text-white font-mono">#{selected.reviewed_by}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-blue-200 text-sm mb-2 block">
                    Transaction Hash (optional / after sending)
                  </label>
                  <Input
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Paste blockchain transaction hash (if applicable)"
                    className="bg-white/10 border-white/20 text-white font-mono"
                    disabled={submitting || !canProcess(selected.status)}
                  />
                </div>

                <div>
                  <label className="text-blue-200 text-sm mb-2 block">
                    Notes (required for reject)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Address mismatch / insufficient confirmations / suspicious activity..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white min-h-[96px]"
                    disabled={submitting || !canProcess(selected.status)}
                  />
                </div>

                {!canProcess(selected.status) && (
                  <div className="text-yellow-200 text-sm bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-3">
                    This request is already processed. You can view details, but you cannot approve/reject it.
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-white/20"
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              onClick={reject}
              className="bg-red-500 hover:bg-red-600"
              disabled={submitting || !selected || !canProcess(selected.status)}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>

            <Button
              onClick={approve}
              className="bg-green-500 hover:bg-green-600"
              disabled={submitting || !selected || !canProcess(selected.status)}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

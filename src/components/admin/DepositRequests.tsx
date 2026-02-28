import { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, Check, X, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

import {
  fetchDepositRequests,
  approveDepositRequest,
  rejectDepositRequest,
  type AdminDepositRequest,
} from "@/api/adminDeposits";

import { fetchAdminUsers, type AdminUser } from "@/api/adminUsers";
import { adminApi } from "@/api/adminApi";



function toMediaUrlSafe(maybeUrl?: string | null): string {
  const raw = normalizeProofValue(maybeUrl);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const base = (adminApi.defaults.baseURL ?? "").trim();
  let origin = window.location.origin;
  try {
    if (base) origin = new URL(base).origin;
  } catch {
  }

  let path = raw;
  if (!path.startsWith("/")) path = `/${path}`;

  if (!path.startsWith("/media/") && /\/deposits\/proofs\//i.test(path)) {
    path = `/media${path}`;
  }

  return `${origin}${path}`;
}

function normalizeProofValue(v: any): string {
  if (!v) return "";
  if (typeof v === "object") {
    const candidate =
      (v as any).url ??
      (v as any).uri ??
      (v as any).path ??
      (v as any).file ??
      (v as any).name ??
      (v as any).src ??
      "";
    return typeof candidate === "string" ? candidate : "";
  }

  const s = String(v).trim();
  if (!s) return "";
  if (["-", "—", "none", "null", "undefined"].includes(s.toLowerCase())) return "";
  return s;
}

function ProofImage({ url }: { url: string }) {
  const [src, setSrc] = useState<string>(url);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(url);
    setFailed(false);
  }, [url]);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function fetchBlob() {
      if (!failed || !url) return;

      try {
        const res = await adminApi.get(url, { responseType: "blob" });
        if (cancelled) return;

        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      } catch {
      }
    }

    fetchBlob();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [failed, url]);

  if (!url) {
    return (
      <div className="text-sm text-muted-foreground">
        No proof uploaded
      </div>
    );
  }

  // فتح بالحجم الكامل
  const openFull = () => {
    window.open(src || url, "_blank");
  };

  return (
    <div className="space-y-3">
      {/* زر فتح كامل */}
      <button
        onClick={openFull}
        className="text-xs underline text-blue-300 hover:text-blue-200"
      >
        Open full size image
      </button>

      {/* المعاينة */}
      <div
        className="rounded-md border overflow-hidden bg-black/20 cursor-zoom-in"
        onClick={openFull}
        title="Click to open full size"
        style={{ maxHeight: 320 }}
      >
        <img
          src={src}
          alt="Deposit proof"
          style={{
            width: "100%",
            height: "240px",
            objectFit: "contain",
            display: "block",
          }}
          onError={() => setFailed(true)}
        />
      </div>

      {failed && (
        <div className="text-xs text-red-300">
          Preview failed. Click above to open full image.
        </div>
      )}
    </div>
  );
}


type DepositRow = {
  id: number;
  userId?: number;
  userName: string;
  email: string;
  amount: number;
  txHash: string;
  walletAddress: string;
  paymentMethod: string;
  proofUrl: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected" | string;
};

function toNumber(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function formatDateTime(isoOrStr: string) {
  const d = new Date(isoOrStr);
  if (Number.isNaN(d.getTime())) return isoOrStr;
  return d.toLocaleString();
}

function resolveUserLabel(u?: AdminUser | null): { name: string; email: string } {
  if (!u) return { name: "—", email: "—" };
  const name =
    u.full_name ||
    `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
    (u.email ? u.email.split("@")[0] : "") ||
    `User #${u.id}`;
  return { name, email: u.email ?? "—" };
}

function mapApiToRow(x: AdminDepositRequest, userMap: Map<number, AdminUser>): DepositRow {
  const userId = x.user?.id ?? x.user_id;
  const mergedUser: AdminUser | null =
    (x.user?.id
      ? {
          id: x.user.id,
          email: x.user.email,
          full_name: x.user.full_name,
          first_name: x.user.first_name,
          last_name: x.user.last_name,
        }
      : null) || (userId ? userMap.get(userId) ?? null : null);

  const { name: userName, email } = resolveUserLabel(mergedUser);

  const rawProof =
    (x as any).proof ??
    (x as any).proof_url ??
    (x as any).proof_image ??
    (x as any).proofFile ??
    "";
  const normalizedProof = normalizeProofValue(rawProof);

  return {
    id: x.id,
    userId,
    userName: userName || (userId ? `User #${userId}` : "—"),
    email,
    amount: toNumber(x.amount, 0),
    txHash: x.tx_hash ?? "",
    walletAddress: x.wallet_address ?? "",
    paymentMethod: x.payment_method ?? "—",
    proofUrl: toMediaUrlSafe(normalizedProof),
    submittedDate: formatDateTime(x.created_at ?? ""),
    status: x.status ?? "pending",
  };
}

export function DepositRequests() {
  const [items, setItems] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<DepositRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState<
    "approve" | "reject" | null
  >(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, users] = await Promise.all([
        fetchDepositRequests(),
       
        fetchAdminUsers().catch(() => [] as AdminUser[]),
      ]);

      const userMap = new Map<number, AdminUser>();
      for (const u of users) userMap.set(u.id, u);

      setItems(list.map((x) => mapApiToRow(x, userMap)));
    } catch (e: any) {
      toast.error("Failed to load deposit requests");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestStatus = useCallback(async (requestId: number) => {
    const list = await fetchDepositRequests();
    const item = list.find((x) => x.id === requestId);
    return String(item?.status ?? "").toLowerCase();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(
    () => items.filter((d) => String(d.status).toLowerCase() === "pending"),
    [items]
  );

  const totalPendingAmount = useMemo(
    () => pending.reduce((sum, d) => sum + d.amount, 0),
    [pending]
  );

  const handleView = (row: DepositRow) => {
    setSelected(row);
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selected) return;

    setActionLoading("approve");
    try {
      await approveDepositRequest(selected.id);

      setItems((prev) =>
        prev.map((x) =>
          x.id === selected.id ? { ...x, status: "approved" } : x
        )
      );

      toast.success("Deposit approved and credited");
      setDialogOpen(false);
      setSelected(null);
    } catch (e: any) {
      try {
        const status = await fetchLatestStatus(selected.id);
        await load();
        if (status === "approved") {
          toast.success("Deposit approved and credited");
          setDialogOpen(false);
          setSelected(null);
        } else {
          toast.error("Approve failed");
        }
      } catch {
        toast.error("Approve failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selected) return;

    setActionLoading("reject");
    try {
      await rejectDepositRequest(selected.id);

      setItems((prev) =>
        prev.map((x) =>
          x.id === selected.id ? { ...x, status: "rejected" } : x
        )
      );

      toast.success("Deposit rejected");
      setDialogOpen(false);
      setSelected(null);
    } catch (e: any) {
      try {
        const status = await fetchLatestStatus(selected.id);
        await load();
        if (status === "rejected") {
          toast.success("Deposit rejected");
          setDialogOpen(false);
          setSelected(null);
        } else {
          toast.error("Reject failed");
        }
      } catch {
        toast.error("Reject failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Pending Requests</p>
          <p className="text-white text-2xl">{pending.length}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Pending Amount</p>
          <p className="text-white text-2xl">
            {totalPendingAmount.toLocaleString()} USDT
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Total Requests</p>
            <p className="text-white text-2xl">{items.length}</p>
          </div>
          <Button
            onClick={load}
            disabled={loading}
            variant="outline"
            className="bg-white/10 border-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Pending Deposits */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Pending Deposit Requests</h3>
          {loading && <p className="text-blue-200 text-sm">Loading…</p>}
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-blue-400/30 mx-auto mb-4" />
            <p className="text-blue-200">No pending deposit requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((deposit) => (
              <div
                key={deposit.id}
                className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>

                  <div>
                    <p className="text-white">{deposit.userName}</p>
                    <p className="text-blue-300 text-sm">{deposit.email}</p>
                    <p className="text-blue-400 text-xs font-mono mt-1">
                      TX: {deposit.txHash ? `${deposit.txHash.substring(0, 20)}...` : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-white">{deposit.amount.toLocaleString()} USDT</p>
                    <p className="text-blue-300 text-sm">{deposit.submittedDate}</p>
                  </div>

                  <Button
                    onClick={() => handleView(deposit)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
       <DialogContent
  style={{
    width: "560px",
    maxWidth: "92vw",
    maxHeight: "64vh",
    overflowY: "auto",
    padding: "16px",
  }}
  className="bg-slate-900 text-white border-white/20"
>

          <DialogHeader>
            <DialogTitle>Review Deposit Request</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">User Name</p>
                    <p className="text-white">{selected.userName}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Email</p>
                    <p className="text-white">{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Amount</p>
                    <p className="text-white text-xl">
                      {selected.amount.toLocaleString()} USDT
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Payment Method</p>
                    <p className="text-white">{selected.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Submitted</p>
                    <p className="text-white">{selected.submittedDate}</p>
                  </div>
                </div>
              </div>

              {/* Proof */}
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-200 text-sm mb-3">Proof</p>
                <ProofImage url={selected.proofUrl} />
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-blue-200 text-sm mb-2">Transaction Hash</p>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white font-mono text-sm break-all">
                      {selected.txHash || "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-blue-200 text-sm mb-2">Platform Wallet Address</p>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white font-mono text-sm break-all">
                      {selected.walletAddress || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {selected.txHash ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      window.open(
                        `https://tronscan.org/#/transaction/${selected.txHash}`,
                        "_blank"
                      )
                    }
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20"
                  >
                    View on Blockchain
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outline"
              className="bg-transparent border-white/20"
            >
              Cancel
            </Button>

            <Button
              onClick={handleReject}
              disabled={!selected || actionLoading !== null}
              className="bg-red-500 hover:bg-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              {actionLoading === "reject" ? "Rejecting..." : "Reject"}
            </Button>

            <Button
              onClick={handleApprove}
              disabled={!selected || actionLoading !== null}
              className="bg-green-500 hover:bg-green-600"
            >
              <Check className="w-4 h-4 mr-2" />
              {actionLoading === "approve" ? "Approving..." : "Approve & Credit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

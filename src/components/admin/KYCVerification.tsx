import { useMemo, useState } from "react";
import { FileText, Check, X, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";

import { useAdminKycList, type AdminKycRow } from "@/hooks/useAdminKycList";
import { approveAdminKyc, rejectAdminKyc } from "@/api/admin/kyc";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}

function buildCandidates(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return [
    `https://investpro-company.com${clean}`,
    `https://investpro-company.com/api${clean}`,
  ];
}

function PassportPreview({ passportImage }: { passportImage?: string | null }) {
  const [idx, setIdx] = useState(0);

  if (!passportImage) {
    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-blue-200 text-sm mb-1">Passport Image</p>
        <p className="text-yellow-200 text-xs">
          Passport image field is not returned by the API yet.
        </p>
      </div>
    );
  }

  const candidates = buildCandidates(passportImage);
  const src = candidates[Math.min(idx, candidates.length - 1)];

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <p className="text-blue-200 text-sm mb-2">Passport Image</p>

      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <img
          src={src}
          alt="Passport"
          className="w-full md:w-72 rounded-lg border border-white/20 bg-white/5"
          onError={() => {
            if (idx < candidates.length - 1) setIdx((v) => v + 1);
          }}
        />

        <div className="space-y-2">
          <code className="text-xs text-white/80 break-all block">{passportImage}</code>

          <div className="flex flex-wrap gap-3">
            <button
              className="text-blue-300 text-xs underline"
              onClick={() => navigator.clipboard.writeText(passportImage)}
            >
              Copy path
            </button>

            <a
              className="text-blue-300 text-xs underline"
              href={src}
              target="_blank"
              rel="noreferrer"
            >
              Open attempt
            </a>
          </div>

          <p className="text-yellow-200 text-xs">
            If preview doesn’t load, backend must expose <code>/media</code> or provide a protected
            documents endpoint.
          </p>
        </div>
      </div>
    </div>
  );
}

export function KYCVerification() {
  const qc = useQueryClient();

  const { data: rows, isLoading, error, refetch, isFetching } = useAdminKycList();

  const [selected, setSelected] = useState<AdminKycRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const pending = useMemo(() => (rows ?? []).filter((r) => r.status === "pending"), [rows]);
  const approved = useMemo(() => (rows ?? []).filter((r) => r.status === "approved"), [rows]);
  const rejected = useMemo(() => (rows ?? []).filter((r) => r.status === "rejected"), [rows]);

  const approveMut = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => approveAdminKyc(id, notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-kyc-list"] });
      window.dispatchEvent(new CustomEvent("admin-users-refresh"));

      setDialogOpen(false);
      setSelected(null);
      setNotes("");
      alert("KYC approved successfully!");
    },
    onError: (e: any) => alert(e?.message || "Failed to approve KYC"),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => rejectAdminKyc(id, notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-kyc-list"] });
      window.dispatchEvent(new CustomEvent("admin-users-refresh"));

      setDialogOpen(false);
      setSelected(null);
      setNotes("");
      alert("KYC rejected. User will be notified.");
    },
    onError: (e: any) => alert(e?.message || "Failed to reject KYC"),
  });

  const openReview = (row: AdminKycRow) => {
    setSelected(row);
    setNotes(row.notes ?? "");
    setDialogOpen(true);
    console.log("passport_image =", row.passport_image);
  };

  const onApprove = () => {
    if (!selected) return;
    const n = (notes || "").trim() || "Verified";
    approveMut.mutate({ id: selected.id, notes: n });
  };

  const onReject = () => {
    if (!selected) return;
    if (!notes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    rejectMut.mutate({ id: selected.id, notes: notes.trim() });
  };

  const busy = approveMut.isPending || rejectMut.isPending;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Pending Verification</p>
          <p className="text-white text-2xl">{pending.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Approved</p>
          <p className="text-white text-2xl">{approved.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Rejected</p>
          <p className="text-white text-2xl">{rejected.length}</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-white">Pending KYC Verification Requests</h3>
          <Button
            onClick={() => refetch()}
            className="bg-white/10 hover:bg-white/20 text-white"
            disabled={isFetching}
          >
            Refresh
          </Button>
        </div>

        {isLoading && <p className="text-blue-200">Loading KYC…</p>}
        {error && <p className="text-red-400">Failed to load KYC list</p>}

        {!isLoading && pending.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-blue-400/30 mx-auto mb-4" />
            <p className="text-blue-200">No pending KYC requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((row) => {
              const name = row.user?.full_name || row.user?.username || `User #${row.user_id}`;
              const email = row.user?.email || "—";
              const country = row.user?.country || "—";

              return (
                <div
                  key={row.id}
                  className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>

                    <div>
                      <p className="text-white">{name}</p>
                      <p className="text-blue-300 text-sm">{email}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          ID: {row.user_id}
                        </Badge>
                        <span className="text-blue-400 text-xs">{country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <p className="text-blue-200 text-sm">Submitted</p>
                      <p className="text-white text-sm">{formatDate(row.submitted_at)}</p>
                    </div>

                    <Button onClick={() => openReview(row)} className="bg-blue-500 hover:bg-blue-600">
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelected(null);
            setNotes("");
          }
        }}
      >
        <DialogContent  style={{
    width: "560px",
    maxWidth: "92vw",
    maxHeight: "64vh",
    overflowY: "auto",
    padding: "16px",
  }}
  className="bg-slate-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>KYC Review</DialogTitle>
            <DialogDescription className="text-blue-200">
              Approve or reject this request. (Preview may depend on backend media setup.)
            </DialogDescription>
          </DialogHeader>

          {!selected ? (
            <p className="text-blue-200 text-sm">No selection</p>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Info label="KYC ID" value={`#${selected.id}`} mono />
                  <Info label="User ID" value={`#${selected.user_id}`} mono />
                  <Info label="Status" value={selected.status} />
                  <Info label="Submitted At" value={formatDate(selected.submitted_at)} />
                  <Info label="Reviewed At" value={formatDate(selected.reviewed_at)} />

                  <Info label="Full Name" value={selected.user?.full_name || "—"} />
                  <Info label="Email" value={selected.user?.email || "—"} />
                  <Info label="Country" value={selected.user?.country || "—"} />
                  <Info
                    label="User KYC Verified"
                    value={selected.user?.is_kyc_verified ? "Yes" : "No"}
                  />
                </div>
              </div>

              {/* Passport (from LIST row) */}
               <div className="bg-white/5 rounded-lg p-3">
                 <PassportPreview passportImage={selected.passport_image ?? null} />
              </div>


              {/* Notes */}
              <div>
                <label className="text-blue-200 text-sm mb-2 block">
                  Notes (required for reject)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write admin notes / rejection reason…"
                  className="bg-white/10 border-white/20 text-white min-h-[110px]"
                  disabled={busy}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outline"
              className="bg-transparent border-white/20"
              disabled={busy}
            >
              Cancel
            </Button>

            <Button
              onClick={onReject}
              className="bg-red-500 hover:bg-red-600"
              disabled={!selected || busy}
            >
              <X className="w-4 h-4 mr-2" />
              {rejectMut.isPending ? "Rejecting…" : "Reject"}
            </Button>

            <Button
              onClick={onApprove}
              className="bg-green-500 hover:bg-green-600"
              disabled={!selected || busy}
            >
              <Check className="w-4 h-4 mr-2" />
              {approveMut.isPending ? "Approving…" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-blue-200 text-sm mb-1">{label}</p>
      <p className={mono ? "text-white font-mono break-all" : "text-white break-all"}>{value}</p>
    </div>
  );
}

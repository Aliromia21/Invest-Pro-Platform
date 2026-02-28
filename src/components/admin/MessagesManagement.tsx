import { useEffect, useMemo, useState } from "react";
import { Check, X, ExternalLink, RefreshCcw, Search, Users, Gift } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";

import type {
  MessageRecipient,
  UserResponse,
  VerificationStatus,
} from "../../api/admin/messageRecipients";

import {
  listMessageRecipients,
  approveMessageRecipient,
  rejectMessageRecipient,
  extractRecipientFromApprove,
  extractRecipientFromReject,
} from "../../api/admin/messageRecipients";

function fmtDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}


function statusTextColor(s: string) {
  const v = String(s || "").toLowerCase();
  if (v === "approved") return "text-green-400";
  if (v === "rejected") return "text-red-400";
  if (v === "pending") return "text-yellow-400";
  if (v === "accepted") return "text-blue-300";
  if (v === "declined") return "text-red-300";
  return "text-blue-100";
}


function isValidUrl(s?: string | null) {
  if (!s) return false;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function statusBadge(status: string) {
  const cls =
    status === "approved"
      ? "bg-green-500/20 text-green-300 border-green-400/40"
      : status === "rejected"
      ? "bg-red-500/20 text-red-300 border-red-400/40"
      : status === "pending"
      ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
      : "bg-white/10 text-blue-200 border-white/20";

  return <Badge className={`${cls} border`}>{status}</Badge>;
}

export function MessagesManagement() {
  const [items, setItems] = useState<MessageRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<number | null>(null);

  // Filters
  const [verification, setVerification] = useState<VerificationStatus | "all">("pending");
  const [userResp, setUserResp] = useState<UserResponse | "all">("all");
  const [q, setQ] = useState("");

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  async function refetch() {
    setLoading(true);
    try {
      const res = await listMessageRecipients();
      setItems(res.data ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load recipients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((r) => {
      if (verification !== "all" && r.verification_status !== verification) return false;
      if (userResp !== "all" && r.user_response !== userResp) return false;

      if (!qq) return true;

      const hay = [
        String(r.id),
        String(r.user_id),
        r.message?.subject ?? "",
        r.message?.body ?? "",
        r.submitted_link ?? "",
        r.verification_status ?? "",
        r.user_response ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(qq);
    });
  }, [items, verification, userResp, q]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((x) => x.verification_status === "pending").length,
      approved: items.filter((x) => x.verification_status === "approved").length,
      rejected: items.filter((x) => x.verification_status === "rejected").length,
      submitted: items.filter((x) => !!x.submitted_link).length,
    };
  }, [items]);

  function updateRow(updated: MessageRecipient) {
    setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function handleApprove(r: MessageRecipient) {
    if (mutatingId) return;
    setMutatingId(r.id);

    try {
      const res = await approveMessageRecipient(r.id);
      const { paid, recipient } = extractRecipientFromApprove(res);

      updateRow(recipient);
      toast.success(`Approved — paid ${paid}`);

      await refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Approve failed");
    } finally {
      setMutatingId(null);
    }
  }

  function openReject(r: MessageRecipient) {
    setRejectId(r.id);
    setRejectNotes("");
    setRejectOpen(true);
  }

  async function confirmReject() {
    if (!rejectId) return;
    if (mutatingId) return;

    const notes = rejectNotes.trim();
    if (notes.length < 3) {
      toast.error("Please write rejection notes (min 3 characters).");
      return;
    }

    setMutatingId(rejectId);
    try {
      const res = await rejectMessageRecipient(rejectId, notes);
      const recipient = extractRecipientFromReject(res);

      updateRow(recipient);
      toast.success("Rejected");

      setRejectOpen(false);
      setRejectId(null);
      setRejectNotes("");

      await refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Reject failed");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Total</p>
          <p className="text-white text-2xl">{stats.total}</p>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
          <p className="text-yellow-200 text-sm mb-1">Pending</p>
          <p className="text-white text-2xl">{stats.pending}</p>
        </div>
        <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30">
          <p className="text-purple-200 text-sm mb-1">Submitted</p>
          <p className="text-white text-2xl">{stats.submitted}</p>
        </div>
        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
          <p className="text-green-200 text-sm mb-1">Approved</p>
          <p className="text-white text-2xl">{stats.approved}</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
          <p className="text-red-200 text-sm mb-1">Rejected</p>
          <p className="text-white text-2xl">{stats.rejected}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={refetch}
          variant="outline"
          className="bg-transparent border-white/20 text-white"
          disabled={loading || !!mutatingId}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          {loading ? "Loading..." : "Refresh"}
        </Button>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Verification filter */}
          <div className="min-w-[200px]">
            <Select value={verification} onValueChange={(v) => setVerification(v as any)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Verification status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="pending" className="text-white hover:bg-white/10">
                  pending
                </SelectItem>
                <SelectItem value="approved" className="text-white hover:bg-white/10">
                  approved
                </SelectItem>
                <SelectItem value="rejected" className="text-white hover:bg-white/10">
                  rejected
                </SelectItem>
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  all
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User response filter */}
          <div className="min-w-[200px]">
            <Select value={userResp} onValueChange={(v) => setUserResp(v as any)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="User response" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  all
                </SelectItem>
                <SelectItem value="pending" className="text-white hover:bg-white/10">
                  pending
                </SelectItem>
                <SelectItem value="accepted" className="text-white hover:bg-white/10">
                  accepted
                </SelectItem>
                <SelectItem value="declined" className="text-white hover:bg-white/10">
                  declined
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by id, user id, subject, link..."
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-blue-300"
            />
          </div>
        </div>
      </div>

     {/* Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden text-white">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-white">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-blue-200 text-xs w-[90px]">ID</th>
                      <th className="px-6 py-4 text-left text-blue-200 text-xs w-[130px]">User</th>
                      <th className="px-6 py-4 text-left text-blue-200 text-xs">Message</th>
                      <th className="px-6 py-4 text-right text-blue-200 text-xs w-[120px]">Reward</th>
                      <th className="px-6 py-4 text-left text-blue-200 text-xs w-[120px]">User response</th>
                      <th className="px-6 py-4 text-left text-blue-200 text-xs w-[120px]">Verification</th>
                      <th className="px-6 py-4 text-left text-blue-200 text-xs w-[220px]">Submitted link</th>
                      <th className="px-6 py-4 text-left text-blue-200 text-xs w-[170px]">Created</th>
                      <th className="px-6 py-4 text-left text-blue-200 text-xs w-[220px]">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((r) => {
                      const busy = mutatingId === r.id;
                      const canReview = String(r.verification_status).toLowerCase() === "pending";

                      return (
                        <tr
                          key={r.id}
                          className="border-t border-white/10 hover:bg-white/5 transition-colors"
                        >
                          {/* ID */}
                          <td className="px-6 py-4 text-white text-sm font-mono">
                            #{r.id}
                          </td>

                          {/* User */}
                          <td className="px-6 py-4 text-white text-sm">
                            #{r.user_id}
                          </td>

                          {/* Message */}
                          <td className="px-6 py-4 text-white text-sm">
                            <div className="truncate" title={r.message?.subject ?? ""}>
                              <span className="font-medium">{r.message?.subject ?? "—"}</span>
                            </div>
                            <div className="text-blue-200 text-xs truncate" title={r.message?.body ?? ""}>
                              {r.message?.body ?? "—"}
                            </div>
                          </td>

                          {/* Reward */}
                          <td className="px-6 py-4 text-right text-white text-sm">
                            {r.message?.reward ?? "—"}
                          </td>

                          {/* User response */}
                          <td className={`px-6 py-4 text-sm ${statusTextColor(r.user_response)}`}>
                            {r.user_response ?? "—"}
                          </td>

                          {/* Verification */}
                          <td className={`px-6 py-4 text-sm ${statusTextColor(r.verification_status)}`}>
                            {r.verification_status ?? "—"}
                          </td>

                          {/* Submitted link */}
                          <td className="px-6 py-4 text-sm">
                            {r.submitted_link ? (
                              <div className="flex items-center gap-2">
                                <span className="text-blue-100 text-xs truncate" title={r.submitted_link}>
                                  {r.submitted_link}
                                </span>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-white/10 border-white/20 text-white"
                                  onClick={() => navigator.clipboard.writeText(r.submitted_link || "")}
                                  disabled={busy}
                                >
                                  Copy
                                </Button>

                                {isValidUrl(r.submitted_link) && (
                                  <a
                                    href={r.submitted_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-200 text-xs hover:underline inline-flex items-center"
                                  >
                                    Open <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-blue-200 text-xs">—</span>
                            )}
                          </td>

                          {/* Created */}
                          <td className="px-6 py-4 text-blue-100 text-sm">
                            {fmtDate(r.message?.created_at)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleApprove(r)}
                                disabled={!canReview || busy}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => openReject(r)}
                                disabled={!canReview || busy}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>

                              {!canReview && (
                                <span className="text-blue-200 text-xs">
                                  Reviewed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-10 text-center text-blue-200">
                          No recipients found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>


      {/* Reject Modal */}
      {rejectOpen && (
       <div className="fixed inset-0 z-[9999] ... bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-slate-950 border border-white/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg">Reject Recipient #{rejectId ?? "-"}</h3>
              <Button
                variant="outline"
                className="bg-transparent border-white/20 text-white"
                onClick={() => {
                  if (mutatingId) return;
                  setRejectOpen(false);
                  setRejectId(null);
                  setRejectNotes("");
                }}
              >
                Close
              </Button>
            </div>

            <p className="text-blue-300 text-sm mt-2">Write notes (required) for rejection.</p>

            <div className="mt-3">
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder='e.g. "Invalid proof"'
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-300 min-h-[110px]"
                disabled={mutatingId === rejectId}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                className="bg-transparent border-white/20 text-white"
                onClick={() => {
                  if (mutatingId) return;
                  setRejectOpen(false);
                  setRejectId(null);
                  setRejectNotes("");
                }}
                disabled={mutatingId === rejectId}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmReject}
                className="bg-red-500/20 border-red-400/50 text-red-200 hover:bg-red-500/30"
                disabled={mutatingId === rejectId}
              >
                {mutatingId === rejectId ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

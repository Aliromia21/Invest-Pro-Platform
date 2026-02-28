import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  MessageRecipient,
  VerificationStatus,
  UserResponse,
  approveMessageRecipient,
  extractRecipientFromApprove,
  extractRecipientFromReject,
  listMessageRecipients,
  rejectMessageRecipient,
  
} from "../../../api/admin/messageRecipients";

import { RejectRecipientDialog } from "./RejectRecipientDialog";
import { RecipientDetailsDialog } from "./RecipientDetailsDialog";
import { CreateMessageDialog } from "./CreateMessageDialog";

function fmtDate(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function truncate(s: string, n = 40) {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n) + "…";
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

export function MessageRecipientsTab() {
  const [loading, setLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<number | null>(null);

  const [items, setItems] = useState<MessageRecipient[]>([]);

  // Filters
  const [vStatus, setVStatus] = useState<VerificationStatus | "all">("pending");
  const [uResp, setUResp] = useState<UserResponse | "all">("all");
  const [q, setQ] = useState("");

  // Dialogs
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRecipient, setDetailsRecipient] = useState<MessageRecipient | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectRecipientId, setRejectRecipientId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMessageRecipients();
      setItems(res.data ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load message recipients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((r) => {
      if (vStatus !== "all" && r.verification_status !== vStatus) return false;
      if (uResp !== "all" && r.user_response !== uResp) return false;

      if (!qq) return true;

      const hay = [
        String(r.id),
        String(r.user_id),
        r.message?.subject ?? "",
        r.message?.body ?? "",
        r.submitted_link ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(qq);
    });
  }, [items, vStatus, uResp, q]);

  function openDetails(r: MessageRecipient) {
    setDetailsRecipient(r);
    setDetailsOpen(true);
  }

  function openReject(r: MessageRecipient) {
    setRejectRecipientId(r.id);
    setRejectOpen(true);
  }

  function updateOne(updated: MessageRecipient) {
    setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  const handleApprove = useCallback(
    async (r: MessageRecipient) => {
      if (mutatingId) return;
      setMutatingId(r.id);
      try {
        const res = await approveMessageRecipient(r.id);
        const { paid, recipient } = extractRecipientFromApprove(res);

        updateOne(recipient);
        toast.success(`Approved — paid ${paid}`);

        // Keep details dialog in sync if open
        setDetailsRecipient((cur) => (cur?.id === recipient.id ? recipient : cur));

        // Optional safety refetch
        await refetch();
      } catch (e: any) {
        toast.error(e?.message ?? "Approve failed.");
      } finally {
        setMutatingId(null);
      }
    },
    [mutatingId, refetch]
  );

  const handleRejectConfirm = useCallback(
    async (notes: string) => {
      if (!rejectRecipientId) return;
      if (mutatingId) return;

      setMutatingId(rejectRecipientId);
      try {
        const res = await rejectMessageRecipient(rejectRecipientId, notes);
        const recipient = extractRecipientFromReject(res);

        updateOne(recipient);
        toast.success("Rejected");

        setDetailsRecipient((cur) => (cur?.id === recipient.id ? recipient : cur));
        setRejectOpen(false);
        setRejectRecipientId(null);

        await refetch();
      } catch (e: any) {
        toast.error(e?.message ?? "Reject failed.");
      } finally {
        setMutatingId(null);
      }
    },
    [rejectRecipientId, mutatingId, refetch]
  );

  return (
    <div className="space-y-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-white mb-1">Message Recipients</h2>
          <p className="text-blue-200 text-sm">
            Review submissions and approve/reject rewards.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-4 py-2 text-sm"
          >
            + Create Message
          </button>

          <button
            className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm"
            onClick={refetch}
          >
            Refresh
          </button>
        </div>
      </div>

</div>


      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
  <div className="flex flex-wrap items-center gap-3">
    <div className="min-w-[200px]">
      <label className="text-blue-200 text-sm block mb-2">Verification</label>
      <select
         className="w-full bg-slate-800 text-white border border-white/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={vStatus}
        onChange={(e) => setVStatus(e.target.value as any)}
        disabled={loading}
      >
        <option className="bg-slate-900 text-white" value="pending">pending</option>
        <option className="bg-slate-900 text-white" value="approved">approved</option>
        <option className="bg-slate-900 text-white" value="rejected">rejected</option>
        <option className="bg-slate-900 text-white" value="all">all</option>
      </select>
    </div>

    <div className="min-w-[200px]">
      <label className="text-blue-200 text-sm block mb-2">User response</label>
      <select
        className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm"
        value={uResp}
        onChange={(e) => setUResp(e.target.value as any)}
        disabled={loading}
      >
        <option className="bg-slate-900 text-white" value="all">all</option>
        <option className="bg-slate-900 text-white"   value="pending">pending</option>
        <option className="bg-slate-900 text-white" value="accepted">accepted</option>
        <option className="bg-slate-900 text-white" value="declined">declined</option>
      </select>
    </div>

    <div className="flex-1 min-w-[240px]">
      <label className="text-blue-200 text-sm block mb-2">Search</label>
      <input
        className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm outline-none placeholder:text-blue-300"
        placeholder="recipient id, user id, subject, link…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={loading}
      />
    </div>

    <div className="ml-auto text-blue-200 text-sm mt-6">
      Showing <b className="text-white">{filtered.length}</b> / {items.length}
    </div>
  </div>
</div>


      {/* Table */}
{/* Table */}
<div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden text-white">
  <div className="overflow-x-auto">
    <table className="w-full table-fixed text-white">
      <thead className="bg-white/5">
        <tr>
          <th className="px-6 py-4 text-left text-blue-200 text-xs w-[90px]">ID</th>
          <th className="px-6 py-4 text-left text-blue-200 text-xs w-[260px]">Message</th>
          <th className="px-6 py-4 text-left text-blue-200 text-xs w-[120px]">User</th>
          <th className="px-6 py-4 text-left text-blue-200 text-xs w-[140px]">User response</th>
          <th className="px-6 py-4 text-left text-blue-200 text-xs w-[140px]">Verification</th>
          <th className="px-6 py-4 text-left text-blue-200 text-xs w-[260px]">Submitted link</th>
          <th className="px-6 py-4 text-right text-blue-200 text-xs w-[120px]">Reward</th>
          <th className="px-6 py-4 text-left text-blue-200 text-xs w-[240px]"></th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr className="border-t border-white/10">
            <td className="px-6 py-10 text-center text-blue-200" colSpan={8}>
              Loading…
            </td>
          </tr>
        ) : filtered.length === 0 ? (
          <tr className="border-t border-white/10">
            <td className="px-6 py-10 text-center text-blue-200" colSpan={8}>
              No recipients found.
            </td>
          </tr>
        ) : (
          filtered.map((r) => {
            const busy = mutatingId === r.id;
            const isPending = r.verification_status === "pending";

            return (
              <tr
                key={r.id}
                className="border-t border-white/10 hover:bg-white/5 transition-colors"
              >
                {/* ID */}
                <td className="px-6 py-4 text-white text-sm font-mono">#{r.id}</td>

                {/* Message */}
                <td className="px-6 py-4">
                  <div className="text-white text-sm font-semibold truncate" title={r.message?.subject ?? ""}>
                    {truncate(r.message?.subject ?? "—", 40)}
                  </div>
                  <div className="text-blue-200 text-xs">
                    {fmtDate(r.message?.created_at ?? null)}
                  </div>
                </td>

                {/* User */}
                <td className="px-6 py-4">
                  <Badge>#{r.user_id}</Badge>
                </td>

                {/* User response */}
                <td className="px-6 py-4">
                  <Badge>{r.user_response}</Badge>
                </td>

                {/* Verification */}
                <td className="px-6 py-4">
                  <Badge>{r.verification_status}</Badge>
                </td>

                {/* Submitted link */}
                <td className="px-6 py-4">
                  <div className="max-w-[260px] text-blue-100 text-xs break-all">
                    {truncate(r.submitted_link ?? "—", 60)}
                  </div>

                  {r.submitted_link ? (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs text-blue-200 underline hover:text-white"
                        onClick={() => navigator.clipboard.writeText(r.submitted_link || "")}
                        disabled={busy}
                      >
                        Copy
                      </button>

                      {(() => {
                        try {
                          new URL(r.submitted_link);
                          return (
                            <a
                              href={r.submitted_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-200 underline hover:text-white"
                            >
                              Open
                            </a>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  ) : null}
                </td>

                {/* Reward */}
                <td className="px-6 py-4 text-right text-white text-sm font-semibold">
                  {r.message?.reward ?? "—"}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-2 text-xs border border-white/20 disabled:opacity-50"
                      onClick={() => openDetails(r)}
                      disabled={busy}
                    >
                      View
                    </button>

                    <button
                      type="button"
                      className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-3 py-2 text-xs disabled:opacity-50"
                      onClick={() => handleApprove(r)}
                      disabled={!isPending || busy}
                      title={!isPending ? "Already reviewed" : "Approve recipient"}
                    >
                      {busy ? "Approving..." : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-3 py-2 text-xs disabled:opacity-50"
                      onClick={() => openReject(r)}
                      disabled={!isPending || busy}
                      title={!isPending ? "Already reviewed" : "Reject recipient"}
                    >
                      {busy ? "Working..." : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
</div>

<RecipientDetailsDialog
  open={detailsOpen}
  onOpenChange={setDetailsOpen}
  recipient={detailsRecipient}
/>

<RejectRecipientDialog
  open={rejectOpen}
  onOpenChange={(o) => {
    setRejectOpen(o);
    if (!o) setRejectRecipientId(null);
  }}
  recipientId={rejectRecipientId}
  onConfirm={handleRejectConfirm}
  busy={rejectRecipientId != null && mutatingId === rejectRecipientId}
/>

<CreateMessageDialog
  open={createOpen}
  onOpenChange={setCreateOpen}
  onCreated={refetch}
/>


</div>
  );
}

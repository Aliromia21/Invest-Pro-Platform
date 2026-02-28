import React from "react";
import type { MessageRecipient } from "../../../api/admin/messageRecipients";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: MessageRecipient | null;
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function RecipientDetailsDialog({ open, onOpenChange, recipient }: Props) {
  if (!open || !recipient) return null;

  const msg = recipient.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 p-6 border border-white/20 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              Recipient #{recipient.id} — User #{recipient.user_id}
            </h3>
            <p className="text-sm text-blue-300">
              Verification: <b>{recipient.verification_status}</b> · User response:{" "}
              <b>{recipient.user_response}</b>
            </p>
          </div>

          <button
            className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {/* Message */}
          <div className="rounded-2xl border border-white/20 p-3">
            <div className="text-sm text-blue-300">Message</div>
            <div className="mt-1 text-base font-semibold">{msg.subject}</div>
            <div className="mt-2 whitespace-pre-wrap text-sm">{msg.body}</div>

            <div className="mt-3 text-sm">
              <span className="text-blue-300">Reward: </span>
              <b>{msg.reward}</b>
            </div>

            <div className="mt-1 text-sm">
              <span className="text-blue-300">Created: </span>
              <b>{fmtDate(msg.created_at)}</b>
            </div>
          </div>

          {/* Recipient details */}
          <div className="rounded-2xl border border-white/20 p-3">
            <div className="text-sm text-blue-300">Recipient details</div>

            <div className="mt-2 text-sm">
              <span className="text-blue-300">Submitted link: </span>
              <div className="mt-1 break-all rounded-xl bg-white/5 p-2 text-xs">
                {recipient.submitted_link || "-"}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-white/5 p-2">
                <div className="text-xs text-blue-300">Reward given</div>
                <div className="font-semibold">
                  {recipient.reward_given ? "Yes" : "No"}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-2">
                <div className="text-xs text-blue-300">Reviewed at</div>
                <div className="font-semibold">
                  {fmtDate(recipient.reviewed_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

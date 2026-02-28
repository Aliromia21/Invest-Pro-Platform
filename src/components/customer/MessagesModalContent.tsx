import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { listCustomerMessages, submitMessageLink } from "@/api/customer/messages";

type VerificationStatus = "pending" | "approved" | "rejected";
type UserResponse = "pending" | "accepted" | "declined";

type CustomerMessage = {
  id: number;
  subject: string;
  body: string;
  reward: string;
  submitted_link: string | null;
  verification_status: VerificationStatus;
  user_response: UserResponse;
  reject_notes?: string | null;
  created_at: string;
};

export function MessagesModalContent() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CustomerMessage[]>([]);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [linkDraft, setLinkDraft] = useState<Record<number, string>>({});

  const navigate = useNavigate();

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await listCustomerMessages();

      const normalized =
        Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray((res as any)?.data?.data)
          ? (res as any).data.data
          : Array.isArray((res as any)?.data?.results)
          ? (res as any).data.results
          : [];

      setItems(normalized);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load messages.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function handleSubmitLink(id: number) {
    const link = (linkDraft[id] ?? "").trim();

    if (!link) {
      toast.error("Please enter a link.");
      return;
    }

    setSubmittingId(id);
    try {
      await submitMessageLink(id, link);
      toast.success("Link submitted successfully.");

      setLinkDraft((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      await fetchMessages();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to submit link.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Messages & Tasks</h2>
          <p className="text-blue-200 text-sm">
            Complete tasks and submit required links to earn rewards.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-200 underline"
          type="button"
        >
          Back
        </button>
      </div>

      {/* List */}
      <div
        className="space-y-4 overflow-y-auto pr-1"
        style={{ maxHeight: "45vh" }}
      >
        {loading ? (
          <div className="text-blue-200">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-blue-200">No messages available.</div>
        ) : (
          items.map((m) => {
            const isAccepted =
              String(m.user_response || "").toLowerCase() === "accepted";

            const existingLink = (m.submitted_link ?? "").trim();
            const draftLink = (linkDraft[m.id] ?? "").trim();

            const hasLink = !!(existingLink || draftLink);
            const canSubmit = isAccepted && !existingLink; 
            const busy = submittingId === m.id;

            return (
              <div
                key={m.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{m.subject}</h3>
                  <span className="text-sm text-blue-200">
                    Reward: <b className="text-white">{m.reward} USDT</b>
                  </span>
                </div>

                {/* Body */}
                <p className="text-blue-100 text-sm whitespace-pre-wrap mb-4">
                  {m.body}
                </p>

                {/* Status */}
                <div className="flex flex-wrap gap-3 text-sm mb-4">
                  <span>
                    Verification:{" "}
                    <b className="text-white">{m.verification_status}</b>
                  </span>
                  <span>
                    Your response:{" "}
                    <b className="text-white">{m.user_response}</b>
                  </span>
                </div>

                {/* Reject Reason */}
                {m.verification_status === "rejected" && m.reject_notes && (
                  <div className="mb-4 rounded-lg bg-red-500/10 border border-red-400/30 p-3 text-red-300 text-sm">
                    Rejection reason: {m.reject_notes}
                  </div>
                )}

                {/* Submit link */}
                <div className="mt-4">
                  <label className="block text-blue-200 text-sm mb-2">
                    Submitted link
                  </label>

                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-50"
                    placeholder={
                      !isAccepted
                        ? "Accept task first to enable submitting..."
                        : existingLink
                        ? "Link already submitted"
                        : "Paste your link here..."
                    }
                    value={linkDraft[m.id] ?? m.submitted_link ?? ""}
                    onChange={(e) =>
                      setLinkDraft((prev) => ({
                        ...prev,
                        [m.id]: e.target.value,
                      }))
                    }
                    disabled={!isAccepted || busy || !!existingLink}
                  />

                  <div className="mt-6 flex items-center gap-3">
                    {canSubmit ? (
                      <button
                        type="button"
                        onClick={() => handleSubmitLink(m.id)}
                        disabled={busy || !draftLink}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                      >
                        {busy ? "Submitting..." : "Submit link"}
                      </button>
                    ) : (
                      <span className="text-blue-300 text-sm">
                        {!isAccepted
                          ? "You must accept this task first."
                          : existingLink
                          ? "Link already submitted."
                          : hasLink
                          ? "Ready to submit."
                          : "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

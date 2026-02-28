import React, { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: number | null;
  onConfirm: (notes: string) => Promise<void>;
  busy?: boolean;
};

export function RejectRecipientDialog({
  open,
  onOpenChange,
  recipientId,
  onConfirm,
  busy = false,
}: Props) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) setNotes("");
  }, [open]);

  const canSubmit = useMemo(() => {
    return !!recipientId && notes.trim().length >= 3 && !busy;
  }, [recipientId, notes, busy]);

  async function handleSubmit() {
    if (!recipientId) return;
    if (notes.trim().length < 3) {
      toast.error("Please provide rejection notes (min 3 chars).");
      return;
    }
    await onConfirm(notes.trim());
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow">
        <div className="mb-2">
          <h3 className="text-lg font-semibold">Reject recipient #{recipientId ?? "-"}</h3>
          <p className="text-sm text-gray-600">Add notes explaining why it was rejected.</p>
        </div>

        <textarea
          className="mt-2 w-full rounded-xl border p-3 text-sm outline-none"
          rows={5}
          placeholder='e.g. "Invalid proof"'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={busy}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-xl border px-4 py-2 text-sm"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {busy ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

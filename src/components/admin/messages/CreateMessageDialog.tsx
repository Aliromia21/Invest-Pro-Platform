import { useState } from "react";
import { toast } from "sonner";
import { createAdminMessage } from "@/api/admin/messages";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
};

export function CreateMessageDialog({ open, onOpenChange, onCreated }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reward, setReward] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!subject || !body || !reward) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await createAdminMessage({
        subject,
        body,
        reward,
      });

      toast.success("Message created & sent.");

      setSubject("");
      setBody("");
      setReward("");
      onOpenChange(false);
      onCreated();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create message.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-xl p-6 space-y-4 text-white">

        <h2 className="text-lg font-semibold">Create Message Task</h2>

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
        />

        <textarea
          placeholder="Message body..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm h-28"
        />

        <input
          placeholder="Reward (USDT)"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm border border-white/20 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

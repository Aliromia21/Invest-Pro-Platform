import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createWithdrawalRequest } from "@/api/customerWithdrawals";

function toNumber(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function isLikelyTronAddress(v: string) {
  const s = (v ?? "").trim();
  return /^T[a-zA-Z0-9]{25,40}$/.test(s);
}

export function WithdrawFundsDialog({
  open,
  onOpenChange,
  balance,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  balance: number;
  onCreated: () => Promise<void> | void; 
}) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amountNum = useMemo(() => toNumber(amount, 0), [amount]);

  const canSubmit =
    amountNum > 0 &&
    amountNum <= balance &&
    isLikelyTronAddress(address) &&
    !submitting;

  const submit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await createWithdrawalRequest({
        amount: amountNum.toFixed(2),
        payout_address: address.trim(),
        notes: notes.trim(),
      });

      toast.success("Withdrawal request submitted (Pending).");
      onOpenChange(false);

      setAmount("");
      setAddress("");
      setNotes("");

      await onCreated();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.detail ||
        "Failed to create withdrawal request";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 text-white border-white/20">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-blue-200">Amount (USDT)</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50"
              className="bg-white/10 border-white/20 text-white mt-2"
              inputMode="decimal"
            />
            <p className="text-blue-300 text-xs mt-1">
              Available: {balance.toFixed(2)} USDT
            </p>
            {amountNum > balance && (
              <p className="text-red-400 text-xs mt-1">Insufficient balance.</p>
            )}
          </div>

          <div>
            <Label className="text-blue-200">Payout Address (TRC20)</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your TRON USDT address"
              className="bg-white/10 border-white/20 text-white mt-2 font-mono"
            />
            {address.trim() && !isLikelyTronAddress(address) && (
              <p className="text-red-400 text-xs mt-1">
                Address format looks invalid.
              </p>
            )}
          </div>

          <div>
            <Label className="text-blue-200">Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any note for admin"
              className="bg-white/10 border-white/20 text-white mt-2"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-blue-200 text-xs">
              Your request will appear as <span className="text-white">Pending</span> until reviewed by an admin.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="bg-transparent border-white/20"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={submit}
            disabled={!canSubmit}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

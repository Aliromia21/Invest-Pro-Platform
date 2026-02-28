import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, UserCheck, UserX, Wallet } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

import type { AdminUser } from "@/api/admin/users";
import {
  adjustAdminUserBalance,
  setAdminUserActive,
  setAdminUserKycVerified,
} from "@/api/admin/users";

function toNumber(v: any, fallback = NaN) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

export function AdminUserActionsPanel({
  user,
  onChanged,
}: {
  user: AdminUser;
  onChanged: (next: AdminUser) => void;
}) {
  const [busy, setBusy] = useState(false);

  // Balance dialog
  const [balOpen, setBalOpen] = useState(false);
  const [balAmount, setBalAmount] = useState(""); 
  const [balNotes, setBalNotes] = useState("");

  const currentBalance = useMemo(() => toNumber(user.balance, 0), [user.balance]);

  const toggleActive = async () => {
    setBusy(true);
    try {
      const next = await setAdminUserActive(user.id, !user.is_active);
      onChanged(next);
      toast.success(user.is_active ? "User deactivated" : "User activated");
    } catch (err: any) {
      toast.error(String(err?.message || "Failed"));
    } finally {
      setBusy(false);
    }
  };

  const toggleKyc = async () => {
    setBusy(true);
    try {
      const next = await setAdminUserKycVerified(user.id, !user.is_kyc_verified);
      onChanged(next);
      toast.success(user.is_kyc_verified ? "KYC unverified" : "KYC verified");
    } catch (err: any) {
      toast.error(String(err?.message || "Failed"));
    } finally {
      setBusy(false);
    }
  };

  const submitBalanceAdjust = async () => {
    const amt = toNumber(balAmount, NaN);
    const reason = balNotes.trim();

    if (!Number.isFinite(amt) || amt === 0) {
      toast.error("Enter a valid amount (e.g. 50 or -20)");
      return;
    }
    if (!reason) {
      toast.error("Please add notes/reason for auditing");
      return;
    }

    setBusy(true);
    try {
      const direction = amt > 0 ? "credit" : "debit";
      const absAmount = Math.abs(amt);

      const result = await adjustAdminUserBalance(user.id, {
        amount: absAmount.toFixed(2),
        direction,
        tx_type: "DEPOSIT", 
        reference: "ADMIN_ADJUST:MANUAL",
        metadata: { reason },
      });

      onChanged(result.user);

      const newBal = toNumber(result.new_balance, toNumber(result.user.balance, currentBalance));
      toast.success("Balance updated", {
        description: `New balance: ${newBal.toFixed(2)} USDT`,
      });

      setBalOpen(false);
      setBalAmount("");
      setBalNotes("");
    } catch (err: any) {
      toast.error(String(err?.message || "Failed to adjust balance"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white">Actions</h4>
        <p className="text-blue-200 text-sm">
          Balance:{" "}
          <span className="text-green-300">{currentBalance.toFixed(2)} USDT</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button
          onClick={toggleActive}
          disabled={busy}
          className={
            user.is_active
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }
        >
          {user.is_active ? (
            <>
              <UserX className="w-4 h-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Activate
            </>
          )}
        </Button>

        <Button
          onClick={toggleKyc}
          disabled={busy}
          className={
            user.is_kyc_verified
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-blue-500 hover:bg-blue-600"
          }
        >
          {user.is_kyc_verified ? (
            <>
              <ShieldX className="w-4 h-4 mr-2" />
              Unverify KYC
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Verify KYC
            </>
          )}
        </Button>

        <Button
          onClick={() => setBalOpen(true)}
          disabled={busy}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Adjust Balance
        </Button>
      </div>

      {/* Adjust Balance Dialog */}
      <Dialog open={balOpen} onOpenChange={(v) => !busy && setBalOpen(v)}>
        <DialogContent className="bg-slate-900 text-white border-white/20 max-w-lg">
          <DialogHeader>
            <DialogTitle>Adjust Balance</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm block mb-2">
                Amount (use negative for deduction)
              </label>
              <Input
                value={balAmount}
                onChange={(e) => setBalAmount(e.target.value)}
                placeholder="e.g. 50 or -20"
                className="bg-white/10 border-white/20 text-white"
                disabled={busy}
              />
              <p className="text-blue-300 text-xs mt-1">
                Current balance: {currentBalance.toFixed(2)} USDT
              </p>
            </div>

            <div>
              <label className="text-blue-200 text-sm block mb-2">
                Notes / Reason (required)
              </label>
              <Input
                value={balNotes}
                onChange={(e) => setBalNotes(e.target.value)}
                placeholder="e.g. Manual correction / Promo / Fraud reversal..."
                className="bg-white/10 border-white/20 text-white"
                disabled={busy}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setBalOpen(false)}
              className="bg-transparent border-white/20"
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              onClick={submitBalanceAdjust}
              disabled={busy}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {busy ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

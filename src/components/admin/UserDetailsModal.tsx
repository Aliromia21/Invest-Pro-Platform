import { useState } from "react";
import { Shield, UserCheck, UserX, DollarSign, Power } from "lucide-react";
import { toast } from "sonner";

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
  toggleAdminUserActive,
  toggleAdminUserKyc,
  adjustAdminUserBalance,
} from "@/api/admin/users";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: AdminUser | null;
  onUpdated: () => Promise<void> | void;
}

export function UserDetailsModal({ open, onOpenChange, user, onUpdated }: Props) {
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleToggleActive = async () => {
    setSubmitting(true);
    try {
      await toggleAdminUserActive(user.id, !user.is_active);
      toast.success(`User ${!user.is_active ? "activated" : "deactivated"}`);
      await onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Failed to update user status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleKyc = async () => {
    setSubmitting(true);
    try {
      await toggleAdminUserKyc(user.id, !user.is_kyc_verified);
      toast.success(`KYC ${!user.is_kyc_verified ? "verified" : "unverified"}`);
      await onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Failed to update KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustBalance = async () => {
    const amountNum = Number(adjustAmount);

    if (!Number.isFinite(amountNum) || amountNum === 0) {
      toast.error("Enter a valid amount (+ or -)");
      return;
    }

    setSubmitting(true);
    try {
      await adjustAdminUserBalance(user.id, {
        amount: amountNum,
        reason: adjustReason.trim() || undefined,
      });

      toast.success("Balance adjusted successfully");
      setAdjustAmount("");
      setAdjustReason("");
      await onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Failed to adjust balance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent className="bg-slate-900 text-white border-white/20 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            User Details — #{user.id}
          </DialogTitle>
        </DialogHeader>

        {/* User Info */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Email" value={user.email} />
            <Info label="Username" value={user.username} />
            <Info label="Full Name" value={user.full_name || "—"} />
            <Info label="Phone" value={user.phone || "—"} />
            <Info label="Country" value={user.country || "—"} />
            <Info label="Referral Code" value={user.referral_code} />
            <Info label="Referrals" value={String(user.referral_counter)} />
            <Info label="Balance" value={`${Number(user.balance).toFixed(2)} USDT`} />
            <Info label="KYC" value={user.is_kyc_verified ? "Verified" : "Not verified"} />
            <Info label="Active" value={user.is_active ? "Active" : "Inactive"} />
            <Info
              label="Role"
              value={user.is_superuser || user.is_staff ? "Admin" : "User"}
            />
            <Info label="Created At" value={new Date(user.created_at).toLocaleString()} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleToggleActive}
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Power className="w-4 h-4 mr-2" />
            {user.is_active ? "Deactivate User" : "Activate User"}
          </Button>

          <Button
            onClick={handleToggleKyc}
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {user.is_kyc_verified ? (
              <>
                <UserX className="w-4 h-4 mr-2" />
                Unverify KYC
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Verify KYC
              </>
            )}
          </Button>
        </div>

        {/* Adjust Balance */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4">
          <h3 className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Adjust Balance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-blue-200 text-sm mb-1 block">
                Amount (+ or -)
              </label>
              <Input
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 100 or -50"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-blue-200 text-sm mb-1 block">
                Reason (optional)
              </label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Admin adjustment / correction / bonus..."
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleAdjustBalance}
            disabled={submitting}
            className="bg-green-500 hover:bg-green-600"
          >
            Apply Balance Adjustment
          </Button>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-white/20"
            disabled={submitting}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-blue-200 text-xs mb-1">{label}</p>
      <p className="text-white break-all">{value}</p>
    </div>
  );
}

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import type { AdminWallet } from "@/api/admin/wallet";
import { upsertAdminWalletSmart } from "@/api/admin/wallet";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function safeTrim(s: string) {
  return (s ?? "").trim();
}

export function AdminWallet() {
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<AdminWallet | null>(null);

  const [form, setForm] = useState({
    address: "",
    network: "USDT-TRC20",
  });

  const canSave = useMemo(() => {
    return !!safeTrim(form.address) && !!safeTrim(form.network);
  }, [form.address, form.network]);

  const onSave = async () => {
    const payload = {
      address: safeTrim(form.address),
      network: safeTrim(form.network) || "USDT-TRC20",
    };

    if (!payload.address) {
      toast.error("Address is required");
      return;
    }

    try {
      setSaving(true);
      const updated = await upsertAdminWalletSmart(payload);
      setCurrent(updated);
      setForm({ address: updated.address, network: updated.network });
      toast.success("Wallet saved");
    } catch (err: any) {
      toast.error(String(err?.message || "Failed to save wallet"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div>
          <h2 className="text-white mb-1">Deposit Wallet</h2>
          <p className="text-blue-200 text-sm">
            Configure the customer deposit address.
            {current?.updated_at ? ` • Updated: ${formatDate(current.updated_at)}` : ""}
          </p>
        </div>

        {current?.address && (
          <div className="mt-4 bg-black/20 border border-white/10 rounded-xl p-4">
            <p className="text-blue-200 text-xs mb-1">Current Address</p>
            <p className="text-white text-sm break-all">{current.address}</p>
            <p className="text-blue-200 text-xs mt-2">
              Network: <span className="text-white">{current.network}</span>
            </p>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4">
        <div>
          <p className="text-blue-200 text-xs mb-1">Network</p>
          <Input
            value={form.network}
            onChange={(e) => setForm((p) => ({ ...p, network: e.target.value }))}
            placeholder="USDT-TRC20"
            className="bg-white/10 border-white/20 text-white"
          />
        </div>

        <div>
          <p className="text-blue-200 text-xs mb-1">Address</p>
          <Input
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="TNewTRC20WalletAddressExample"
            className="bg-white/10 border-white/20 text-white"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onSave}
            disabled={saving || !canSave}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

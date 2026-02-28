import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

import type { AdminPack, AdminPackUpsertPayload } from "@/api/admin/packs";
import {
  fetchAdminPacks,
  fetchAdminPack,
  createAdminPack,
  updateAdminPack,
  toggleAdminPackActive,
  deleteAdminPack,
} from "@/api/admin/packs";

type Pack = AdminPack;

type FormState = {
  name: string;
  is_active: boolean;
  min_amount: string;
  max_amount: string;
  duration_days: string;
  roi_percent: string;
  payout_type: "daily" | "end";
};

function safeNumberString(v: any, fallback = "0") {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? String(n) : fallback;
}

function roiToPercentText(roiPercent: string) {
  const n = parseFloat(roiPercent || "0");
  if (!Number.isFinite(n)) return "0%";
  const pct = n <= 1 ? n * 100 : n;
  return `${pct.toFixed(2)}%`;
}

function defaultForm(): FormState {
  return {
    name: "",
    is_active: true,
    min_amount: "50.00",
    max_amount: "500.00",
    duration_days: "60",
    roi_percent: "0.08",
    payout_type: "daily",
  };
}

export function AdminPacks() {
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pack | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());

  const resetForm = useCallback(() => {
    setForm(defaultForm());
    setEditing(null);
  }, []);

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = async (p: Pack) => {
    setEditing(p);
    setDialogOpen(true);

    setForm({
      name: p.name ?? "",
      is_active: Boolean(p.is_active),
      min_amount: String(p.min_amount ?? "0.00"),
      max_amount: String(p.max_amount ?? "0.00"),
      duration_days: String(p.duration_days ?? 0),
      roi_percent: String(p.roi_percent ?? "0"),
      payout_type: (String(p.payout_type).toLowerCase() === "end" ? "end" : "daily") as
        | "daily"
        | "end",
    });

    try {
      const detail = await fetchAdminPack(p.id);
      setForm((prev) => ({
        name: String(detail.name ?? prev.name),
        is_active: Boolean(detail.is_active ?? prev.is_active),
        min_amount: String(detail.min_amount ?? prev.min_amount),
        max_amount: String(detail.max_amount ?? prev.max_amount),
        duration_days: String(detail.duration_days ?? prev.duration_days),
        roi_percent: String(detail.roi_percent ?? prev.roi_percent),
        payout_type: (String(detail.payout_type ?? prev.payout_type).toLowerCase() === "end" ? "end" : "daily") as
          | "daily"
          | "end",
      }));
    } catch {
     
    }
  };

  const fetchPacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchAdminPacks();
      setPacks(Array.isArray(list) ? list : []);
    } catch (e: any) {
      const msg = e?.message || "Failed to load packs";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const sorted = useMemo(() => {
    return packs
      .slice()
      .sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.id - b.id);
  }, [packs]);

  const validateForm = () => {
    const name = form.name.trim();
    if (!name) return "Pack name is required";

    const min = parseFloat(form.min_amount);
    const max = parseFloat(form.max_amount);
    const days = parseInt(form.duration_days, 10);
    const roi = parseFloat(form.roi_percent);

    if (!Number.isFinite(min) || min <= 0) return "Min amount must be a valid number";
    if (!Number.isFinite(max) || max <= 0) return "Max amount must be a valid number";
    if (max < min) return "Max amount must be >= min amount";

    if (!Number.isFinite(days) || days <= 0) return "Duration days must be a valid integer";
    if (!Number.isFinite(roi) || roi <= 0) return "ROI must be a valid number (e.g. 0.08 or 12.00)";
    if (form.payout_type !== "daily" && form.payout_type !== "end") return "Invalid payout type";

    return null;
  };

  const submit = async () => {
    const v = validateForm();
    if (v) {
      toast.error(v);
      return;
    }

    setMutating(true);
    try {
      const payload: AdminPackUpsertPayload = {
        name: form.name.trim(),
        is_active: form.is_active,
        min_amount: form.min_amount,
        max_amount: form.max_amount,
        duration_days: parseInt(form.duration_days, 10),
        roi_percent: form.roi_percent,
        payout_type: form.payout_type,
      };

      if (editing) {
        await updateAdminPack(editing.id, payload);
        toast.success("Pack updated");
      } else {
        await createAdminPack(payload);
        toast.success("Pack created");
      }

      setDialogOpen(false);
      resetForm();
      await fetchPacks();
    } catch (e: any) {
      toast.error(String(e?.message || "Request failed"));
    } finally {
      setMutating(false);
    }
  };

  const toggleActive = async (p: Pack) => {
    setMutating(true);
    try {
      await toggleAdminPackActive(p.id, !p.is_active);
      toast.success(`Pack ${!p.is_active ? "activated" : "disabled"}`);
      await fetchPacks();
    } catch (e: any) {
      toast.error(String(e?.message || "Failed to update"));
    } finally {
      setMutating(false);
    }
  };

  const remove = async (p: Pack) => {
    const ok = confirm(`Delete pack "${p.name}"?`);
    if (!ok) return;

    setMutating(true);
    try {
      await deleteAdminPack(p.id);
      toast.success("Pack deleted");
      await fetchPacks();
    } catch (e: any) {
      toast.error(String(e?.message || "Failed to delete"));
    } finally {
      setMutating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <p className="text-white">Loading packs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-3">
        <p className="text-white">Failed to load packs</p>
        <p className="text-blue-200 text-sm">{error}</p>
        <Button onClick={fetchPacks} className="bg-white/10 hover:bg-white/20 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white">Packs</h2>
          <p className="text-blue-200 text-sm">Create, edit, activate/deactivate investment packs</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={fetchPacks}
            variant="outline"
            className="bg-white/10 border-white/20 text-white"
            disabled={mutating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button
            onClick={openCreate}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={mutating}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Pack
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left text-blue-200 pb-3">Name</th>
              <th className="text-left text-blue-200 pb-3">Active</th>
              <th className="text-left text-blue-200 pb-3">Min</th>
              <th className="text-left text-blue-200 pb-3">Max</th>
              <th className="text-left text-blue-200 pb-3">Days</th>
              <th className="text-left text-blue-200 pb-3">ROI</th>
              <th className="text-left text-blue-200 pb-3">Payout</th>
              <th className="text-right text-blue-200 pb-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="border-b border-white/10 last:border-0">
                <td className="py-4 text-white">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-blue-300 text-xs">#{p.id}</div>
                </td>

                <td className="py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs ${
                      p.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {p.is_active ? "Active" : "Disabled"}
                  </span>
                </td>

                <td className="py-4 text-white">{safeNumberString(p.min_amount, "0")}</td>
                <td className="py-4 text-white">{safeNumberString(p.max_amount, "0")}</td>
                <td className="py-4 text-white">{p.duration_days}</td>
                <td className="py-4 text-white">{roiToPercentText(p.roi_percent)}</td>
                <td className="py-4 text-white">{String(p.payout_type).toUpperCase()}</td>

                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="bg-white/5 border-white/20 text-white"
                      onClick={() => toggleActive(p)}
                      disabled={mutating}
                      title="Toggle active"
                    >
                      <Power className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="bg-white/5 border-white/20 text-white"
                      onClick={() => openEdit(p)}
                      disabled={mutating}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="bg-white/5 border-white/20 text-white"
                      onClick={() => remove(p)}
                      disabled={mutating}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-blue-200">
                  No packs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          if (mutating) return;
          setDialogOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="bg-slate-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Pack" : "Create Pack"}</DialogTitle>
            <DialogDescription className="text-blue-200">
              {editing ? "Update pack settings" : "Add a new investment pack"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-blue-200 mb-2 block">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                placeholder="Prime"
                disabled={mutating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-blue-200 mb-2 block">Min Amount</label>
                <input
                  value={form.min_amount}
                  onChange={(e) => setForm((s) => ({ ...s, min_amount: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                  placeholder="50.00"
                  disabled={mutating}
                />
              </div>

              <div>
                <label className="text-sm text-blue-200 mb-2 block">Max Amount</label>
                <input
                  value={form.max_amount}
                  onChange={(e) => setForm((s) => ({ ...s, max_amount: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                  placeholder="500.00"
                  disabled={mutating}
                />
              </div>

              <div>
                <label className="text-sm text-blue-200 mb-2 block">Duration (days)</label>
                <input
                  value={form.duration_days}
                  onChange={(e) => setForm((s) => ({ ...s, duration_days: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                  placeholder="60"
                  disabled={mutating}
                />
              </div>

              <div>
                <label className="text-sm text-blue-200 mb-2 block">ROI Percent (e.g. 0.08)</label>
                <input
                  value={form.roi_percent}
                  onChange={(e) => setForm((s) => ({ ...s, roi_percent: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                  placeholder="0.08"
                  disabled={mutating}
                />
                <p className="text-blue-300 text-xs mt-1">
                  Display: {roiToPercentText(form.roi_percent)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-blue-200 mb-2 block">Payout Type</label>
                <select
                  value={form.payout_type}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      payout_type: (e.target.value === "end" ? "end" : "daily") as "daily" | "end",
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                  disabled={mutating}
                >
                  <option value="daily">Daily</option>
                  <option value="end">End of term</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-blue-200 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
                    disabled={mutating}
                  />
                  Active
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-transparent border-white/20 text-white"
              disabled={mutating}
            >
              Cancel
            </Button>

            <Button
              onClick={submit}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={mutating}
            >
              {mutating ? "Saving..." : editing ? "Save Changes" : "Create Pack"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import type { AdminUser } from "@/api/admin/users";
import { fetchAdminUsers } from "@/api/admin/users";
import { UserDetailsModal } from "./UserDetailsModal";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function AdminUsers() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const list = await fetchAdminUsers();
      const normalized = Array.isArray(list) ? list : [];

      normalized.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(normalized);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to load users";
      setErrorMsg(String(msg));
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

        useEffect(() => {
        const onRefresh = () => {
            load();
        };

        window.addEventListener("admin-users-refresh", onRefresh);

        return () => {
            window.removeEventListener("admin-users-refresh", onRefresh);
        };
        
        }, []);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((u) => {
      if (!q) return true;

      return [
        u.id,
        u.email,
        u.username,
        u.full_name,
        u.phone,
        u.country,
        u.referral_code,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, query]);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <p className="text-white">Loading users...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4">
        <p className="text-white">Failed to load users</p>
        <p className="text-blue-200 text-sm">{errorMsg}</p>
        <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-white mb-1">Users</h2>
            <p className="text-blue-200 text-sm">
              Showing {filtered.length} of {items.length} users
            </p>
          </div>

          <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white">
            Refresh
          </Button>
        </div>

        <div className="mt-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, email, name, phone, referral code..."
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[90px]">ID</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs">Email</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[140px]">Name</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[120px]">Country</th>
                <th className="px-6 py-4 text-right text-blue-200 text-xs w-[130px]">Balance</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[100px]">KYC</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[100px]">Active</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[170px]">Created</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[110px]">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-white text-sm font-mono">
                    #{u.id}
                  </td>

                  <td className="px-6 py-4 text-white text-sm truncate" title={u.email}>
                    {u.email}
                  </td>

                  <td className="px-6 py-4 text-white text-sm truncate">
                    {u.full_name || "—"}
                  </td>

                  <td className="px-6 py-4 text-white text-sm">
                    {u.country || "—"}
                  </td>

                  <td className="px-6 py-4 text-right text-white text-sm">
                    {Number(u.balance).toFixed(2)} USDT
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {u.is_kyc_verified ? (
                      <span className="text-green-400">Verified</span>
                    ) : (
                      <span className="text-yellow-400">Pending</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {u.is_active ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-red-400">Inactive</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-blue-100 text-sm">
                    {formatDate(u.created_at)}
                  </td>

                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        setSelectedUser(u);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-blue-200">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        user={selectedUser}
        onUpdated={load}
      />
    </div>
  );
}

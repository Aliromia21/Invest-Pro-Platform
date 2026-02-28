import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { fetchAdminUsers } from "@/api/admin/users";
import type { AdminUser } from "@/api/admin/users";
import { AdminUserDetails } from "./AdminUserDetails";

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  // Details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const list = await fetchAdminUsers();
      setUsers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to load users";
      setErrorMsg(String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) =>
      [u.id, u.email, u.username, u.phone, u.country]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [users, query]);

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
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <h2 className="text-white mb-1">Users</h2>
            <p className="text-blue-200 text-sm">
              Showing {filtered.length} of {users.length} users
            </p>
          </div>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, email, username, phone, country..."
            className="bg-white/10 border-white/20 text-white w-full lg:max-w-md"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[90px]">ID</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs">Email</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[120px]">Country</th>
                <th className="px-6 py-4 text-right text-blue-200 text-xs w-[140px]">Balance</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[140px]">KYC</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[190px]">Created</th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[120px]">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-mono">#{u.id}</td>

                  <td className="px-6 py-4 text-white truncate max-w-[1px]" title={u.email}>
                    {u.email}
                  </td>

                  <td className="px-6 py-4 text-white">{u.country || "—"}</td>

                  <td className="px-6 py-4 text-right text-green-300">
                    {u.balance} USDT
                  </td>

                  <td className="px-6 py-4">
                    {u.is_kyc_verified ? (
                      <span className="text-green-400">Verified</span>
                    ) : (
                      <span className="text-yellow-300">Not Verified</span>
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
                        setSelectedUserId(u.id);
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
                  <td colSpan={7} className="px-6 py-10 text-center text-blue-200">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <AdminUserDetails
        open={detailsOpen}
        userId={selectedUserId}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}

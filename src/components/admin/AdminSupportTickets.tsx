import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, Search, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import type { AdminSupportTicket } from "@/api/admin/supportTickets";
import {
  fetchAdminSupportTickets,
  updateAdminSupportTicket,
} from "@/api/admin/supportTickets";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function contains(hay: any, q: string) {
  if (!q) return true;
  if (hay === null || hay === undefined) return false;
  return String(hay).toLowerCase().includes(q);
}

export function AdminSupportTickets() {
  const [items, setItems] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const list = await fetchAdminSupportTickets();
      const normalized = Array.isArray(list) ? list : [];

      normalized.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(normalized);
      setPage(1);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to load support tickets";
      setErrorMsg(String(msg));
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = useMemo(
    () => items.filter((t) => !t.is_read).length,
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((t) => {
      if (filter === "unread" && t.is_read) return false;
      if (!q) return true;

      return (
        contains(t.id, q) ||
        contains(t.user_id, q) ||
        contains(t.name, q) ||
        contains(t.email, q) ||
        contains(t.whatsapp, q) ||
        contains(t.telegram, q) ||
        contains(t.message, q)
      );
    });
  }, [items, query, filter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    [filtered.length]
  );

  const pageItems = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query, filter]);

  const toggleRead = async (ticket: AdminSupportTicket) => {
    try {
      setUpdatingId(ticket.id);
      const next = !ticket.is_read;

      const updated = await updateAdminSupportTicket(ticket.id, next);

      setItems((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x))
      );

      toast.success(next ? "Marked as read" : "Marked as unread");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to update ticket";
      toast.error(String(msg));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <p className="text-white">Loading support tickets...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4">
        <p className="text-white">Failed to load support tickets</p>
        <p className="text-blue-200 text-sm">{errorMsg}</p>
        <Button
          onClick={load}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
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
            <h2 className="text-white mb-1">Support Tickets</h2>
            <p className="text-blue-200 text-sm">
              Showing {filtered.length} of {items.length} • Unread: {unreadCount}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setFilter("all")}
              className={`bg-white/10 hover:bg-white/20 text-white ${
                filter === "all" ? "ring-1 ring-white/30" : ""
              }`}
            >
              All
            </Button>
            <Button
              onClick={() => setFilter("unread")}
              className={`bg-white/10 hover:bg-white/20 text-white ${
                filter === "unread" ? "ring-1 ring-white/30" : ""
              }`}
            >
              Unread
            </Button>

            <Button
              onClick={load}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-blue-200 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, user id, email, name, whatsapp, telegram, message..."
            className="bg-white/10 border-white/20 text-white pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[90px]">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[110px]">
                  User
                </th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[160px]">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[240px]">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs">
                  Message
                </th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[120px]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[170px]">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-blue-200 text-xs w-[170px]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {pageItems.map((t) => {
                const statusCls = t.is_read
                  ? "text-green-300 border-green-300/30 bg-green-300/10"
                  : "text-yellow-300 border-yellow-300/30 bg-yellow-300/10";

                const btnDisabled = updatingId === t.id;

                return (
                  <tr
                    key={t.id}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white text-sm font-mono">
                      #{t.id}
                    </td>

                    <td className="px-6 py-4 text-white text-sm font-mono">
                      #{t.user_id}
                    </td>

                    <td className="px-6 py-4 text-white text-sm truncate" title={t.name}>
                      {t.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-white text-sm truncate" title={t.email}>
                      {t.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-white text-sm truncate" title={t.message}>
                      {t.message || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${statusCls}`}
                      >
                        {t.is_read ? "Read" : "Unread"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-blue-100 text-sm">
                      {formatDate(t.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60"
                        disabled={btnDisabled}
                        onClick={() => toggleRead(t)}
                      >
                        {t.is_read ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Mark Unread
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark Read
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {pageItems.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-blue-200"
                  >
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <p className="text-blue-200 text-sm">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              className="bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              className="bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

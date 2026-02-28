import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllTransactions, type AdminTx } from "@/api/admin/transactions";

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function norm(s: unknown) {
  return String(s ?? "").toLowerCase().trim();
}

export function AdminUserTransactions({ userId }: { userId: number }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: fetchAllTransactions,
    staleTime: 15_000,
  });

  const { items, total, pages } = useMemo(() => {
    const all = (data ?? []).filter((t) => t.user_id === userId);

    const filtered = q
      ? all.filter((t) => {
          const hay = [
            t.id,
            t.tx_type,
            t.direction,
            t.amount,
            t.reference,
            t.created_at,
          ]
            .map(norm)
            .join(" ");
          return hay.includes(norm(q));
        })
      : all;

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, pages);
    const start = (safePage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, total, pages, safePage };
  }, [data, userId, q, page]);

 
  const onSearchChange = (v: string) => {
    setQ(v);
    setPage(1);
  };

  if (isLoading) return <div className="text-blue-200">Loading transactions…</div>;
  if (error) return <div className="text-red-400">Failed to load transactions</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <input
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by id, type, amount, reference..."
          className="w-full md:flex-1 bg-slate-950/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400/50"
        />
        <div className="text-xs text-blue-200">
          {total} tx
        </div>
      </div>

      <div className="overflow-x-auto border border-white/10 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-blue-100">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Dir</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Balance After</th>
              <th className="text-left p-2">Reference</th>
              <th className="text-left p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-blue-200">
                  No transactions for this user
                </td>
              </tr>
            ) : (
              items.map((t) => <TxRow key={t.id} t={t} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10"
        >
          Prev
        </button>

        <div className="text-xs text-blue-200">
          Page {page} / {pages}
        </div>

        <button
          disabled={page >= pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function TxRow({ t }: { t: AdminTx }) {
  const dir = norm(t.direction);
  const isCredit = dir === "credit";
  const isDebit = dir === "debit";

  return (
    <tr className="border-t border-white/10">
      <td className="p-2 font-mono text-blue-100">#{t.id}</td>
      <td className="p-2">{t.tx_type}</td>
      <td className="p-2">
        <span
          className={[
            "px-2 py-0.5 rounded-full text-xs border",
            isCredit ? "text-green-300 border-green-300/30 bg-green-500/10" : "",
            isDebit ? "text-red-300 border-red-300/30 bg-red-500/10" : "",
            !isCredit && !isDebit ? "text-blue-200 border-white/10 bg-white/5" : "",
          ].join(" ")}
        >
          {t.direction}
        </span>
      </td>
      <td className="p-2">{t.amount}</td>
      <td className="p-2">{t.balance_after}</td>
      <td className="p-2 font-mono break-all">{t.reference}</td>
      <td className="p-2 whitespace-nowrap">{formatDate(t.created_at)}</td>
    </tr>
  );
}

import { useEffect, useState } from "react";
import { fetchAdminUsers } from "@/api/admin/users";
import { fetchAdminWithdrawalRequests } from "@/api/admin/withdrawals";

export function AdminOverview() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const users = await fetchAdminUsers();
        setTotalUsers(users.length);
      } catch {
        setTotalUsers(0);
      }

      try {
        const withdrawals = await fetchAdminWithdrawalRequests();
        const pending = withdrawals.filter(
          (w) => String(w.status).toLowerCase() === "pending"
        );

        setPendingWithdrawals(pending.length);
        setPendingAmount(
          pending.reduce((sum, w) => sum + parseFloat(w.amount || "0"), 0)
        );
      } catch {
        setPendingWithdrawals(0);
        setPendingAmount(0);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Total Users</p>
          <p className="text-white text-3xl font-bold">{totalUsers}</p>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Pending Withdrawals</p>
          <p className="text-white text-3xl font-bold">{pendingWithdrawals}</p>
        </div>

        {/* Pending Amount */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Pending Amount</p>
          <p className="text-white text-3xl font-bold">
            {pendingAmount.toFixed(2)} USDT
          </p>
        </div>
      </div>
    </div>
  );
}

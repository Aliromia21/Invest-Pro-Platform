import { AdminUserTransactions } from "../AdminUserTransactions";

export function TransactionsCard({ userId }: { userId: number }) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <h4 className="text-white mb-3">User Transactions</h4>
      <div className="max-h-[360px] overflow-y-auto pr-1">
        <AdminUserTransactions userId={userId} />
      </div>
    </div>
  );
}

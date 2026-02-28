import type { AdminUser } from "@/api/admin/users";
import { AdminUserActionsPanel } from "./AdminUserActionsPanel";
import { BasicInfoCard } from "./sections/BasicInfoCard";
import { AccountCard } from "./sections/AccountCard";
import { PermissionsCard } from "./sections/PermissionsCard";
import { Suspense, lazy, useState } from "react";

const TransactionsCard = lazy(() =>
  import("./sections/TransactionsCard").then((m) => ({ default: m.TransactionsCard }))
);

type Tab = "overview" | "transactions" | "security";

export function AdminUserDetailsView({ user }: { user: AdminUser }) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="space-y-4">
      <AdminUserActionsPanel user={user} onChanged={() => {}} />

      
      <div className="flex gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>Overview</TabBtn>
        <TabBtn active={tab === "transactions"} onClick={() => setTab("transactions")}>Transactions</TabBtn>
        <TabBtn active={tab === "security"} onClick={() => setTab("security")}>Permissions</TabBtn>
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BasicInfoCard user={user} />
          <AccountCard user={user} />
        </div>
      )}

      {tab === "transactions" && (
        <Suspense fallback={<div className="text-blue-200">Loading transactions...</div>}>
          <TransactionsCard userId={user.id} />
        </Suspense>
      )}

      {tab === "security" && <PermissionsCard user={user} />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm transition ${
        active ? "bg-blue-500 text-white" : "text-blue-100 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

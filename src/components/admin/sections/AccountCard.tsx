import type { AdminUser } from "@/api/admin/users";

export function AccountCard({ user }: { user: AdminUser }) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <h4 className="text-white mb-3">Account</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Field label="Balance" value={`${user.balance} USDT`} highlight="green" />
        <Field label="Referral Code" value={user.referral_code} mono />
        <Field label="Referral Count" value={String(user.referral_counter)} />
        <Field label="KYC Verified" value={user.is_kyc_verified ? "Yes" : "No"} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "green" | "red";
}) {
  return (
    <div>
      <p className="text-blue-200">{label}</p>
      <p
        className={[
          mono ? "font-mono break-all" : "break-all",
          highlight === "green" ? "text-green-400" : "",
          highlight === "red" ? "text-red-400" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

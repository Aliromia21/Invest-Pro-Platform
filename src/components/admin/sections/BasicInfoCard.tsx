import type { AdminUser } from "@/api/admin/users";

export function BasicInfoCard({ user }: { user: AdminUser }) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <h4 className="text-white mb-3">Basic Info</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Field label="User ID" value={`#${user.id}`} mono />
        <Field label="Email" value={user.email} />
        <Field label="Username" value={user.username} />
        <Field label="Full Name" value={user.full_name || "—"} />
        <Field label="Phone" value={user.phone || "—"} />
        <Field label="Country" value={user.country || "—"} />
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-blue-200">{label}</p>
      <p className={mono ? "font-mono break-all" : "break-all"}>{value}</p>
    </div>
  );
}

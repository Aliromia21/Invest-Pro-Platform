import type { AdminUser } from "@/api/admin/users";

export function PermissionsCard({ user }: { user: AdminUser }) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <h4 className="text-white mb-3">Permissions</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <Field label="Active" value={user.is_active ? "Yes" : "No"} />
        <Field label="Staff" value={user.is_staff ? "Yes" : "No"} />
        <Field label="Superuser" value={user.is_superuser ? "Yes" : "No"} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-blue-200">{label}</p>
      <p>{value}</p>
    </div>
  );
}

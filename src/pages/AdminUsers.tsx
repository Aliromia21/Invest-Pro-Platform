import { UsersManagement } from '../components/admin/UsersManagement';

export default function AdminUsers() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-white mb-2">Admin Dashboard - Users Management</h1>
          <p className="text-blue-200">Manage all platform users</p>
        </header>
        <main>
          <UsersManagement />
        </main>
      </div>
    </div>
  );
}

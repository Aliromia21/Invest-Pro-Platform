import { MessagesManagement } from '../components/admin/MessagesManagement';

export default function AdminMessages() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-white mb-2">Admin Dashboard - Messages & Offers</h1>
          <p className="text-blue-200">Send custom offers and tasks to users</p>
        </header>
        <main>
          <MessagesManagement />
        </main>
      </div>
    </div>
  );
}

import { DepositRequests } from '../components/admin/DepositRequests';

export default function AdminDeposits() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-white mb-2">Admin Dashboard - Deposit Requests</h1>
          <p className="text-blue-200">Review and approve deposit requests</p>
        </header>
        <main>
          <DepositRequests />
        </main>
      </div>
    </div>
  );
}

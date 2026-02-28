import { KYCVerification } from '../components/admin/KYCVerification';

export default function AdminKYC() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-white mb-2">Admin Dashboard - KYC Verification</h1>
          <p className="text-blue-200">Review identity verification requests</p>
        </header>
        <main>
          <KYCVerification />
        </main>
      </div>
    </div>
  );
}

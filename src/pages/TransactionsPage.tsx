import { useState } from 'react';
import { Transactions } from '../components/Transactions';

export default function TransactionsPage() {
  const [balance, setBalance] = useState(1250.50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-white mb-2">InvestPro Platform</h1>
              <p className="text-blue-200">Your Gateway to Smart Investing</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Total Balance</p>
              <p className="text-white">{balance.toFixed(2)} USDT</p>
            </div>
          </div>
        </header>
        <main>
          <Transactions 
            balance={balance}
            setBalance={setBalance}
          />
        </main>
      </div>
    </div>
  );
}

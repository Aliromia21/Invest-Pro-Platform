import { useState } from 'react';
import { Users, DollarSign, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Affiliate {
  id: string;
  userName: string;
  email: string;
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalInvestmentFromReferrals: number;
  totalCommissionEarned: number;
  commissionRate: number;
  joinDate: string;
}

const mockAffiliates: Affiliate[] = [
  {
    id: '1',
    userName: 'John Smith',
    email: 'john.smith@email.com',
    referralCode: 'INV-JS8K2M',
    totalReferrals: 15,
    activeReferrals: 12,
    totalInvestmentFromReferrals: 45000,
    totalCommissionEarned: 2250,
    commissionRate: 5,
    joinDate: '2025-09-15',
  },
  {
    id: '2',
    userName: 'Michael Chen',
    email: 'mchen@email.com',
    referralCode: 'INV-MC7L4K',
    totalReferrals: 23,
    activeReferrals: 20,
    totalInvestmentFromReferrals: 78000,
    totalCommissionEarned: 3900,
    commissionRate: 5,
    joinDate: '2025-08-20',
  },
  {
    id: '3',
    userName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    referralCode: 'INV-SJ3P9N',
    totalReferrals: 8,
    activeReferrals: 7,
    totalInvestmentFromReferrals: 28000,
    totalCommissionEarned: 1400,
    commissionRate: 5,
    joinDate: '2025-10-01',
  },
];

export function AffiliateOverview() {
  const [affiliates] = useState<Affiliate[]>(mockAffiliates);
  const [sortBy, setSortBy] = useState<string>('earnings');

  const sortedAffiliates = [...affiliates].sort((a, b) => {
    switch (sortBy) {
      case 'earnings':
        return b.totalCommissionEarned - a.totalCommissionEarned;
      case 'referrals':
        return b.totalReferrals - a.totalReferrals;
      case 'investment':
        return b.totalInvestmentFromReferrals - a.totalInvestmentFromReferrals;
      default:
        return 0;
    }
  });

  const totalAffiliates = affiliates.length;
  const totalReferrals = affiliates.reduce((sum, aff) => sum + aff.totalReferrals, 0);
  const totalCommissions = affiliates.reduce((sum, aff) => sum + aff.totalCommissionEarned, 0);
  const totalReferralInvestment = affiliates.reduce((sum, aff) => sum + aff.totalInvestmentFromReferrals, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Active Affiliates</p>
          <p className="text-white text-2xl">{totalAffiliates}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Total Referrals</p>
          <p className="text-white text-2xl">{totalReferrals}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Referral Investment</p>
          <p className="text-white text-2xl">{totalReferralInvestment.toLocaleString()} USDT</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Total Commissions Paid</p>
          <p className="text-white text-2xl">{totalCommissions.toLocaleString()} USDT</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-white mb-4">Top Performing Affiliates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedAffiliates.slice(0, 3).map((aff, index) => (
            <div key={aff.id} className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-white">{aff.userName}</p>
                  <p className="text-yellow-200 text-xs">{aff.referralCode}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-yellow-200 text-sm">Referrals:</span>
                  <span className="text-white text-sm">{aff.totalReferrals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-200 text-sm">Earned:</span>
                  <span className="text-green-400 text-sm">{aff.totalCommissionEarned.toLocaleString()} USDT</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-4">
          <label className="text-blue-200 text-sm">Sort by:</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20 text-white">
              <SelectItem value="earnings">Commission Earned</SelectItem>
              <SelectItem value="referrals">Number of Referrals</SelectItem>
              <SelectItem value="investment">Referral Investment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left text-blue-200 text-sm px-6 py-4">Affiliate</th>
                <th className="text-left text-blue-200 text-sm px-6 py-4">Referral Code</th>
                <th className="text-left text-blue-200 text-sm px-6 py-4">Referrals</th>
                <th className="text-left text-blue-200 text-sm px-6 py-4">Referral Investment</th>
                <th className="text-left text-blue-200 text-sm px-6 py-4">Commission Rate</th>
                <th className="text-left text-blue-200 text-sm px-6 py-4">Total Earned</th>
                <th className="text-left text-blue-200 text-sm px-6 py-4">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedAffiliates.map((aff) => (
                <tr key={aff.id} className="border-t border-white/10">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white">{aff.userName}</p>
                      <p className="text-blue-300 text-sm">{aff.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-mono">{aff.referralCode}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{aff.totalReferrals} total</p>
                    <p className="text-green-400 text-sm">{aff.activeReferrals} active</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{aff.totalInvestmentFromReferrals.toLocaleString()} USDT</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{aff.commissionRate}%</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-green-400">{aff.totalCommissionEarned.toLocaleString()} USDT</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{aff.joinDate}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Program Info */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-300/30">
        <h3 className="text-white mb-4">Affiliate Program Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-purple-200 text-sm mb-1">Starter Pack</p>
            <p className="text-white">3% Commission</p>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-purple-200 text-sm mb-1">Professional Pack</p>
            <p className="text-white">5% Commission</p>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-purple-200 text-sm mb-1">Premium Pack</p>
            <p className="text-white">7% Commission</p>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-purple-200 text-sm mb-1">Elite Pack</p>
            <p className="text-white">10% Commission</p>
          </div>
        </div>
      </div>
    </div>
  );
}

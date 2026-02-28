import { useMemo, useState } from 'react';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type Investment = {
  id: number;
  amount: string;
  status: 'active' | 'completed' | 'cancelled' | string;
  
  expected_total_return?: string;
  duration_days?: number;
};

interface ProfessionalChartProps {
  activeInvestment?: Investment | null;
}

type Timeframe = 'daily' | 'weekly' | 'monthly';
type ViewType = 'income' | 'cumulative';

function toNumber(v: any, fallback = 0) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Point = {
  label: string;
  income: number;
  cumulative: number;
};

function buildSeriesFromInvestment(inv: Investment, timeframe: Timeframe): Point[] {
  const amount = toNumber(inv.amount, 0);

  const expected = toNumber(inv.expected_total_return, 0);
  const duration = clamp(toNumber(inv.duration_days, 30), 1, 3650);
  const totalProfit = Math.max(0, expected - amount);
  const dailyIncome = totalProfit / duration;
  const payoutType: 'daily' | 'end' = 'daily';

  if (timeframe === 'daily') {
    const points = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const income = payoutType === 'daily' ? dailyIncome : 0;
      return { label, income, cumulative: 0 };
    });

    if (payoutType === 'end') points[points.length - 1].income = dailyIncome * 7;

    let cum = 0;
    for (const p of points) {
      cum += p.income;
      p.income = parseFloat(p.income.toFixed(2));
      p.cumulative = parseFloat(cum.toFixed(2));
    }
    return points;
  }

  if (timeframe === 'weekly') {
    const weeklyIncome = dailyIncome * 7;

    const points = Array.from({ length: 4 }, (_, i) => {
      const label = `Week ${i + 1}`;
      const income = payoutType === 'daily' ? weeklyIncome : 0;
      return { label, income, cumulative: 0 };
    });

    if (payoutType === 'end') points[points.length - 1].income = weeklyIncome * 4;

    let cum = 0;
    for (const p of points) {
      cum += p.income;
      p.income = parseFloat(p.income.toFixed(2));
      p.cumulative = parseFloat(cum.toFixed(2));
    }
    return points;
  }

  // monthly
  const monthlyIncome = dailyIncome * 30;

  const points = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const income = payoutType === 'daily' ? monthlyIncome : 0;
    return { label, income, cumulative: 0 };
  });

  if (payoutType === 'end') points[points.length - 1].income = monthlyIncome * 6;

  let cum = 0;
  for (const p of points) {
    cum += p.income;
    p.income = parseFloat(p.income.toFixed(2));
    p.cumulative = parseFloat(cum.toFixed(2));
  }

  return points;
}

export function ProfessionalChart({ activeInvestment }: ProfessionalChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [viewType, setViewType] = useState<ViewType>('income');

  // استثمار نشط فقط
  const inv = useMemo(() => {
    if (!activeInvestment) return null;
    return String(activeInvestment.status).toLowerCase() === 'active'
      ? activeInvestment
      : null;
  }, [activeInvestment]);

  const data = useMemo(() => {
    if (!inv) return [];
    return buildSeriesFromInvestment(inv, timeframe);
  }, [inv, timeframe]);

  const totalIncome = useMemo(() => data.reduce((sum, d) => sum + d.income, 0), [data]);
  const avgIncome = useMemo(() => (data.length ? totalIncome / data.length : 0), [data.length, totalIncome]);

  const growthRateText = useMemo(() => {
    if (!inv) return "0.00%";
    const amount = toNumber(inv.amount, 0);
    const expected = toNumber(inv.expected_total_return, 0);
    if (amount <= 0 || expected <= 0) return "—";
    const pct = ((expected - amount) / amount) * 100;
    return `${clamp(pct, 0, 1000).toFixed(2)}%`;
  }, [inv]);

  const headerInfo = useMemo(() => {
    if (!inv) return null;
    const payoutLabel = 'Estimated (no schedule from API)';
    return { packName: `Investment #${inv.id}`, payoutLabel };
  }, [inv]);

  const CustomTooltip = useMemo(() => {
    return ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const v = payload[0].value ?? 0;
        return (
          <div className="bg-slate-900/95 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl p-4 shadow-2xl">
            <p className="text-blue-200 text-sm mb-2">{payload[0].payload.label}</p>
            {viewType === 'income' ? (
              <p className="text-white text-lg">
                <span className="text-green-400">+{Number(v).toFixed(2)}</span> USDT
              </p>
            ) : (
              <p className="text-white text-lg">
                <span className="text-purple-400">{Number(v).toFixed(2)}</span> USDT Total
              </p>
            )}
          </div>
        );
      }
      return null;
    };
  }, [viewType]);

  if (!inv) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/20 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-white text-xl mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Income Analytics
          </h3>
          <p className="text-blue-300 text-sm">
            Based on active investment:{' '}
            <span className="text-white">{headerInfo?.packName}</span> ·{' '}
            <span className="text-blue-200">{headerInfo?.payoutLabel}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-md text-sm transition-all capitalize ${
                  timeframe === tf
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-blue-300 hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewType('income')}
              className={`px-4 py-2 rounded-md text-sm transition-all ${
                viewType === 'income'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-blue-300 hover:bg-white/5'
              }`}
            >
              Per Period
            </button>
            <button
              onClick={() => setViewType('cumulative')}
              className={`px-4 py-2 rounded-md text-sm transition-all ${
                viewType === 'cumulative'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-blue-300 hover:bg-white/5'
              }`}
            >
              Cumulative
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-400/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <ArrowUpRight className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-green-200 text-sm mb-1">Total Earned</p>
          <p className="text-white text-2xl mb-1">{totalIncome.toFixed(2)} USDT</p>
          <p className="text-green-300 text-xs">
            {timeframe === 'daily' ? 'Last 7 days' : timeframe === 'weekly' ? 'Last 4 weeks' : 'Last 6 months'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-5 border border-blue-400/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            <ArrowUpRight className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-blue-200 text-sm mb-1">Average</p>
          <p className="text-white text-2xl mb-1">{avgIncome.toFixed(2)} USDT</p>
          <p className="text-blue-300 text-xs">
            Per {timeframe === 'daily' ? 'day' : timeframe === 'weekly' ? 'week' : 'month'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-400/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <span className="text-purple-400 text-sm">ROI</span>
          </div>
          <p className="text-purple-200 text-sm mb-1">Growth Rate</p>
          <p className="text-white text-2xl mb-1">{growthRateText}</p>
          <p className="text-purple-300 text-xs">From active pack ROI</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={300}>
          {viewType === 'income' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="label"
                stroke="#93c5fd"
                tick={{ fill: '#93c5fd', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis
                stroke="#93c5fd"
                tick={{ fill: '#93c5fd', fontSize: 12 }}
                width={70}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="rgba(16,185,129,1)"
                strokeWidth={3}
                dot={{ r: 5, fill: 'rgba(16,185,129,1)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: 'rgba(16,185,129,1)', strokeWidth: 3, stroke: '#fff' }}
              />
            </LineChart>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="label"
                stroke="#93c5fd"
                tick={{ fill: '#93c5fd', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis
                stroke="#93c5fd"
                tick={{ fill: '#93c5fd', fontSize: 12 }}
                width={70}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="rgba(139,92,246,1)"
                strokeWidth={3}
                fill="rgba(139,92,246,0.25)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

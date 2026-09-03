import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function FinancialCharts({ metrics, breakdown }) {
  if (!metrics) return null;

  // 1. Data for Income vs Expenses vs Cash Flow
  const cashFlowData = [
    {
      name: 'Income',
      amount: metrics.monthlyIncome,
      fill: '#10b981' // emerald-500
    },
    {
      name: 'Expenses',
      amount: metrics.monthlyExpenses,
      fill: '#f43f5e' // rose-500
    },
    {
      name: 'Cash Flow',
      amount: Math.max(0, metrics.monthlyCashFlow),
      fill: '#3b82f6' // blue-500
    }
  ];

  // 2. Data for Asset Allocation
  const assetData = [
    { name: 'Liquid Savings', value: metrics.currentSavings, color: '#3b82f6' },
    { name: 'Emergency Fund', value: metrics.emergencyFund, color: '#10b981' },
    { name: 'Investments', value: metrics.totalInvestmentValue, color: '#8b5cf6' }
  ].filter((item) => item.value > 0);

  const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-white mb-1">{label || payload[0].name}</p>
          <p className="text-emerald-400 font-semibold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Cash Flow Overview */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-bold text-white">Monthly Cash Flow Structure</h3>
          <p className="text-xs text-slate-400 mt-0.5">Comparison of incoming salary, expenses, and net surplus.</p>
        </div>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Distribution */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-bold text-white">Asset & Reserve Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">Allocation of liquid capital, emergency reserves, and portfolio.</p>
        </div>
        <div className="h-64 w-full mt-4 flex items-center justify-center">
          {assetData.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-8">
              No asset balances recorded yet. Configure your profile or add investments.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#1e293b" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

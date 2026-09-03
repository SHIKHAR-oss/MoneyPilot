import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge.jsx';

export default function BeforeAfterComparison({ simulationResult }) {
  if (!simulationResult) return null;

  const { before, after, changes, risks = [], warnings = [], assumptions = [] } = simulationResult;

  const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

  const renderDelta = (delta, isCurrency = true, suffix = '', inverse = false) => {
    if (delta === 0 || delta === undefined) return <span className="text-slate-500 font-semibold">—</span>;

    const isPositive = delta > 0;
    // For expenses, an increase is negative for the user
    const isGood = inverse ? !isPositive : isPositive;

    const colorClass = isGood ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    const displayVal = isCurrency
      ? `${delta > 0 ? '+' : ''}${formatCurrency(delta)}`
      : `${delta > 0 ? '+' : ''}${delta}${suffix}`;

    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${colorClass}`}>
        <Icon className="w-3 h-3" />
        {displayVal}
      </span>
    );
  };

  const metricRows = [
    {
      label: 'Financial Health Score',
      beforeVal: `${before.healthScore} / 100`,
      afterVal: `${after.healthScore} / 100`,
      delta: renderDelta(changes.healthScoreChange, false, ' pts', false)
    },
    {
      label: 'Monthly Cash Flow',
      beforeVal: formatCurrency(before.monthlyCashFlow),
      afterVal: formatCurrency(after.monthlyCashFlow),
      delta: renderDelta(changes.cashFlowChange, true, '', false)
    },
    {
      label: 'Savings Rate',
      beforeVal: `${before.savingsRate}%`,
      afterVal: `${after.savingsRate}%`,
      delta: renderDelta(changes.savingsRateChange, false, '%', false)
    },
    {
      label: 'Emergency Fund Coverage',
      beforeVal: `${before.emergencyFundCoverage} mo`,
      afterVal: `${after.emergencyFundCoverage} mo`,
      delta: renderDelta(changes.emergencyCoverageChange, false, ' mo', false)
    },
    {
      label: 'Liquid Savings Balance',
      beforeVal: formatCurrency(before.currentSavings),
      afterVal: formatCurrency(after.currentSavings),
      delta: renderDelta(changes.savingsChange, true, '', false)
    },
    {
      label: 'Total Net Worth',
      beforeVal: formatCurrency(before.netWorth),
      afterVal: formatCurrency(after.netWorth),
      delta: renderDelta(changes.netWorthChange, true, '', false)
    },
    {
      label: 'Monthly Expenses',
      beforeVal: formatCurrency(before.monthlyExpenses),
      afterVal: formatCurrency(after.monthlyExpenses),
      delta: renderDelta(changes.monthlyExpensesChange, true, '', true) // inverse: expense increase is red
    }
  ];

  return (
    <div className="space-y-6">
      {/* Before vs After Metric Grid */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Before vs After Consequence Comparison</h3>
            <p className="text-xs text-slate-400 mt-0.5">Deterministic metrics projected before and after this decision.</p>
          </div>
          <Badge variant="info">Verified Simulation</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Metric</th>
                <th className="py-3 px-3 text-slate-400">Current (Before)</th>
                <th className="py-3 px-3 text-white">Projected (After)</th>
                <th className="py-3 px-3 text-right">Net Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {metricRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-200">{row.label}</td>
                  <td className="py-3 px-3 font-medium text-slate-400">{row.beforeVal}</td>
                  <td className="py-3 px-3 font-bold text-white">{row.afterVal}</td>
                  <td className="py-3 px-3 text-right">{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulation Risks & Alerts */}
      {risks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Decision Risk Warnings ({risks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {risks.map((risk, index) => (
              <div
                key={index}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{risk.title}</span>
                    <Badge variant="danger" size="xs">{risk.severity}</Badge>
                  </div>
                  <p className="text-xs text-rose-300 leading-relaxed">{risk.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings & Assumptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Operational Warnings
            </h4>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-xs text-amber-200/90 flex items-start gap-1.5">
                  <span>•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assumptions */}
        {assumptions.length > 0 && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Simulation Assumptions
            </h4>
            <ul className="space-y-1">
              {assumptions.map((a, i) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                  <span>•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge.jsx';

export default function BeforeAfterComparison({ simulationResult }) {
  if (!simulationResult) return null;

  const { before, after, changes, risks = [], warnings = [], assumptions = [] } = simulationResult;

  const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

  const renderDelta = (delta, isCurrency = true, suffix = '', inverse = false) => {
    if (delta === 0 || delta === undefined) return <span className="text-[#859188] font-semibold">—</span>;

    const isPositive = delta > 0;
    // For expenses, an increase is negative for the user
    const isGood = inverse ? !isPositive : isPositive;

    const colorClass = isGood
      ? 'text-[#087F5B] bg-[#ECFDF5] border border-[#A7F3D0]'
      : 'text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA]';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    const displayVal = isCurrency
      ? `${delta > 0 ? '+' : ''}${formatCurrency(delta)}`
      : `${delta > 0 ? '+' : ''}${delta}${suffix}`;

    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg tabular-nums ${colorClass}`}>
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
      <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-[#E0E8E2] mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#14251C]">Before vs After Consequence Comparison</h3>
            <p className="text-xs text-[#64736A] mt-0.5">Deterministic metrics projected before and after this decision.</p>
          </div>
          <Badge variant="success">Verified Simulation</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E8E2] bg-[#F4F8F5] text-[11px] font-bold text-[#64736A] uppercase tracking-wider">
                <th className="py-3 px-3.5">Metric</th>
                <th className="py-3 px-3.5 text-[#64736A]">Current (Before)</th>
                <th className="py-3 px-3.5 text-[#14251C]">Projected (After)</th>
                <th className="py-3 px-3.5 text-right">Net Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E8E2] text-sm">
              {metricRows.map((row, i) => (
                <tr key={i} className="hover:bg-[#F4F8F5]/60 transition-colors">
                  <td className="py-3.5 px-3.5 font-bold text-[#14251C]">{row.label}</td>
                  <td className="py-3.5 px-3.5 font-medium text-[#64736A] tabular-nums">{row.beforeVal}</td>
                  <td className="py-3.5 px-3.5 font-extrabold text-[#17251D] tabular-nums">{row.afterVal}</td>
                  <td className="py-3.5 px-3.5 text-right">{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulation Risks & Alerts */}
      {risks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#64736A] uppercase tracking-wider">
            Decision Risk Warnings ({risks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {risks.map((risk, index) => (
              <div
                key={index}
                className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex items-start gap-3 shadow-xs"
              >
                <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#14251C]">{risk.title}</span>
                    <Badge variant="danger" size="xs">{risk.severity}</Badge>
                  </div>
                  <p className="text-xs text-[#991B1B] leading-relaxed">{risk.explanation}</p>
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
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4.5 space-y-2 shadow-xs">
            <h4 className="text-xs font-bold text-[#B45309] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Operational Warnings
            </h4>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-xs text-[#92400E] flex items-start gap-1.5 leading-relaxed">
                  <span>•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assumptions */}
        {assumptions.length > 0 && (
          <div className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl p-4.5 space-y-2 shadow-xs">
            <h4 className="text-xs font-bold text-[#64736A] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#087F5B]" /> Simulation Assumptions
            </h4>
            <ul className="space-y-1">
              {assumptions.map((a, i) => (
                <li key={i} className="text-xs text-[#64736A] flex items-start gap-1.5 leading-relaxed">
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

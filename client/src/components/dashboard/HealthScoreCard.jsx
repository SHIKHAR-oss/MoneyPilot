import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Badge from '../common/Badge.jsx';

export default function HealthScoreCard({ healthScore }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!healthScore) return null;

  const { score, rating, components } = healthScore;

  const getRatingVariant = (r) => {
    switch (r) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'info';
      case 'Fair':
        return 'warning';
      default:
        return 'danger';
    }
  };

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-[#087F5B] border-[#087F5B] bg-[#ECFDF5]/50';
    if (s >= 65) return 'text-[#2563EB] border-[#2563EB] bg-[#EFF6FF]/50';
    if (s >= 50) return 'text-[#B45309] border-[#B45309] bg-[#FEF3C7]/50';
    return 'text-[#DC2626] border-[#DC2626] bg-[#FEF2F2]/50';
  };

  const componentLabels = {
    savingsRate: 'Savings Rate',
    emergencyFund: 'Emergency Fund',
    cashFlow: 'Cash Flow Cushion',
    goalProgress: 'Goal Progress',
    investmentPosition: 'Investment Position'
  };

  return (
    <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Score Gauge */}
          <div
            className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center shadow-xs ${getScoreColor(
              score
            )}`}
          >
            <span className="text-3xl font-black tracking-tight tabular-nums">{score}</span>
            <span className="text-[10px] uppercase font-bold text-[#859188]">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2 className="text-xl font-extrabold text-[#14251C] tracking-tight">Financial Health Score</h2>
              <Badge variant={getRatingVariant(rating)}>{rating}</Badge>
            </div>
            <p className="text-xs text-[#64736A] max-w-md leading-relaxed">
              A transparent deterministic assessment of your savings discipline, emergency resilience, and investment posture.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4F8F5] hover:bg-[#E0E8E2]/60 text-[#17251D] text-xs font-bold rounded-xl transition-all border border-[#E0E8E2] self-end md:self-center"
        >
          {showBreakdown ? <ChevronUp className="w-4 h-4 text-[#087F5B]" /> : <ChevronDown className="w-4 h-4 text-[#087F5B]" />}
          {showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
        </button>
      </div>

      {/* 5-Pillar Explainable Breakdown */}
      {showBreakdown && components && (
        <div className="mt-6 pt-6 border-t border-[#E0E8E2] space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-[#64736A] uppercase tracking-wider mb-2">
            Deterministic Scoring Pillars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(components).map(([key, item]) => {
              const pct = Math.round((item.score / item.maxScore) * 100);
              return (
                <div key={key} className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#14251C]">{componentLabels[key] || key}</span>
                    <span className="font-extrabold text-[#17251D] tabular-nums">
                      {item.score} <span className="text-[#859188] font-normal">/ {item.maxScore} pts</span>
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-[#E0E8E2] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-[#087F5B]' : pct >= 50 ? 'bg-[#10B981]' : 'bg-[#B45309]'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[#64736A] leading-relaxed">{item.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

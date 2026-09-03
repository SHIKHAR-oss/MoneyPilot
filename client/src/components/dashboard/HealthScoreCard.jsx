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
    if (s >= 80) return 'text-emerald-400 border-emerald-500';
    if (s >= 65) return 'text-blue-400 border-blue-500';
    if (s >= 50) return 'text-amber-400 border-amber-500';
    return 'text-rose-400 border-rose-500';
  };

  const componentLabels = {
    savingsRate: 'Savings Rate',
    emergencyFund: 'Emergency Fund',
    cashFlow: 'Cash Flow Cushion',
    goalProgress: 'Goal Progress',
    investmentPosition: 'Investment Position'
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Score Gauge */}
          <div
            className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center bg-slate-900/60 shadow-inner ${getScoreColor(
              score
            )}`}
          >
            <span className="text-3xl font-extrabold tracking-tight">{score}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-xl font-bold text-white">Financial Health Score</h2>
              <Badge variant={getRatingVariant(rating)}>{rating}</Badge>
            </div>
            <p className="text-xs text-slate-300 max-w-md">
              A transparent deterministic assessment of your savings discipline, emergency resilience, and investment posture.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-600/40 self-end md:self-center"
        >
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
        </button>
      </div>

      {/* 5-Pillar Explainable Breakdown */}
      {showBreakdown && components && (
        <div className="mt-6 pt-6 border-t border-slate-700/60 space-y-3.5 animate-fadeIn">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Deterministic Scoring Pillars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.entries(components).map(([key, item]) => {
              const pct = Math.round((item.score / item.maxScore) * 100);
              return (
                <div key={key} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{componentLabels[key] || key}</span>
                    <span className="font-bold text-slate-300">
                      {item.score} <span className="text-slate-500 font-normal">/ {item.maxScore} pts</span>
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic leading-snug">{item.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

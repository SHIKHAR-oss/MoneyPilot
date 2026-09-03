import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between backdrop-blur-sm hover:border-slate-600/80 transition-all">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.emerald}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

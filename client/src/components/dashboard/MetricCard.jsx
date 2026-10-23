import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-[#ECFDF5] text-[#087F5B] border-[#A7F3D0]',
    blue: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
    amber: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    rose: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
  };

  return (
    <div className="bg-white border border-[#E0E8E2] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#087F5B]/30 transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold text-[#64736A] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.emerald}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-extrabold text-[#14251C] tracking-tight tabular-nums">{value}</div>
        {subtitle && (
          <div className="text-xs text-[#64736A] mt-1 flex items-center gap-1.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

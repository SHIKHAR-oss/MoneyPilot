import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="bg-white border border-[#E0E8E2] rounded-2xl p-8 shadow-sm max-w-2xl">
      <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/60 flex items-center justify-center text-[#087F5B] mb-4">
        <BarChart3 className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-[#14251C] mb-2 tracking-tight">Analytics & Insights</h2>
      <p className="text-[#64736A] text-sm leading-relaxed">
        Portfolio allocation analytics, spending breakdown, and longitudinal trends are integrated across your Dashboard and Simulator. Full standalone reports are coming soon.
      </p>
    </div>
  );
}

import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge.jsx';

export default function RiskAlertBanner({ risks = [] }) {
  if (!risks || risks.length === 0) {
    return (
      <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
        <CheckCircle2 className="w-5 h-5 text-[#087F5B] flex-shrink-0" />
        <div className="text-xs text-[#087F5B] leading-relaxed">
          <span className="font-bold text-[#14251C]">No Critical Financial Risks Detected: </span>
          Your current cash flow and emergency reserves meet standard safety parameters.
        </div>
      </div>
    );
  }

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          icon: AlertCircle,
          border: 'border-[#FECACA]',
          bg: 'bg-[#FEF2F2]',
          text: 'text-[#991B1B]',
          iconColor: 'text-[#DC2626]',
          badgeVariant: 'danger'
        };
      case 'HIGH':
        return {
          icon: AlertTriangle,
          border: 'border-[#FDE68A]',
          bg: 'bg-[#FEF3C7]',
          text: 'text-[#92400E]',
          iconColor: 'text-[#B45309]',
          badgeVariant: 'warning'
        };
      case 'MEDIUM':
        return {
          icon: AlertTriangle,
          border: 'border-[#FEF08A]',
          bg: 'bg-[#FEFCE8]',
          text: 'text-[#854D0E]',
          iconColor: 'text-[#CA8A04]',
          badgeVariant: 'warning'
        };
      default:
        return {
          icon: Info,
          border: 'border-[#BFDBFE]',
          bg: 'bg-[#EFF6FF]',
          text: 'text-[#1E40AF]',
          iconColor: 'text-[#2563EB]',
          badgeVariant: 'info'
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#64736A] uppercase tracking-wider">
          Active Financial Risks & Vulnerabilities ({risks.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {risks.map((risk, index) => {
          const config = getSeverityConfig(risk.severity);
          const Icon = config.icon;
          return (
            <div
              key={index}
              className={`border ${config.border} ${config.bg} rounded-xl p-4 flex items-start gap-3 shadow-xs`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#14251C] tracking-wide">{risk.title}</h4>
                  <Badge variant={config.badgeVariant} size="xs">{risk.severity}</Badge>
                </div>
                <p className={`text-xs ${config.text} leading-relaxed`}>{risk.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

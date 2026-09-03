import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge.jsx';

export default function RiskAlertBanner({ risks = [] }) {
  if (!risks || risks.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-300">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div className="text-xs">
          <span className="font-semibold text-white">No Critical Financial Risks Detected: </span>
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
          border: 'border-rose-500/30',
          bg: 'bg-rose-500/10',
          text: 'text-rose-300',
          badgeVariant: 'danger'
        };
      case 'HIGH':
        return {
          icon: AlertTriangle,
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          text: 'text-amber-300',
          badgeVariant: 'warning'
        };
      case 'MEDIUM':
        return {
          icon: AlertTriangle,
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-300',
          badgeVariant: 'warning'
        };
      default:
        return {
          icon: Info,
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          text: 'text-blue-300',
          badgeVariant: 'info'
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Active Financial Risks & Vulnerabilities ({risks.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {risks.map((risk, index) => {
          const config = getSeverityConfig(risk.severity);
          const Icon = config.icon;
          return (
            <div
              key={index}
              className={`border ${config.border} ${config.bg} rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm shadow-sm`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/90" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white tracking-wide">{risk.title}</h4>
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

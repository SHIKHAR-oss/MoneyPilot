import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../common/Badge.jsx';

export default function AIOverviewPanel() {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  const fetchAIExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.ai.explainOverview();
      setAiStatus(response.aiStatus);
      if (response?.data?.explanation) {
        setExplanation(response.data.explanation);
      }
    } catch (err) {
      console.warn('[AIOverviewPanel] Error fetching explanation:', err.message);
      setError(err.message || 'AI explanation service is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 via-slate-800/50 to-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">AI Financial Intelligence Explanation</h3>
              {aiStatus === 'unavailable' && <Badge variant="warning" size="xs">Fallback Mode</Badge>}
            </div>
            <p className="text-xs text-slate-400">
              Powered by Google Gemini — Translating deterministic numbers into plain English insights.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAIExplanation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md self-start sm:self-center flex-shrink-0"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Analyzing...' : explanation ? 'Regenerate Analysis' : 'Explain My Finances with AI'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Content Area */}
      {!explanation && !loading && !error && (
        <div className="py-8 text-center text-xs text-slate-400">
          Click the button above to generate a plain-language explanation of your health score, cash flow, and risk posture.
        </div>
      )}

      {explanation && (
        <div className="mt-5 space-y-5 animate-fadeIn">
          {/* Summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-200 leading-relaxed">{explanation.summary}</p>
          </div>

          {/* Strengths and Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            {explanation.strengths?.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" /> Key Strengths
                </h4>
                <ul className="space-y-1.5">
                  {explanation.strengths.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {explanation.concerns?.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" /> Areas for Improvement
                </h4>
                <ul className="space-y-1.5">
                  {explanation.concerns.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          {explanation.recommendedActions?.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recommended Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {explanation.recommendedActions.map((rec, i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={rec.priority === 'HIGH' ? 'danger' : rec.priority === 'MEDIUM' ? 'warning' : 'info'}
                        size="xs"
                      >
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <h5 className="text-xs font-semibold text-white">{rec.action}</h5>
                    <p className="text-[11px] text-slate-400 leading-snug">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {explanation.disclaimer && (
            <p className="text-[10px] text-slate-500 italic pt-2 border-t border-slate-800">
              {explanation.disclaimer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

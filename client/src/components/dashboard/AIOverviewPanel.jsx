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
    <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E8E2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#14251C]">AI Financial Intelligence Explanation</h3>
              {aiStatus === 'unavailable' && <Badge variant="warning" size="xs">Fallback Mode</Badge>}
            </div>
            <p className="text-xs text-[#64736A]">
              Powered by Google Gemini — Translating deterministic numbers into plain English insights.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAIExplanation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#087F5B] hover:bg-[#066649] disabled:bg-[#D1DED5] text-white text-xs font-bold rounded-xl transition-all shadow-sm self-start sm:self-center flex-shrink-0"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Analyzing...' : explanation ? 'Regenerate Analysis' : 'Explain My Finances with AI'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#991B1B]">
          {error}
        </div>
      )}

      {/* Content Area */}
      {!explanation && !loading && !error && (
        <div className="py-8 text-center text-xs text-[#64736A]">
          Click the button above to generate a plain-language explanation of your health score, cash flow, and risk posture.
        </div>
      )}

      {explanation && (
        <div className="mt-5 space-y-5 animate-fadeIn">
          {/* Summary */}
          <div className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl p-4">
            <p className="text-sm text-[#17251D] leading-relaxed">{explanation.summary}</p>
          </div>

          {/* Strengths and Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            {explanation.strengths?.length > 0 && (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4.5 space-y-2.5">
                <h4 className="text-xs font-bold text-[#087F5B] flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" /> Key Strengths
                </h4>
                <ul className="space-y-1.5">
                  {explanation.strengths.map((item, i) => (
                    <li key={i} className="text-xs text-[#17251D] flex items-start gap-2">
                      <span className="text-[#087F5B] mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {explanation.concerns?.length > 0 && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4.5 space-y-2.5">
                <h4 className="text-xs font-bold text-[#B45309] flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" /> Areas for Improvement
                </h4>
                <ul className="space-y-1.5">
                  {explanation.concerns.map((item, i) => (
                    <li key={i} className="text-xs text-[#17251D] flex items-start gap-2">
                      <span className="text-[#B45309] mt-0.5">•</span>
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
              <h4 className="text-xs font-bold text-[#64736A] uppercase tracking-wider">
                Recommended Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {explanation.recommendedActions.map((rec, i) => (
                  <div key={i} className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={rec.priority === 'HIGH' ? 'danger' : rec.priority === 'MEDIUM' ? 'warning' : 'info'}
                        size="xs"
                      >
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <h5 className="text-xs font-bold text-[#14251C]">{rec.action}</h5>
                    <p className="text-xs text-[#64736A] leading-relaxed">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {explanation.disclaimer && (
            <p className="text-[11px] text-[#859188] italic pt-3 border-t border-[#E0E8E2]">
              {explanation.disclaimer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

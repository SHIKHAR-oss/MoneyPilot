import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../common/Badge.jsx';

export default function AISimulationExplanationPanel({ decision }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  const fetchExplanation = async () => {
    if (!decision) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.ai.explainSimulation(decision);
      setAiStatus(response.aiStatus);
      if (response?.data?.explanation) {
        setExplanation(response.data.explanation);
      }
    } catch (err) {
      console.warn('[AISimulationExplanationPanel] Error:', err.message);
      setError(err.message || 'AI explanation service is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 via-slate-800/60 to-indigo-950/40 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">AI Decision Explanation</h3>
              {aiStatus === 'unavailable' && <Badge variant="warning" size="xs">Fallback Mode</Badge>}
            </div>
            <p className="text-xs text-slate-400">
              AI analysis interpreting the trade-offs and risks of this simulated choice.
            </p>
          </div>
        </div>

        <button
          onClick={fetchExplanation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md self-start sm:self-center flex-shrink-0"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Interpreting...' : explanation ? 'Re-explain Decision' : 'Explain Decision with AI'}
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      {!explanation && !loading && !error && (
        <div className="py-6 text-center text-xs text-slate-400">
          Click the button above to receive an AI-generated explanation of the positive and negative consequences of this decision.
        </div>
      )}

      {explanation && (
        <div className="space-y-4 animate-fadeIn">
          {/* Summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-200 leading-relaxed">{explanation.summary}</p>
          </div>

          {/* Positive vs Negative Impacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {explanation.positiveImpacts?.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Positive Trade-offs
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {explanation.positiveImpacts.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.negativeImpacts?.length > 0 && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Negative Impacts / Costs
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {explanation.negativeImpacts.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Pragmatic Suggestions */}
          {explanation.suggestions?.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Pragmatic Recommendations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {explanation.suggestions.map((sug, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">{i + 1}.</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
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

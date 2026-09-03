import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, SlidersHorizontal, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-slate-800/90 via-slate-900 to-emerald-950/40 border border-slate-700/60 shadow-2xl backdrop-blur-md">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Financial Decision Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Understand the consequences of financial choices <span className="text-emerald-400">before</span> making them.
          </h1>

          <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 text-slate-300 italic text-base sm:text-lg">
            "AI can suggest. The system checks. The user decides."
          </blockquote>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            MoneyPilot is not an expense tracker or a generic chatbot. It is a deterministic financial intelligence platform that calculates before vs after consequences and uses Gemini AI to explain results clearly.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={isAuthenticated ? '/simulate' : '/login'}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Launch Simulator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-3 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Deterministic Financial Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pure mathematical calculations for cash flow, emergency buffers, savings rates, and 0–100 health scores without hallucination.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-3 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Before vs After Simulator</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Simulate purchases, expense changes, income fluctuations, or SIP increases with immediate side-by-side consequence modeling.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-3 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Gemini AI Explanation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Translates complex financial trade-offs, risks, and deltas into actionable plain-English summaries and recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}

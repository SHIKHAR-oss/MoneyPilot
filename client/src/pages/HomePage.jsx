import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, SlidersHorizontal, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-10 py-4">
      {/* Hero Section */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-white border border-[#E0E8E2] shadow-sm">
        {/* Soft background aura */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#ECFDF5] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#F4F8F5] rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#087F5B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Financial Decision Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#14251C] tracking-tight leading-tight">
            Understand the consequences of financial choices <span className="text-[#087F5B]">before</span> making them.
          </h1>

          <blockquote className="border-l-4 border-[#087F5B] pl-4 py-2 text-[#17251D] font-medium italic text-base sm:text-lg bg-[#FAFCFA] rounded-r-xl border-y border-r border-[#E0E8E2]">
            "AI can suggest. The system checks. The user decides."
          </blockquote>

          <p className="text-sm sm:text-base text-[#64736A] leading-relaxed max-w-2xl">
            MoneyPilot is not an expense tracker or a generic chatbot. It is a deterministic financial intelligence platform that calculates before vs after consequences and uses Gemini AI to explain results clearly.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="px-6 py-3.5 bg-[#087F5B] hover:bg-[#066649] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#087F5B]/20 flex items-center gap-2"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={isAuthenticated ? '/simulate' : '/login'}
              className="px-6 py-3.5 bg-[#FAFCFA] hover:bg-[#F4F8F5] text-[#17251D] font-bold text-sm rounded-xl border border-[#E0E8E2] transition-all flex items-center gap-2 shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#087F5B]" />
              <span>Launch Simulator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 space-y-3.5 shadow-sm hover:shadow-md hover:border-[#087F5B]/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#14251C]">Deterministic Financial Engine</h3>
          <p className="text-xs text-[#64736A] leading-relaxed">
            Pure mathematical calculations for cash flow, emergency buffers, savings rates, and 0–100 health scores without hallucination.
          </p>
        </div>

        <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 space-y-3.5 shadow-sm hover:shadow-md hover:border-[#087F5B]/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#14251C]">Before vs After Simulator</h3>
          <p className="text-xs text-[#64736A] leading-relaxed">
            Simulate purchases, expense changes, income fluctuations, or SIP increases with immediate side-by-side consequence modeling.
          </p>
        </div>

        <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 space-y-3.5 shadow-sm hover:shadow-md hover:border-[#087F5B]/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#14251C]">Gemini AI Explanation</h3>
          <p className="text-xs text-[#64736A] leading-relaxed">
            Translates complex financial trade-offs, risks, and deltas into actionable plain-English summaries and recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}

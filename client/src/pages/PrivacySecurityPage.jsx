import React from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  EyeOff,
  Cpu,
  Server,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ACTIVE_SECURITY_FEATURES = [
  {
    icon: Lock,
    title: 'Password Hashing with bcrypt',
    description: 'Your password is never stored in plain text. MoneyPilot hashes passwords using one-way bcrypt with random salts before saving to the database.',
    verification: 'Implemented in server/src/models/User.js using bcryptjs with 10 salt rounds.'
  },
  {
    icon: KeyRound,
    title: 'JWT-Protected API Routes',
    description: 'All financial endpoints require cryptographically signed JSON Web Tokens (JWT). Requests without a valid Bearer token are rejected with 401 Unauthorized.',
    verification: 'Enforced via server/src/middleware/authMiddleware.js on all financial routes.'
  },
  {
    icon: EyeOff,
    title: 'Strict User Data Isolation',
    description: 'Every database query and mutation explicitly enforces matching your authenticated user ID. It is structurally impossible to query or modify another user’s records.',
    verification: 'Enforced via { _id: id, userId } filters across all controllers.'
  },
  {
    icon: Cpu,
    title: 'AI Data Minimization',
    description: 'The AI assistant receives only the minimal numerical metrics required to generate guidance. Passwords, JWT secrets, account tokens, and raw database dumps are never sent to Gemini.',
    verification: 'Implemented via buildSanitizedFinancialContext in server/src/services/aiAssistantService.js.'
  },
  {
    icon: Server,
    title: 'No Direct Database Access by AI',
    description: 'Gemini AI operates as an external, stateless model. It has zero direct access, query permissions, or connection strings to your MongoDB database.',
    verification: 'Deterministic engines process raw data first; AI only receives high-level calculated metrics.'
  },
  {
    icon: ShieldCheck,
    title: 'Backend-Only Secrets & Environment Isolation',
    description: 'Gemini API keys, database connection URIs, and JWT signing secrets reside solely in backend environment variables and are never bundled in client code.',
    verification: 'Verified via frontend bundle audit; zero server secrets in Vite client code.'
  },
  {
    icon: FileCheck2,
    title: 'Strict Input Validation & Sanitization',
    description: 'All API routes validate payload types, string length bounds, numeric positivity, and valid MongoDB 24-character hexadecimal IDs to reject malformed requests.',
    verification: 'Implemented in server/src/utils/validationHelpers.js and route controllers.'
  },
  {
    icon: ShieldAlert,
    title: 'HTTP Security Headers & CORS Protection',
    description: 'Responses include standard protection headers (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy) and strict CORS origin verification.',
    verification: 'Enforced via securityHeadersMiddleware.js and Express CORS middleware.'
  },
  {
    icon: Clock,
    title: 'In-Memory Rate Limiting',
    description: 'AI endpoints enforce sliding-window rate limiting to prevent automated abuse, quota exhaustion, and denial-of-service attempts.',
    verification: 'Enforced via server/src/middleware/rateLimitMiddleware.js on AI endpoints.'
  }
];

const UNIMPLEMENTED_ROADMAP_ITEMS = [
  {
    title: 'Two-Factor Authentication (2FA / MFA)',
    status: 'Roadmap Item (Not Yet Enabled)',
    detail: 'Time-based one-time passwords (TOTP) or SMS verification are currently not implemented.'
  },
  {
    title: 'Client-Side Zero-Knowledge Encryption',
    status: 'Not Implemented',
    detail: 'Data is protected in transit via HTTPS and passwords are encrypted with bcrypt, but financial records are stored as standard documents in MongoDB for computation.'
  },
  {
    title: 'Third-Party Security Certifications (SOC 2, ISO 27001)',
    status: 'Not Applicable',
    detail: 'MoneyPilot is an independent fintech project and does not claim commercial compliance certifications.'
  }
];

export default function PrivacySecurityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E8E2]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#14251C] tracking-tight">
                Privacy & Data Security Center
              </h1>
              <p className="text-xs text-[#64736A] mt-0.5">
                Transparent verification of how MoneyPilot protects your financial records and privacy.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            to="/profile"
            className="px-3.5 py-2 bg-white hover:bg-[#F4F8F5] text-[#14251C] text-xs font-semibold rounded-xl border border-[#E0E8E2] transition-colors"
          >
            Back to Profile
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-bold text-[#087F5B]">
            <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-pulse"></span>
            <span>Security Active</span>
          </div>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 sm:p-7 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-[#14251C]">
          Your financial data is protected.
        </h2>
        <p className="text-xs sm:text-sm text-[#64736A] leading-relaxed">
          MoneyPilot is designed to keep your financial information private and accessible only through your authenticated account. Our architectural philosophy is built on data minimization: calculations are conducted deterministically on the backend, and external AI models only receive limited numerical aggregates when you explicitly request an explanation.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-[#087F5B] font-semibold border border-[#A7F3D0]/60">
            <CheckCircle2 className="w-3.5 h-3.5" /> 9 Verified Protections Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAFCFA] text-[#64736A] font-semibold border border-[#E0E8E2]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" /> Zero Secrets in Client Bundle
          </span>
        </div>
      </div>

      {/* Active Security Mechanisms Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#14251C]">
            Active Security Mechanisms
          </h3>
          <p className="text-xs text-[#64736A]">
            These safeguards are actively implemented and enforced in the MoneyPilot codebase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACTIVE_SECURITY_FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E0E8E2] rounded-2xl p-5 shadow-sm space-y-2.5 hover:border-[#A7F3D0] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/70 flex items-center justify-center text-[#087F5B] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#14251C] leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-bold text-[#087F5B] shrink-0">
                    Active
                  </span>
                </div>

                <p className="text-xs text-[#64736A] leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-[#E0E8E2]/80 text-[11px] text-[#859188] flex items-baseline gap-1">
                  <span className="font-semibold text-[#14251C]">Verification:</span>
                  <span className="font-mono text-[10px] text-[#087F5B]">{item.verification}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Data Flow & Privacy Explanation */}
      <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#087F5B]" />
          <h3 className="text-base font-bold text-[#14251C]">
            How MoneyPilot Handles AI & Data Minimization
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#64736A] leading-relaxed">
          When you interact with the AI Financial Assistant, your request follows a strictly guarded pipeline to guarantee that your account credentials and raw records never leave the secure application perimeter:
        </p>

        {/* Pipeline Diagram / Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-[#087F5B] uppercase tracking-wider block">Step 1: Auth</span>
            <p className="text-xs font-semibold text-[#14251C]">JWT Verification</p>
            <p className="text-[11px] text-[#64736A]">Identifies your user ID. Rejects unauthenticated requests immediately.</p>
          </div>

          <div className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-[#087F5B] uppercase tracking-wider block">Step 2: Engine</span>
            <p className="text-xs font-semibold text-[#14251C]">Deterministic Math</p>
            <p className="text-[11px] text-[#64736A]">MetricsEngine & HealthScoreEngine compute authoritative numbers in Express.</p>
          </div>

          <div className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-[#087F5B] uppercase tracking-wider block">Step 3: Guard</span>
            <p className="text-xs font-semibold text-[#14251C]">Context Minimization</p>
            <p className="text-[11px] text-[#64736A]">Strips names, passwords, DB IDs, and raw ledgers into minimal numerical aggregates.</p>
          </div>

          <div className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-[#087F5B] uppercase tracking-wider block">Step 4: Answer</span>
            <p className="text-xs font-semibold text-[#14251C]">Grounded Response</p>
            <p className="text-[11px] text-[#64736A]">Gemini synthesizes guidance grounded in your calculations with zero DB access.</p>
          </div>
        </div>
      </div>

      {/* Transparent Limitations & Roadmap Section */}
      <div className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-[#14251C]">
            Transparent Security Disclosures & Roadmap
          </h3>
        </div>

        <p className="text-xs text-[#64736A] leading-relaxed">
          In adherence to our principle of absolute transparency, we do not make inflated or unsupported claims like "bank-level security" or "100% unhackable." The following features are currently not implemented:
        </p>

        <div className="space-y-3">
          {UNIMPLEMENTED_ROADMAP_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E0E8E2] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-bold text-[#14251C]">{item.title}</span>
                <p className="text-[11px] text-[#64736A] mt-0.5">{item.detail}</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-[10px] font-bold text-amber-800 shrink-0 self-start sm:self-center">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

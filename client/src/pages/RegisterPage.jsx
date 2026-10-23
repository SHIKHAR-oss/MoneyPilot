import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white border border-[#E0E8E2] rounded-3xl p-8 sm:p-9 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#087F5B] flex items-center justify-center text-white mx-auto shadow-md shadow-[#087F5B]/25">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-[#14251C] tracking-tight">Create MoneyPilot Account</h2>
          <p className="text-xs text-[#64736A]">
            Empower your financial decisions with deterministic intelligence and AI.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#14251C] block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#859188] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17251D] placeholder:text-[#859188] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#14251C] block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#859188] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17251D] placeholder:text-[#859188] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#14251C] block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#859188] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#17251D] placeholder:text-[#859188] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#087F5B] hover:bg-[#066649] disabled:bg-[#D1DED5] text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-[#E0E8E2] text-xs text-[#64736A]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#087F5B] font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

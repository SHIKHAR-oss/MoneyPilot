import React, { useState, useEffect } from 'react';
import { UserCheck, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    monthlyIncome: 0,
    currentSavings: 0,
    emergencyFund: 0,
    riskProfile: 'moderate'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.profile.get();
      if (res?.data?.profile) {
        setProfile({
          monthlyIncome: res.data.profile.monthlyIncome || 0,
          currentSavings: res.data.profile.currentSavings || 0,
          emergencyFund: res.data.profile.emergencyFund || 0,
          riskProfile: res.data.profile.riskProfile || 'moderate'
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load financial profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.profile.update({
        monthlyIncome: Number(profile.monthlyIncome),
        currentSavings: Number(profile.currentSavings),
        emergencyFund: Number(profile.emergencyFund),
        riskProfile: profile.riskProfile
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update financial profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading financial profile..." size="lg" />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Financial Profile</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure your baseline income, liquid savings, and risk tolerance for accurate intelligence calculations.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-2 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Financial profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Monthly Base Income (₹)</label>
            <input
              type="number"
              min="0"
              required
              value={profile.monthlyIncome}
              onChange={(e) => setProfile({ ...profile, monthlyIncome: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Your primary monthly take-home salary or cash flow.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Liquid Savings Balance (₹)</label>
            <input
              type="number"
              min="0"
              required
              value={profile.currentSavings}
              onChange={(e) => setProfile({ ...profile, currentSavings: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Available cash in savings and checking accounts.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Dedicated Emergency Fund (₹)</label>
            <input
              type="number"
              min="0"
              required
              value={profile.emergencyFund}
              onChange={(e) => setProfile({ ...profile, emergencyFund: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Reserves allocated strictly for unforeseen emergencies.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Risk Tolerance Profile</label>
            <select
              value={profile.riskProfile}
              onChange={(e) => setProfile({ ...profile, riskProfile: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="conservative">Conservative (High debt/capital preservation focus)</option>
              <option value="moderate">Moderate (Balanced wealth accumulation)</option>
              <option value="aggressive">Aggressive (High equity/long-term compounding)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700/60 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Financial Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

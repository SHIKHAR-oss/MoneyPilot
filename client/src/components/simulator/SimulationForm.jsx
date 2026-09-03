import React, { useState } from 'react';
import { Play, Sparkles, SlidersHorizontal } from 'lucide-react';

const DECISION_TYPES = [
  { id: 'ONE_TIME_EXPENSE', label: 'One-Time Expense', description: 'Simulate a lump sum purchase (e.g. laptop, vacation, medical).' },
  { id: 'MONTHLY_EXPENSE_CHANGE', label: 'Monthly Expense Change', description: 'Simulate a recurring increase or reduction in monthly fixed costs.' },
  { id: 'MONTHLY_INCOME_CHANGE', label: 'Monthly Income Change', description: 'Simulate a salary raise, job change, or income reduction.' },
  { id: 'MONTHLY_INVESTMENT_CHANGE', label: 'Monthly Investment Change', description: 'Simulate increasing or decreasing your monthly SIP contribution.' }
];

const PRESETS = [
  { label: 'Buy Laptop (₹80,000)', payload: { type: 'ONE_TIME_EXPENSE', amount: 80000, category: 'purchase', description: 'New Work Laptop' } },
  { label: 'Vacation Trip (₹50,000)', payload: { type: 'ONE_TIME_EXPENSE', amount: 50000, category: 'travel', description: 'Annual Holiday' } },
  { label: 'Rent Hike (+₹5,000/mo)', payload: { type: 'MONTHLY_EXPENSE_CHANGE', amount: 5000, description: 'Housing Rent Increase' } },
  { label: '15% Salary Hike', payload: { type: 'MONTHLY_INCOME_CHANGE', percentage: 15, description: 'Annual Promotion Increment' } },
  { label: 'Boost SIP (+₹5,000/mo)', payload: { type: 'MONTHLY_INVESTMENT_CHANGE', amount: 5000, description: 'Increase Mutual Fund SIP' } }
];

export default function SimulationForm({ onRunSimulation, loading }) {
  const [type, setType] = useState('ONE_TIME_EXPENSE');
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('');
  const [incomeMode, setIncomeMode] = useState('percentage'); // 'percentage' | 'amount'
  const [category, setCategory] = useState('purchase');
  const [description, setDescription] = useState('');

  const applyPreset = (preset) => {
    setType(preset.payload.type);
    if (preset.payload.amount !== undefined) setAmount(preset.payload.amount);
    if (preset.payload.percentage !== undefined) {
      setPercentage(preset.payload.percentage);
      setIncomeMode('percentage');
    }
    if (preset.payload.category) setCategory(preset.payload.category);
    if (preset.payload.description) setDescription(preset.payload.description);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { type };

    if (type === 'ONE_TIME_EXPENSE') {
      if (!amount || Number(amount) <= 0) return;
      payload.amount = Number(amount);
      payload.category = category;
      payload.description = description || 'One-time Outlay';
    } else if (type === 'MONTHLY_EXPENSE_CHANGE' || type === 'MONTHLY_INVESTMENT_CHANGE') {
      if (amount === '' || isNaN(Number(amount))) return;
      payload.amount = Number(amount);
      payload.description = description;
    } else if (type === 'MONTHLY_INCOME_CHANGE') {
      if (incomeMode === 'percentage') {
        if (percentage === '' || isNaN(Number(percentage))) return;
        payload.percentage = Number(percentage);
      } else {
        if (amount === '' || isNaN(Number(amount))) return;
        payload.amount = Number(amount);
      }
      payload.description = description;
    }

    onRunSimulation(payload);
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6 backdrop-blur-sm">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Configure Financial Decision</h3>
        </div>
        <p className="text-xs text-slate-400">
          Select a decision model and input your parameters to forecast immediate and ongoing consequences.
        </p>
      </div>

      {/* Quick Presets */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Quick Decision Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 bg-slate-900/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700/60 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Decision Type Grid */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Decision Model</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DECISION_TYPES.map((dt) => (
              <button
                key={dt.id}
                type="button"
                onClick={() => setType(dt.id)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  type === dt.id
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="font-semibold text-xs text-slate-100">{dt.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{dt.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Inputs based on type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/40">
          {type === 'ONE_TIME_EXPENSE' && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Expense Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 80000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="purchase">Purchase / Gadgets</option>
                  <option value="travel">Travel / Vacation</option>
                  <option value="emergency">Emergency / Health</option>
                  <option value="education">Education / Learning</option>
                  <option value="other">Other Outlay</option>
                </select>
              </div>
            </>
          )}

          {type === 'MONTHLY_EXPENSE_CHANGE' && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Monthly Expense Change (₹)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. +5000 (increase) or -3000 (cut)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Positive for increase, negative for spending reduction.</span>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Upgraded internet, higher rent"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {type === 'MONTHLY_INCOME_CHANGE' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Income Adjustment</label>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setIncomeMode('percentage')}
                      className={`px-2 py-0.5 rounded ${incomeMode === 'percentage' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncomeMode('amount')}
                      className={`px-2 py-0.5 rounded ${incomeMode === 'amount' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                      Fixed Amount (₹)
                    </button>
                  </div>
                </div>

                {incomeMode === 'percentage' ? (
                  <input
                    type="number"
                    min="-100"
                    max="500"
                    required
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="e.g. 15 (raise) or -20 (cut)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. New Job Offer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {type === 'MONTHLY_INVESTMENT_CHANGE' && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Monthly SIP Change (₹)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000 (increase SIP)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Positive for increased monthly SIP investment.</span>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Index Fund SIP Step-up"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          {loading ? 'Simulating Consequence...' : 'Run Decision Simulation'}
        </button>
      </form>
    </div>
  );
}

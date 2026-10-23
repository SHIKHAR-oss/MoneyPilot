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
    <div className="bg-white border border-[#E0E8E2] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="w-5 h-5 text-[#087F5B]" />
          <h3 className="text-base font-extrabold text-[#14251C]">Configure Financial Decision</h3>
        </div>
        <p className="text-xs text-[#64736A]">
          Select a decision model and input your parameters to forecast immediate and ongoing consequences.
        </p>
      </div>

      {/* Quick Presets */}
      <div>
        <span className="text-[11px] font-bold text-[#64736A] uppercase tracking-wider block mb-2">
          Quick Decision Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 bg-[#FAFCFA] hover:bg-[#ECFDF5] text-[#17251D] hover:text-[#087F5B] text-xs font-semibold rounded-xl border border-[#E0E8E2] hover:border-[#A7F3D0] transition-all shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Decision Type Grid */}
        <div>
          <label className="text-xs font-bold text-[#14251C] block mb-2">Decision Model</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DECISION_TYPES.map((dt) => (
              <button
                key={dt.id}
                type="button"
                onClick={() => setType(dt.id)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  type === dt.id
                    ? 'bg-[#ECFDF5] border-[#087F5B] text-[#087F5B] shadow-xs'
                    : 'bg-[#FAFCFA] border-[#E0E8E2] text-[#64736A] hover:bg-[#F4F8F5] hover:border-[#D1DED5]'
                }`}
              >
                <div className={`font-bold text-xs ${type === dt.id ? 'text-[#087F5B]' : 'text-[#14251C]'}`}>
                  {dt.label}
                </div>
                <div className={`text-[11px] mt-0.5 leading-snug ${type === dt.id ? 'text-[#066649]' : 'text-[#64736A]'}`}>
                  {dt.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Inputs based on type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E0E8E2]">
          {type === 'ONE_TIME_EXPENSE' && (
            <>
              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Expense Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 80000"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
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
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">
                  Monthly Expense Change (₹)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. +5000 (increase) or -3000 (cut)"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
                <span className="text-[11px] text-[#64736A] mt-1 block">Positive for increase, negative for spending reduction.</span>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Upgraded internet, higher rent"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>
            </>
          )}

          {type === 'MONTHLY_INCOME_CHANGE' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#14251C]">Income Adjustment</label>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIncomeMode('percentage')}
                      className={`px-2.5 py-0.5 rounded-lg font-semibold transition-all ${incomeMode === 'percentage' ? 'bg-[#087F5B] text-white shadow-xs' : 'bg-[#F4F8F5] text-[#64736A] border border-[#E0E8E2]'}`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncomeMode('amount')}
                      className={`px-2.5 py-0.5 rounded-lg font-semibold transition-all ${incomeMode === 'amount' ? 'bg-[#087F5B] text-white shadow-xs' : 'bg-[#F4F8F5] text-[#64736A] border border-[#E0E8E2]'}`}
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
                    className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                  />
                ) : (
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. New Job Offer"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>
            </>
          )}

          {type === 'MONTHLY_INVESTMENT_CHANGE' && (
            <>
              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">
                  Monthly SIP Change (₹)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000 (increase SIP)"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
                <span className="text-[11px] text-[#64736A] mt-1 block">Positive for increased monthly SIP investment.</span>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Index Fund SIP Step-up"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#087F5B] hover:bg-[#066649] disabled:bg-[#D1DED5] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
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

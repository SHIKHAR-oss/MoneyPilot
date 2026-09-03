import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Edit2, Trash2, X, Wallet, RefreshCw } from 'lucide-react';
import api from '../services/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import Badge from '../components/common/Badge.jsx';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Mutual Fund',
    currentValue: '',
    monthlyContribution: ''
  });

  const fetchInvestments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.investments.getAll();
      if (res?.data?.investments) {
        setInvestments(res.data.investments);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch investments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const totalValue = investments.reduce((acc, curr) => acc + (Number(curr.currentValue) || 0), 0);
  const totalMonthlySip = investments.reduce((acc, curr) => acc + (Number(curr.monthlyContribution) || 0), 0);

  const handleOpenAdd = () => {
    setEditingInv(null);
    setFormData({
      name: '',
      type: 'Mutual Fund',
      currentValue: '',
      monthlyContribution: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingInv(inv);
    setFormData({
      name: inv.name,
      type: inv.type,
      currentValue: inv.currentValue,
      monthlyContribution: inv.monthlyContribution || '0'
    });
    setIsModalOpen(true);
  };

  const handleSaveInvestment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        currentValue: Number(formData.currentValue),
        monthlyContribution: Number(formData.monthlyContribution || 0)
      };

      if (editingInv) {
        await api.investments.update(editingInv._id, payload);
      } else {
        await api.investments.create(payload);
      }
      setIsModalOpen(false);
      fetchInvestments();
    } catch (err) {
      setError(err.message || 'Error saving investment record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvestment = async () => {
    if (!deleteTargetId) return;
    try {
      await api.investments.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchInvestments();
    } catch (err) {
      setError(err.message || 'Error deleting investment.');
    }
  };

  const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Investments & Portfolio</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track asset holdings and monthly SIP contributions feeding net worth and health scoring.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Investment
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchInvestments} />}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex items-center justify-between backdrop-blur-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Portfolio Value</span>
            <div className="text-2xl font-extrabold text-white mt-1">{formatCurrency(totalValue)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex items-center justify-between backdrop-blur-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Monthly SIP</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{formatCurrency(totalMonthlySip)}<span className="text-xs font-normal text-slate-400">/mo</span></div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Investment List */}
      {loading ? (
        <LoadingSpinner message="Loading investment portfolio..." />
      ) : investments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No Investments Recorded"
          description="Record mutual funds, index funds, stocks, fixed deposits, or gold to track your net worth."
          actionText="Add Investment Asset"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {investments.map((inv) => (
            <div
              key={inv._id}
              className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 backdrop-blur-sm hover:border-slate-600/80 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white leading-snug">{inv.name}</h3>
                  <Badge variant="purple" size="xs">{inv.type}</Badge>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Current Value:</span>
                  <span className="font-extrabold text-white text-sm">{formatCurrency(inv.currentValue)}</span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Monthly Contribution:</span>
                  <span className="font-semibold text-emerald-400">{formatCurrency(inv.monthlyContribution || 0)}/mo</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/60">
                <button
                  onClick={() => handleOpenEdit(inv)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(inv._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Investment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingInv ? 'Edit Investment Asset' : 'Add Investment Asset'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvestment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Asset Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Nifty 50 Index Fund"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Asset Type</label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g. Mutual Fund, Stocks, Gold, Fixed Deposit, Crypto"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Current Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="e.g. 250000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Monthly SIP / Recurring Addition (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  placeholder="e.g. 10000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {submitting ? 'Saving...' : editingInv ? 'Update Investment' : 'Save Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Investment Record"
        message="Are you sure you want to remove this investment record? This will adjust your total net worth."
        confirmText="Delete Record"
        onConfirm={handleDeleteInvestment}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

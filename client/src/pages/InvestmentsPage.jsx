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
            <TrendingUp className="w-6 h-6 text-[#087F5B]" />
            <h1 className="text-2xl font-bold text-[#14251C] tracking-tight">Investments & Portfolio</h1>
          </div>
          <p className="text-xs text-[#64736A] mt-1">
            Track asset holdings and monthly SIP contributions feeding net worth and health scoring.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#087F5B] hover:bg-[#066649] text-white text-xs font-bold rounded-xl transition-all shadow-sm self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Investment
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchInvestments} />}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E0E8E2] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64736A] uppercase tracking-wider">Total Portfolio Value</span>
            <div className="text-2xl font-extrabold text-[#17251D] mt-1 tabular-nums">{formatCurrency(totalValue)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E0E8E2] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64736A] uppercase tracking-wider">Total Monthly SIP</span>
            <div className="text-2xl font-extrabold text-[#087F5B] mt-1 tabular-nums">{formatCurrency(totalMonthlySip)}<span className="text-xs font-normal text-[#64736A]">/mo</span></div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/60 flex items-center justify-center text-[#087F5B]">
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
              className="bg-white border border-[#E0E8E2] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#A7F3D0] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#17251D] leading-snug">{inv.name}</h3>
                  <Badge variant="purple" size="xs">{inv.type}</Badge>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#64736A]">Current Value:</span>
                  <span className="font-bold text-[#17251D] text-sm tabular-nums">{formatCurrency(inv.currentValue)}</span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#64736A]">Monthly Contribution:</span>
                  <span className="font-semibold text-[#087F5B] tabular-nums">{formatCurrency(inv.monthlyContribution || 0)}/mo</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E8E2]">
                <button
                  onClick={() => handleOpenEdit(inv)}
                  className="p-1.5 text-[#64736A] hover:text-[#087F5B] hover:bg-[#ECFDF5] rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(inv._id)}
                  className="p-1.5 text-[#64736A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E0E8E2] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0E8E2]">
              <h3 className="text-base font-bold text-[#14251C]">
                {editingInv ? 'Edit Investment Asset' : 'Add Investment Asset'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#64736A] hover:text-[#17251D] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvestment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#17251D] block mb-1.5">Asset Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Nifty 50 Index Fund"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#17251D] block mb-1.5">Asset Type</label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g. Mutual Fund, Stocks, Gold, Fixed Deposit, Crypto"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#17251D] block mb-1.5">Current Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="e.g. 250000"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#17251D] block mb-1.5">
                  Monthly SIP / Recurring Addition (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  placeholder="e.g. 10000"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B] transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E0E8E2] bg-white hover:bg-[#F4F8F5] text-[#64736A] hover:text-[#17251D] text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#087F5B] hover:bg-[#066649] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
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

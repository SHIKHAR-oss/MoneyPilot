import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  Filter,
  X,
  Calendar
} from 'lucide-react';
import api from '../services/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import Badge from '../components/common/Badge.jsx';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState(''); // '' | 'income' | 'expense'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food / Dining',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.transactions.getAll({ type: filterType });
      if (res?.data?.transactions) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setFormData({
      type: 'expense',
      amount: '',
      category: 'Food / Dining',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setFormData({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description || '',
      date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingTx) {
        await api.transactions.update(editingTx._id, {
          ...formData,
          amount: Number(formData.amount)
        });
      } else {
        await api.transactions.create({
          ...formData,
          amount: Number(formData.amount)
        });
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err) {
      setError(err.message || 'Error saving transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTargetId) return;
    try {
      await api.transactions.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchTransactions();
    } catch (err) {
      setError(err.message || 'Error deleting transaction.');
    }
  };

  const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-[#087F5B]" />
            <h1 className="text-2xl font-black text-[#14251C] tracking-tight">Transactions Ledger</h1>
          </div>
          <p className="text-xs text-[#64736A] mt-1">
            Record actual income and expense cash movements feeding the deterministic engine.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#087F5B] hover:bg-[#066649] text-white text-xs font-bold rounded-xl transition-all shadow-sm self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchTransactions} />}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E0E8E2] pb-3">
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === '' ? 'bg-[#087F5B] text-white shadow-xs' : 'bg-white text-[#64736A] hover:text-[#17251D] border border-[#E0E8E2]'
          }`}
        >
          All Transactions
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === 'income' ? 'bg-[#ECFDF5] text-[#087F5B] border border-[#A7F3D0] shadow-xs' : 'bg-white text-[#64736A] hover:text-[#087F5B] border border-[#E0E8E2]'
          }`}
        >
          Income Only
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === 'expense' ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] shadow-xs' : 'bg-white text-[#64736A] hover:text-[#DC2626] border border-[#E0E8E2]'
          }`}
        >
          Expenses Only
        </button>
      </div>

      {/* Transactions Table / List */}
      {loading ? (
        <LoadingSpinner message="Fetching transactions..." />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Transactions Recorded"
          description="Add your recent income or expense transactions to feed the financial engine."
          actionText="Add Transaction"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white border border-[#E0E8E2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0E8E2] bg-[#F4F8F5] text-[11px] font-bold text-[#64736A] uppercase tracking-wider">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E8E2] text-xs">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-[#F4F8F5]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold">
                      <Badge variant={tx.type === 'income' ? 'success' : 'danger'} size="xs">
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#14251C]">{tx.category}</td>
                    <td className="py-3 px-4 text-[#64736A]">{tx.description || '—'}</td>
                    <td className="py-3 px-4 text-[#859188] tabular-nums">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-black text-sm tabular-nums ${
                        tx.type === 'income' ? 'text-[#087F5B]' : 'text-[#DC2626]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 text-[#859188] hover:text-[#087F5B] hover:bg-[#ECFDF5] rounded-lg transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(tx._id)}
                        className="p-1.5 text-[#859188] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E0E8E2] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E8E2]">
              <h3 className="text-base font-extrabold text-[#14251C]">
                {editingTx ? 'Edit Transaction' : 'Record New Transaction'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#859188] hover:text-[#17251D] p-1 rounded-lg hover:bg-[#F4F8F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'expense'
                        ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] shadow-xs'
                        : 'bg-[#FAFCFA] text-[#64736A] border-[#E0E8E2]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'income'
                        ? 'bg-[#ECFDF5] text-[#087F5B] border-[#A7F3D0] shadow-xs'
                        : 'bg-[#FAFCFA] text-[#64736A] border-[#E0E8E2]'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 2500"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Groceries, Rent, Salary, Freelance"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Supermarket weekly haul"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E0E8E2] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#F4F8F5] text-[#64736A] hover:text-[#17251D] text-xs font-semibold rounded-xl border border-[#E0E8E2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#087F5B] hover:bg-[#066649] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {submitting ? 'Saving...' : editingTx ? 'Update Transaction' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Transaction"
        message="Are you sure you want to remove this transaction record? This will adjust your calculated cash flow."
        confirmText="Delete Transaction"
        onConfirm={handleDeleteTransaction}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

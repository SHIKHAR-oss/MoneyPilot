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
            <Receipt className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Transactions Ledger</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Record actual income and expense cash movements feeding the deterministic engine.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchTransactions} />}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterType === '' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Transactions
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'income' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Income Only
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'expense' ? 'bg-rose-600/30 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
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
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-900/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 font-semibold">
                      <Badge variant={tx.type === 'income' ? 'success' : 'danger'} size="xs">
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{tx.category}</td>
                    <td className="py-3 px-4 text-slate-300">{tx.description || '—'}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-extrabold text-sm ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(tx._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingTx ? 'Edit Transaction' : 'Record New Transaction'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'expense'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 2500"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Groceries, Rent, Salary, Freelance"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Supermarket weekly haul"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

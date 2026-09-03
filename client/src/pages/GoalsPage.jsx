import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, Calendar, X, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import Badge from '../components/common/Badge.jsx';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'purchase'
  });

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.goals.getAll();
      if (res?.data?.goals) {
        setGoals(res.data.goals);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch financial goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: '',
      category: 'purchase'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || '0',
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      category: goal.category || 'other'
    });
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
        category: formData.category
      };

      if (editingGoal) {
        await api.goals.update(editingGoal._id, payload);
      } else {
        await api.goals.create(payload);
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Error saving financial goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteTargetId) return;
    try {
      await api.goals.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Error deleting goal.');
    }
  };

  const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Target className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Financial Goals</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Target savings milestones feeding your Financial Health Score calculation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchGoals} />}

      {loading ? (
        <LoadingSpinner message="Loading financial goals..." />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Financial Goals Configured"
          description="Create target milestones (e.g. Home Downpayment, Emergency Reserve, Vacation) to track your progress."
          actionText="Create First Goal"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) || 0;
            return (
              <div
                key={g._id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 backdrop-blur-sm hover:border-slate-600/80 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug">{g.name}</h3>
                    <Badge variant="info" size="xs">{g.category}</Badge>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Target Amount:</span>
                    <span className="font-bold text-white text-sm">{formatCurrency(g.targetAmount)}</span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Funded so far:</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(g.currentAmount)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-emerald-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/40">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  {g.targetDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target: {new Date(g.targetDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/60">
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(g._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingGoal ? 'Edit Financial Goal' : 'Create New Financial Goal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Goal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Home Downpayment"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Current Amount Funded (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="e.g. 150000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="purchase">Purchase / Vehicle / Property</option>
                  <option value="emergency">Emergency Reserve</option>
                  <option value="education">Higher Education</option>
                  <option value="travel">Travel / Vacation</option>
                  <option value="investment">Long-Term Investment</option>
                  <option value="other">Other Milestone</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
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
                  {submitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Financial Goal"
        message="Are you sure you want to delete this goal milestone? This will update your goal progress score."
        confirmText="Delete Goal"
        onConfirm={handleDeleteGoal}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

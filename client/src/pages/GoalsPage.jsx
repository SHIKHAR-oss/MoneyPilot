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
            <Target className="w-6 h-6 text-[#087F5B]" />
            <h1 className="text-2xl font-black text-[#14251C] tracking-tight">Financial Goals</h1>
          </div>
          <p className="text-xs text-[#64736A] mt-1">
            Target savings milestones feeding your Financial Health Score calculation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#087F5B] hover:bg-[#066649] text-white text-xs font-bold rounded-xl transition-all shadow-sm self-start sm:self-center"
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
                className="bg-white border border-[#E0E8E2] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#087F5B]/30 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#14251C] leading-snug">{g.name}</h3>
                    <Badge variant="info" size="xs">{g.category}</Badge>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[#64736A]">Target Amount:</span>
                    <span className="font-extrabold text-[#17251D] text-sm tabular-nums">{formatCurrency(g.targetAmount)}</span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[#64736A]">Funded so far:</span>
                    <span className="font-bold text-[#087F5B] tabular-nums">{formatCurrency(g.currentAmount)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-[#64736A]">Progress</span>
                      <span className="text-[#087F5B] font-extrabold tabular-nums">{pct}%</span>
                    </div>
                    <div className="w-full bg-[#ECFDF5] h-2 rounded-full overflow-hidden border border-[#A7F3D0]/60">
                      <div
                        className="bg-[#087F5B] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  {g.targetDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#859188] pt-1">
                      <Calendar className="w-3.5 h-3.5 text-[#087F5B]" />
                      <span>Target: {new Date(g.targetDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-[#E0E8E2]">
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="p-1.5 text-[#859188] hover:text-[#087F5B] hover:bg-[#ECFDF5] rounded-lg transition-colors"
                    title="Edit Goal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(g._id)}
                    className="p-1.5 text-[#859188] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                    title="Delete Goal"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E0E8E2] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E8E2]">
              <h3 className="text-base font-extrabold text-[#14251C]">
                {editingGoal ? 'Edit Financial Goal' : 'Create New Financial Goal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#859188] hover:text-[#17251D] p-1 rounded-lg hover:bg-[#F4F8F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Goal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Home Downpayment"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Target Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="e.g. 500000"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Current Amount Funded (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="e.g. 150000"
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17251D] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
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
                <label className="text-xs font-bold text-[#14251C] block mb-1.5">Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
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

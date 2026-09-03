import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Shield,
  CreditCard,
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import api from '../services/api.js';
import HealthScoreCard from '../components/dashboard/HealthScoreCard.jsx';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import RiskAlertBanner from '../components/dashboard/RiskAlertBanner.jsx';
import FinancialCharts from '../components/dashboard/FinancialCharts.jsx';
import AIOverviewPanel from '../components/dashboard/AIOverviewPanel.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.financial.getOverview();
      if (response?.data) {
        setData(response.data);
      }
    } catch (err) {
      console.error('[Dashboard] Failed to fetch overview:', err);
      setError(err.message || 'Unable to connect to the Financial Intelligence Engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating deterministic financial intelligence..." size="lg" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} onRetry={fetchOverview} />
      </div>
    );
  }

  const { metrics, healthScore, risks, breakdown } = data || {};

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Financial Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          Deterministic metrics, health score breakdown, and risk analysis.
        </p>
      </div>

      {/* Primary Financial Health Score */}
      <HealthScoreCard healthScore={healthScore} />

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Monthly Cash Flow"
          value={formatCurrency(metrics?.monthlyCashFlow)}
          subtitle={
            metrics?.monthlyCashFlow >= 0 ? (
              <span className="text-emerald-400 flex items-center font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" /> Positive Surplus
              </span>
            ) : (
              <span className="text-rose-400 flex items-center font-medium">
                <ArrowDownRight className="w-3.5 h-3.5" /> Monthly Deficit
              </span>
            )
          }
          icon={DollarSign}
          color={metrics?.monthlyCashFlow >= 0 ? 'emerald' : 'rose'}
        />

        <MetricCard
          title="Savings Rate"
          value={`${metrics?.savingsRate || 0}%`}
          subtitle="Percentage of income saved"
          icon={TrendingUp}
          color="blue"
        />

        <MetricCard
          title="Emergency Reserve"
          value={`${metrics?.emergencyFundCoverage || 0} mo`}
          subtitle={`Total Buffer: ${formatCurrency(metrics?.emergencyFund)}`}
          icon={Shield}
          color="purple"
        />

        <MetricCard
          title="Total Net Worth"
          value={formatCurrency(metrics?.netWorth)}
          subtitle="Savings + Investment Value"
          icon={Wallet}
          color="emerald"
        />

        <MetricCard
          title="Monthly Income"
          value={formatCurrency(metrics?.monthlyIncome)}
          subtitle="Ledger & Base Income"
          icon={ArrowUpRight}
          color="blue"
        />

        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(metrics?.monthlyExpenses)}
          subtitle={`Expense Ratio: ${metrics?.expenseToIncomeRatio || 0}%`}
          icon={CreditCard}
          color="amber"
        />
      </div>

      {/* Visual Analytics Charts */}
      <FinancialCharts metrics={metrics} breakdown={breakdown} />

      {/* Active Financial Risks */}
      <RiskAlertBanner risks={risks} />

      {/* AI Explanation Layer Panel */}
      <AIOverviewPanel />
    </div>
  );
}

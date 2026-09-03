import { round, safeDivide } from '../utils/mathHelpers.js';

/**
 * Pure Deterministic Financial Metrics Engine
 * Computes core financial ratios, cash flow, coverage metrics, and net worth
 *
 * @param {object} financialData - Aggregated data from financialDataService
 * @returns {object} Core financial metrics
 */
export const calculateFinancialMetrics = (financialData) => {
  const { profile, ledger, investments, goals } = financialData;

  const monthlyIncome = ledger.effectiveMonthlyIncome;
  const monthlyExpenses = ledger.effectiveMonthlyExpenses;
  const emergencyFund = profile.emergencyFund;
  const currentSavings = profile.currentSavings;
  const totalInvestmentValue = investments.totalValue;

  // 1. Monthly Cash Flow
  const monthlyCashFlow = round(monthlyIncome - monthlyExpenses);

  // 2. Savings Rate (%)
  let savingsRate = 0;
  if (monthlyIncome > 0) {
    savingsRate = round(safeDivide(monthlyCashFlow, monthlyIncome, 0) * 100);
  }

  // 3. Expense-to-Income Ratio (%)
  let expenseToIncomeRatio = 0;
  if (monthlyIncome > 0) {
    expenseToIncomeRatio = round(safeDivide(monthlyExpenses, monthlyIncome, 0) * 100);
  }

  // 4. Emergency Fund Coverage (in months of essential expenses)
  let emergencyFundCoverage = 0;
  if (monthlyExpenses > 0) {
    emergencyFundCoverage = round(safeDivide(emergencyFund, monthlyExpenses, 0), 1);
  } else if (emergencyFund > 0) {
    // If user has emergency funds but 0 recorded expenses, coverage is effectively unlimited
    emergencyFundCoverage = 999;
  }

  // 5. Goal Progress
  const totalGoalTarget = goals.totalTargetAmount;
  const totalGoalCurrent = goals.totalCurrentAmount;
  const overallGoalProgress = round(safeDivide(totalGoalCurrent, totalGoalTarget, 0) * 100);

  const goalBreakdown = goals.items.map((g) => ({
    id: g._id,
    name: g.name,
    category: g.category,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    targetDate: g.targetDate,
    progressPercentage: round(safeDivide(g.currentAmount, g.targetAmount, 0) * 100)
  }));

  // 6. Net Worth (Savings + Investment Portfolio)
  const netWorth = round(currentSavings + totalInvestmentValue);

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyCashFlow,
    savingsRate,
    expenseToIncomeRatio,
    emergencyFund,
    emergencyFundCoverage,
    currentSavings,
    totalInvestmentValue,
    netWorth,
    goals: {
      overallProgress: overallGoalProgress,
      totalTargetAmount: totalGoalTarget,
      totalCurrentAmount: totalGoalCurrent,
      items: goalBreakdown
    }
  };
};

export default {
  calculateFinancialMetrics
};

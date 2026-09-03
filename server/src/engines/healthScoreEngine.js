import { round, clamp } from '../utils/mathHelpers.js';

/**
 * Transparent & Deterministic Financial Health Score Engine
 * Computes an explainable 0-100 score across 5 core financial pillars
 *
 * @param {object} metrics - Calculated metrics from metricsEngine
 * @param {object} rawData - Normalized data from financialDataService
 * @returns {object} Comprehensive health score and component breakdown
 */
export const calculateFinancialHealthScore = (metrics, rawData) => {
  const {
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    expenseToIncomeRatio,
    emergencyFundCoverage,
    emergencyFund,
    currentSavings,
    totalInvestmentValue
  } = metrics;

  const { investments, goals } = rawData;

  // ==========================================
  // Pillar 1: Savings Rate (Max: 25 Points)
  // ==========================================
  let savingsScore = 0;
  let savingsReason = '';

  if (monthlyIncome <= 0) {
    if (monthlyExpenses > 0) {
      savingsScore = 0;
      savingsReason = 'No active income recorded while incurring expenses.';
    } else {
      savingsScore = 12.5;
      savingsReason = 'Income and expenses not yet recorded.';
    }
  } else if (savingsRate >= 25) {
    savingsScore = 25;
    savingsReason = `Excellent savings rate of ${savingsRate}%, building wealth rapidly.`;
  } else if (savingsRate >= 15) {
    savingsScore = round(18 + ((savingsRate - 15) / 10) * 7);
    savingsReason = `Good savings rate of ${savingsRate}%, meeting healthy financial benchmarks.`;
  } else if (savingsRate >= 5) {
    savingsScore = round(10 + ((savingsRate - 5) / 10) * 8);
    savingsReason = `Moderate savings rate of ${savingsRate}%; potential to optimize discretionary spending.`;
  } else if (savingsRate >= 0) {
    savingsScore = round(5 + (savingsRate / 5) * 5);
    savingsReason = `Low savings rate of ${savingsRate}%; operating close to monthly cash flow limits.`;
  } else {
    savingsScore = 0;
    savingsReason = `Negative savings rate (${savingsRate}%); monthly expenses exceed total income.`;
  }
  savingsScore = clamp(savingsScore, 0, 25);

  // ==========================================
  // Pillar 2: Emergency Fund Coverage (Max: 25 Points)
  // ==========================================
  let emergencyScore = 0;
  let emergencyReason = '';

  if (monthlyExpenses <= 0) {
    if (emergencyFund > 0) {
      emergencyScore = 25;
      emergencyReason = `Emergency fund of ₹${emergencyFund.toLocaleString()} with zero recorded recurring expenses.`;
    } else {
      emergencyScore = 12.5;
      emergencyReason = 'No emergency fund or expense data configured.';
    }
  } else if (emergencyFundCoverage >= 6) {
    emergencyScore = 25;
    emergencyReason = `Optimal emergency cushion with ${emergencyFundCoverage} months of expense coverage.`;
  } else if (emergencyFundCoverage >= 3) {
    emergencyScore = round(18 + ((emergencyFundCoverage - 3) / 3) * 7);
    emergencyReason = `Adequate emergency fund covering ${emergencyFundCoverage} months of essential expenses.`;
  } else if (emergencyFundCoverage >= 1) {
    emergencyScore = round(10 + ((emergencyFundCoverage - 1) / 2) * 8);
    emergencyReason = `Vulnerable emergency buffer of ${emergencyFundCoverage} months; target at least 3-6 months.`;
  } else if (emergencyFundCoverage > 0) {
    emergencyScore = round(emergencyFundCoverage * 9);
    emergencyReason = `High risk: Less than 1 month (${emergencyFundCoverage} mo) of living expenses covered.`;
  } else {
    emergencyScore = 0;
    emergencyReason = 'Critical: No emergency fund available to absorb financial shocks.';
  }
  emergencyScore = clamp(emergencyScore, 0, 25);

  // ==========================================
  // Pillar 3: Cash Flow & Expense Ratio (Max: 20 Points)
  // ==========================================
  let cashFlowScore = 0;
  let cashFlowReason = '';

  if (monthlyIncome <= 0) {
    if (monthlyExpenses > 0) {
      cashFlowScore = 0;
      cashFlowReason = 'Cash flow deficit with zero recorded income.';
    } else {
      cashFlowScore = 10;
      cashFlowReason = 'Cash flow baseline unconfigured.';
    }
  } else if (expenseToIncomeRatio <= 50) {
    cashFlowScore = 20;
    cashFlowReason = `Strong cash flow cushion with expenses taking only ${expenseToIncomeRatio}% of income.`;
  } else if (expenseToIncomeRatio <= 70) {
    cashFlowScore = round(15 + ((70 - expenseToIncomeRatio) / 20) * 5);
    cashFlowReason = `Healthy spending balance consuming ${expenseToIncomeRatio}% of monthly income.`;
  } else if (expenseToIncomeRatio <= 90) {
    cashFlowScore = round(10 + ((90 - expenseToIncomeRatio) / 20) * 5);
    cashFlowReason = `High fixed spending taking ${expenseToIncomeRatio}% of income; limited flexibility.`;
  } else if (expenseToIncomeRatio <= 100) {
    cashFlowScore = round(5 + ((100 - expenseToIncomeRatio) / 10) * 5);
    cashFlowReason = `Very tight cash flow at ${expenseToIncomeRatio}% expense ratio; paycheck-to-paycheck exposure.`;
  } else {
    cashFlowScore = 0;
    cashFlowReason = `Spending exceeds income at ${expenseToIncomeRatio}% expense ratio.`;
  }
  cashFlowScore = clamp(cashFlowScore, 0, 20);

  // ==========================================
  // Pillar 4: Goal Progress (Max: 15 Points)
  // ==========================================
  let goalScore = 0;
  let goalReason = '';

  if (goals.count === 0) {
    goalScore = 7.5;
    goalReason = 'No active financial goals configured.';
  } else {
    const avgProgress = metrics.goals.overallProgress;
    if (avgProgress >= 75) {
      goalScore = 15;
      goalReason = `Excellent milestone progress averaging ${avgProgress}% across active goals.`;
    } else if (avgProgress >= 50) {
      goalScore = round(12 + ((avgProgress - 50) / 25) * 3);
      goalReason = `Steady progress averaging ${avgProgress}% toward defined financial targets.`;
    } else if (avgProgress >= 25) {
      goalScore = round(8 + ((avgProgress - 25) / 25) * 4);
      goalReason = `Early-stage goal accumulation averaging ${avgProgress}%.`;
    } else if (avgProgress > 0) {
      goalScore = round(5 + (avgProgress / 25) * 3);
      goalReason = `Initial funding underway across goals at ${avgProgress}%.`;
    } else {
      goalScore = 2;
      goalReason = `${goals.count} goal(s) established, but no capital funded yet.`;
    }
  }
  goalScore = clamp(goalScore, 0, 15);

  // ==========================================
  // Pillar 5: Investment Position (Max: 15 Points)
  // ==========================================
  let investmentScore = 0;
  let investmentReason = '';

  const monthlySip = investments.totalMonthlyContribution;
  if (totalInvestmentValue > 0 && monthlySip > 0) {
    investmentScore = 15;
    investmentReason = `Active portfolio of ₹${totalInvestmentValue.toLocaleString()} with recurring monthly contributions of ₹${monthlySip.toLocaleString()}.`;
  } else if (totalInvestmentValue > 0) {
    investmentScore = 10;
    investmentReason = `Portfolio of ₹${totalInvestmentValue.toLocaleString()} held without regular monthly additions.`;
  } else if (currentSavings > 0) {
    investmentScore = 5;
    investmentReason = `Liquid savings of ₹${currentSavings.toLocaleString()} available, but no invested assets.`;
  } else {
    investmentScore = 0;
    investmentReason = 'No liquid savings or investment portfolio recorded.';
  }
  investmentScore = clamp(investmentScore, 0, 15);

  // ==========================================
  // Total Score & Tier Classification
  // ==========================================
  const totalScore = Math.round(
    clamp(savingsScore + emergencyScore + cashFlowScore + goalScore + investmentScore, 0, 100)
  );

  let rating = 'Fair';
  if (totalScore >= 80) rating = 'Excellent';
  else if (totalScore >= 65) rating = 'Good';
  else if (totalScore >= 50) rating = 'Fair';
  else if (totalScore >= 35) rating = 'Needs Attention';
  else rating = 'Critical';

  return {
    score: totalScore,
    rating,
    components: {
      savingsRate: {
        score: savingsScore,
        maxScore: 25,
        reason: savingsReason
      },
      emergencyFund: {
        score: emergencyScore,
        maxScore: 25,
        reason: emergencyReason
      },
      cashFlow: {
        score: cashFlowScore,
        maxScore: 20,
        reason: cashFlowReason
      },
      goalProgress: {
        score: goalScore,
        maxScore: 15,
        reason: goalReason
      },
      investmentPosition: {
        score: investmentScore,
        maxScore: 15,
        reason: investmentReason
      }
    }
  };
};

export default {
  calculateFinancialHealthScore
};

import { round } from '../utils/mathHelpers.js';

/**
 * Deterministic Financial Risk Detection Engine
 * Evaluates baseline vulnerabilities and simulation shock risks
 */

/**
 * Detects baseline risks on current financial state
 * @param {object} metrics - Current metrics from metricsEngine
 * @param {object} healthScore - Health score breakdown from healthScoreEngine
 * @returns {Array<object>} Detected baseline risks
 */
export const detectBaselineRisks = (metrics, healthScore) => {
  const risks = [];

  // 1. Critical: Negative Monthly Cash Flow
  if (metrics.monthlyCashFlow < 0) {
    risks.push({
      severity: 'CRITICAL',
      title: 'Cash Flow Deficit',
      explanation: `Monthly spending exceeds income by ₹${Math.abs(metrics.monthlyCashFlow).toLocaleString()}. You are draining capital reserves each month.`,
      affectedMetric: 'monthlyCashFlow'
    });
  }

  // 2. Critical/High: Emergency Fund Coverage
  if (metrics.monthlyExpenses > 0) {
    if (metrics.emergencyFundCoverage < 1) {
      risks.push({
        severity: 'CRITICAL',
        title: 'Severe Emergency Vulnerability',
        explanation: `Emergency fund covers only ${metrics.emergencyFundCoverage} months of expenses. A minor financial shock could cause immediate distress.`,
        affectedMetric: 'emergencyFundCoverage'
      });
    } else if (metrics.emergencyFundCoverage < 3) {
      risks.push({
        severity: 'HIGH',
        title: 'Insufficient Emergency Buffer',
        explanation: `Emergency reserve covers ${metrics.emergencyFundCoverage} months of expenses. Recommended safe target is at least 3-6 months.`,
        affectedMetric: 'emergencyFundCoverage'
      });
    }
  }

  // 3. High/Medium: Expense-to-Income Ratio
  if (metrics.monthlyIncome > 0) {
    if (metrics.expenseToIncomeRatio > 90) {
      risks.push({
        severity: 'HIGH',
        title: 'High Fixed Expense Burden',
        explanation: `Living expenses consume ${metrics.expenseToIncomeRatio}% of monthly income, leaving negligible room for emergencies or investment.`,
        affectedMetric: 'expenseToIncomeRatio'
      });
    } else if (metrics.expenseToIncomeRatio > 75) {
      risks.push({
        severity: 'MEDIUM',
        title: 'Elevated Expense Ratio',
        explanation: `Expenses consume ${metrics.expenseToIncomeRatio}% of income. Aim to maintain expenses below 70-80% for resilience.`,
        affectedMetric: 'expenseToIncomeRatio'
      });
    }
  }

  // 4. Medium: Low Savings Rate
  if (metrics.monthlyIncome > 0 && metrics.savingsRate >= 0 && metrics.savingsRate < 10) {
    risks.push({
      severity: 'MEDIUM',
      title: 'Low Savings Rate',
      explanation: `Current savings rate is only ${metrics.savingsRate}%. Recommended minimum savings rate is 20%.`,
      affectedMetric: 'savingsRate'
    });
  }

  // 5. Info: Missing Goals or Unconfigured Profile
  if (metrics.goals.items.length === 0) {
    risks.push({
      severity: 'INFO',
      title: 'No Active Goals',
      explanation: 'No financial goals defined. Setting concrete targets helps prioritize savings and investments.',
      affectedMetric: 'goals'
    });
  }

  return risks;
};

/**
 * Detects simulation-specific risks and delta alerts
 * @param {object} before - Pre-simulation metrics & score
 * @param {object} after - Post-simulation metrics & score
 * @param {object} changes - Computed deltas
 * @param {object} decision - User decision object
 * @returns {Array<object>} Simulation shock risks
 */
export const detectSimulationRisks = (before, after, changes, decision) => {
  const risks = [];

  // 1. Critical: Capital Deficit (Liquid reserves wiped out)
  if (after.currentSavings < 0 || (after.currentSavings === 0 && after.emergencyFund < 0)) {
    const deficit = Math.abs(after.currentSavings + Math.min(0, after.emergencyFund));
    risks.push({
      severity: 'CRITICAL',
      title: 'Excessive Outlay / Capital Deficit',
      explanation: `This one-time expense exceeds your combined available savings and emergency funds by ₹${deficit.toLocaleString()}.`,
      affectedMetric: 'currentSavings'
    });
  }

  // 2. Critical: Simulation creates a monthly cash flow deficit
  if (before.monthlyCashFlow >= 0 && after.monthlyCashFlow < 0) {
    risks.push({
      severity: 'CRITICAL',
      title: 'Triggers Monthly Cash Deficit',
      explanation: `This change turns your positive cash flow into a monthly deficit of ₹${Math.abs(after.monthlyCashFlow).toLocaleString()}.`,
      affectedMetric: 'monthlyCashFlow'
    });
  }

  // 3. High: Emergency Coverage drops below safe 3-month threshold
  if (before.emergencyFundCoverage >= 3 && after.emergencyFundCoverage < 3) {
    risks.push({
      severity: 'HIGH',
      title: 'Emergency Buffer Compromised',
      explanation: `This decision reduces your emergency cushion from ${before.emergencyFundCoverage} to ${after.emergencyFundCoverage} months of expenses.`,
      affectedMetric: 'emergencyFundCoverage'
    });
  }

  // 4. High: Major Health Score Drop (>= 15 points)
  if (changes.healthScoreChange <= -15) {
    risks.push({
      severity: 'HIGH',
      title: 'Significant Health Score Drop',
      explanation: `Your Financial Health Score drops by ${Math.abs(changes.healthScoreChange)} points (from ${before.healthScore} to ${after.healthScore}).`,
      affectedMetric: 'healthScore'
    });
  } else if (changes.healthScoreChange <= -7) {
    risks.push({
      severity: 'MEDIUM',
      title: 'Moderate Health Score Decline',
      explanation: `Your Financial Health Score declines by ${Math.abs(changes.healthScoreChange)} points (from ${before.healthScore} to ${after.healthScore}).`,
      affectedMetric: 'healthScore'
    });
  }

  // 5. High: Monthly investment exceeds free cash flow
  if (decision.type === 'MONTHLY_INVESTMENT_CHANGE' && decision.amount > 0) {
    if (decision.amount > before.monthlyCashFlow) {
      risks.push({
        severity: 'HIGH',
        title: 'Investment Exceeds Available Cash Flow',
        explanation: `Proposed monthly investment of ₹${decision.amount.toLocaleString()} exceeds your current monthly surplus of ₹${before.monthlyCashFlow.toLocaleString()}.`,
        affectedMetric: 'monthlyCashFlow'
      });
    }
  }

  return risks;
};

export default {
  detectBaselineRisks,
  detectSimulationRisks
};

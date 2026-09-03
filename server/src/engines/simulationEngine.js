import { round, sanitizeNumber, clamp, safeDivide } from '../utils/mathHelpers.js';
import { calculateFinancialMetrics } from './metricsEngine.js';
import { calculateFinancialHealthScore } from './healthScoreEngine.js';
import { detectSimulationRisks } from './riskEngine.js';

/**
 * Deterministic Decision Simulation Engine
 * Executes structured financial 'what-if' scenarios and returns Before vs After comparisons
 *
 * @param {object} baseFinancialData - Aggregated data from financialDataService
 * @param {object} decision - User decision object: { type, amount, percentage, category, description }
 * @returns {object} Structured simulation comparison with before, after, changes, risks, assumptions
 */
export const simulateFinancialDecision = (baseFinancialData, decision) => {
  const { type } = decision;

  // 1. Calculate baseline 'Before' metrics and health score
  const beforeMetrics = calculateFinancialMetrics(baseFinancialData);
  const beforeHealth = calculateFinancialHealthScore(beforeMetrics, baseFinancialData);

  const before = {
    monthlyIncome: beforeMetrics.monthlyIncome,
    monthlyExpenses: beforeMetrics.monthlyExpenses,
    monthlyCashFlow: beforeMetrics.monthlyCashFlow,
    savingsRate: beforeMetrics.savingsRate,
    expenseToIncomeRatio: beforeMetrics.expenseToIncomeRatio,
    currentSavings: beforeMetrics.currentSavings,
    emergencyFund: beforeMetrics.emergencyFund,
    emergencyFundCoverage: beforeMetrics.emergencyFundCoverage,
    totalInvestmentValue: beforeMetrics.totalInvestmentValue,
    netWorth: beforeMetrics.netWorth,
    healthScore: beforeHealth.score,
    healthRating: beforeHealth.rating
  };

  // Clone raw data structure for isolated 'After' mutation
  const simulatedData = {
    profile: { ...baseFinancialData.profile },
    ledger: { ...baseFinancialData.ledger },
    investments: {
      ...baseFinancialData.investments,
      items: [...baseFinancialData.investments.items]
    },
    goals: {
      ...baseFinancialData.goals,
      items: [...baseFinancialData.goals.items]
    }
  };

  const assumptions = [];
  const warnings = [];

  // 2. Apply decision logic to simulated data
  switch (type) {
    case 'ONE_TIME_EXPENSE': {
      const expenseAmount = sanitizeNumber(decision.amount, 0);

      let remainingToDeduct = expenseAmount;
      let newSavings = simulatedData.profile.currentSavings;
      let newEmergency = simulatedData.profile.emergencyFund;

      // Drawdown strategy: Primary = liquid savings, Secondary = emergency fund
      if (newSavings >= remainingToDeduct) {
        newSavings -= remainingToDeduct;
        remainingToDeduct = 0;
      } else {
        remainingToDeduct -= newSavings;
        newSavings = 0;
        if (newEmergency >= remainingToDeduct) {
          newEmergency -= remainingToDeduct;
          remainingToDeduct = 0;
        } else {
          remainingToDeduct -= newEmergency;
          newEmergency = 0;
          // Capital deficit
          newSavings = -remainingToDeduct;
        }
      }

      simulatedData.profile.currentSavings = round(newSavings);
      simulatedData.profile.emergencyFund = round(newEmergency);

      assumptions.push(
        'One-time expense is funded first from liquid savings, then from emergency reserves.',
        'Recurring monthly income and living expenses remain unchanged.',
        'No asset liquidation fees or borrowing interest are factored into the direct outlay.'
      );

      if (expenseAmount > before.currentSavings) {
        warnings.push('This expense exceeds your liquid savings and dips into your emergency fund.');
      }
      break;
    }

    case 'MONTHLY_EXPENSE_CHANGE': {
      const deltaAmount = sanitizeNumber(decision.amount, 0);
      const newExpenses = Math.max(0, simulatedData.ledger.effectiveMonthlyExpenses + deltaAmount);
      simulatedData.ledger.effectiveMonthlyExpenses = round(newExpenses);

      assumptions.push(
        'The expense adjustment takes effect immediately and persists every month.',
        'Total income and current bank balances remain unchanged.',
        'No inflation adjustments are modeled during the simulation window.'
      );

      if (deltaAmount > 0) {
        warnings.push(`Monthly spending will increase by ₹${deltaAmount.toLocaleString()} indefinitely.`);
      }
      break;
    }

    case 'MONTHLY_INCOME_CHANGE': {
      let deltaAmount = 0;
      if (decision.percentage !== undefined) {
        const pct = sanitizeNumber(decision.percentage, 0);
        deltaAmount = before.monthlyIncome * (pct / 100);
        assumptions.push(`Monthly income is adjusted by ${pct > 0 ? '+' : ''}${pct}%.`);
      } else {
        deltaAmount = sanitizeNumber(decision.amount, 0);
        assumptions.push(`Monthly income changes by ₹${deltaAmount.toLocaleString()} per month.`);
      }

      const newIncome = Math.max(0, simulatedData.ledger.effectiveMonthlyIncome + deltaAmount);
      simulatedData.ledger.effectiveMonthlyIncome = round(newIncome);

      assumptions.push(
        'Income change is modeled as a persistent recurring change.',
        'Fixed living expenses and tax rates are assumed constant.'
      );
      break;
    }

    case 'MONTHLY_INVESTMENT_CHANGE': {
      const deltaAmount = sanitizeNumber(decision.amount, 0);
      const currentSip = simulatedData.investments.totalMonthlyContribution;
      const newSip = Math.max(0, currentSip + deltaAmount);
      simulatedData.investments.totalMonthlyContribution = round(newSip);

      assumptions.push(
        'Monthly investment contributions are allocated from available monthly cash flow.',
        'Current portfolio value and market prices remain constant at the point of simulation.'
      );

      if (deltaAmount > 0 && deltaAmount > before.monthlyCashFlow) {
        warnings.push('The increased investment commitment exceeds your current monthly surplus.');
      }
      break;
    }

    default:
      throw new Error(`Unsupported decision type: ${type}`);
  }

  // 3. Compute 'After' metrics and health score
  const afterMetrics = calculateFinancialMetrics(simulatedData);
  const afterHealth = calculateFinancialHealthScore(afterMetrics, simulatedData);

  const after = {
    monthlyIncome: afterMetrics.monthlyIncome,
    monthlyExpenses: afterMetrics.monthlyExpenses,
    monthlyCashFlow: afterMetrics.monthlyCashFlow,
    savingsRate: afterMetrics.savingsRate,
    expenseToIncomeRatio: afterMetrics.expenseToIncomeRatio,
    currentSavings: afterMetrics.currentSavings,
    emergencyFund: afterMetrics.emergencyFund,
    emergencyFundCoverage: afterMetrics.emergencyFundCoverage,
    totalInvestmentValue: afterMetrics.totalInvestmentValue,
    netWorth: afterMetrics.netWorth,
    healthScore: afterHealth.score,
    healthRating: afterHealth.rating
  };

  // 4. Compute explicit deltas
  const changes = {
    monthlyIncomeChange: round(after.monthlyIncome - before.monthlyIncome),
    monthlyExpensesChange: round(after.monthlyExpenses - before.monthlyExpenses),
    cashFlowChange: round(after.monthlyCashFlow - before.monthlyCashFlow),
    savingsRateChange: round(after.savingsRate - before.savingsRate),
    expenseRatioChange: round(after.expenseToIncomeRatio - before.expenseToIncomeRatio),
    savingsChange: round(after.currentSavings - before.currentSavings),
    emergencyFundChange: round(after.emergencyFund - before.emergencyFund),
    emergencyCoverageChange: round(after.emergencyFundCoverage - before.emergencyFundCoverage, 1),
    netWorthChange: round(after.netWorth - before.netWorth),
    monthlyInvestmentChange: round((simulatedData.investments.totalMonthlyContribution || 0) - (baseFinancialData.investments.totalMonthlyContribution || 0)),
    healthScoreChange: after.healthScore - before.healthScore
  };

  // 5. Detect simulation risks
  const risks = detectSimulationRisks(before, after, changes, decision);

  return {
    decision,
    before,
    after,
    changes,
    risks,
    warnings,
    assumptions
  };
};

export default {
  simulateFinancialDecision
};

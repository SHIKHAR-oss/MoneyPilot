import FinancialProfile from '../models/FinancialProfile.js';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';
import Investment from '../models/Investment.js';
import { round, sanitizeNumber } from '../utils/mathHelpers.js';

/**
 * Service to aggregate and normalize authenticated user's financial data
 * Decouples database queries from pure calculation engines
 */
export const getUserFinancialData = async (userId) => {
  // Query all financial components concurrently
  const [rawProfile, rawTransactions, rawGoals, rawInvestments] = await Promise.all([
    FinancialProfile.findOne({ userId }),
    Transaction.find({ userId }).sort({ date: -1 }),
    Goal.find({ userId }).sort({ createdAt: -1 }),
    Investment.find({ userId }).sort({ currentValue: -1 })
  ]);

  // 1. Normalize Financial Profile
  const profile = rawProfile
    ? rawProfile.toJSON()
    : {
        userId,
        monthlyIncome: 0,
        currentSavings: 0,
        emergencyFund: 0,
        riskProfile: 'moderate',
        isConfigured: false
      };

  // 2. Normalize Transactions & Compute Ledger Aggregates
  const transactions = (rawTransactions || []).map((t) => t.toJSON());

  let totalIncomeTransactions = 0;
  let totalExpenseTransactions = 0;
  const expensesByCategory = {};
  const incomeByCategory = {};

  transactions.forEach((tx) => {
    const amt = sanitizeNumber(tx.amount, 0);
    const cat = tx.category || 'Other';

    if (tx.type === 'income') {
      totalIncomeTransactions += amt;
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + amt;
    } else if (tx.type === 'expense') {
      totalExpenseTransactions += amt;
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + amt;
    }
  });

  // Effective Monthly Income: Use transaction income if recorded; otherwise use profile baseline
  const effectiveMonthlyIncome =
    totalIncomeTransactions > 0
      ? round(totalIncomeTransactions)
      : round(sanitizeNumber(profile.monthlyIncome, 0));

  const effectiveMonthlyExpenses = round(totalExpenseTransactions);

  // 3. Normalize Investments
  const investments = (rawInvestments || []).map((inv) => inv.toJSON());
  let totalInvestmentValue = 0;
  let totalMonthlyInvestmentContribution = 0;

  investments.forEach((inv) => {
    totalInvestmentValue += sanitizeNumber(inv.currentValue, 0);
    totalMonthlyInvestmentContribution += sanitizeNumber(inv.monthlyContribution, 0);
  });

  // 4. Normalize Goals
  const goals = (rawGoals || []).map((g) => ({
    ...g.toJSON(),
    targetAmount: sanitizeNumber(g.targetAmount, 0),
    currentAmount: sanitizeNumber(g.currentAmount, 0)
  }));

  let totalGoalTargetAmount = 0;
  let totalGoalCurrentAmount = 0;

  goals.forEach((g) => {
    totalGoalTargetAmount += g.targetAmount;
    totalGoalCurrentAmount += g.currentAmount;
  });

  return {
    profile: {
      userId,
      monthlyIncome: round(sanitizeNumber(profile.monthlyIncome, 0)),
      currentSavings: round(sanitizeNumber(profile.currentSavings, 0)),
      emergencyFund: round(sanitizeNumber(profile.emergencyFund, 0)),
      riskProfile: profile.riskProfile || 'moderate',
      isConfigured: Boolean(rawProfile)
    },
    ledger: {
      effectiveMonthlyIncome,
      effectiveMonthlyExpenses,
      incomeTransactionsTotal: round(totalIncomeTransactions),
      expenseTransactionsTotal: round(totalExpenseTransactions),
      expensesByCategory,
      incomeByCategory,
      transactionCount: transactions.length
    },
    investments: {
      items: investments,
      totalValue: round(totalInvestmentValue),
      totalMonthlyContribution: round(totalMonthlyInvestmentContribution),
      count: investments.length
    },
    goals: {
      items: goals,
      totalTargetAmount: round(totalGoalTargetAmount),
      totalCurrentAmount: round(totalGoalCurrentAmount),
      count: goals.length
    },
    rawTransactions: transactions
  };
};

export default {
  getUserFinancialData
};

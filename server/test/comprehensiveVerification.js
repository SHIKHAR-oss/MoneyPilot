import assert from 'assert';
import { safeDivide, round, clamp, sanitizeNumber } from '../src/utils/mathHelpers.js';
import { calculateFinancialMetrics } from '../src/engines/metricsEngine.js';
import { calculateFinancialHealthScore } from '../src/engines/healthScoreEngine.js';
import { simulateFinancialDecision } from '../src/engines/simulationEngine.js';
import { detectBaselineRisks, detectSimulationRisks } from '../src/engines/riskEngine.js';
import { parseJsonSafely, validateOverviewExplanation, validateSimulationExplanation, getFallbackOverviewExplanation } from '../src/utils/aiResponseValidator.js';
import { generateToken, verifyToken } from '../src/utils/jwt.js';
import { isValidObjectId, isSafeNumber, isNonNegativeNumber, isPositiveNumber } from '../src/utils/validationHelpers.js';

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log(' MoneyPilot Phase 6: Comprehensive Security & Engine Test Suite ');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. Math Helpers & Division-by-Zero Safety Tests
// -------------------------------------------------------------
console.log('1. Deterministic Math & Guard Helpers:');

runTest('safeDivide: Handles standard division', () => {
  assert.strictEqual(safeDivide(100, 4), 25);
  assert.strictEqual(safeDivide(10, 3), 3.3333333333333335);
});

runTest('safeDivide: Division by zero returns fallback (default 0)', () => {
  assert.strictEqual(safeDivide(100, 0), 0);
  assert.strictEqual(safeDivide(0, 0), 0);
  assert.strictEqual(safeDivide(-50, 0), 0);
  assert.strictEqual(safeDivide(100, 0, 99), 99);
});

runTest('safeDivide: Handles NaN and Infinity inputs gracefully', () => {
  assert.strictEqual(safeDivide(NaN, 10), 0);
  assert.strictEqual(safeDivide(10, NaN), 0);
  assert.strictEqual(safeDivide(Infinity, 10), 0);
});

runTest('round: Rounds cleanly and guards NaN', () => {
  assert.strictEqual(round(12.3456, 2), 12.35);
  assert.strictEqual(round(12.3444, 2), 12.34);
  assert.strictEqual(round(NaN, 2), 0);
  assert.strictEqual(round(Infinity, 2), 0);
});

runTest('sanitizeNumber: Parses valid numbers and falls back for invalid inputs', () => {
  assert.strictEqual(sanitizeNumber(25, 0), 25);
  assert.strictEqual(sanitizeNumber('150.5', 0), 150.5);
  assert.strictEqual(sanitizeNumber(NaN, 10), 10);
  assert.strictEqual(sanitizeNumber(undefined, 5), 5);
});

runTest('clamp: Restricts numbers within bounds', () => {
  assert.strictEqual(clamp(150, 0, 100), 100);
  assert.strictEqual(clamp(-20, 0, 100), 0);
  assert.strictEqual(clamp(75, 0, 100), 75);
});

// -------------------------------------------------------------
// 2. Financial Metrics Engine Tests
// -------------------------------------------------------------
console.log('\n2. Financial Metrics Engine:');

runTest('calculateFinancialMetrics: Standard healthy financial situation', () => {
  const input = {
    profile: {
      monthlyIncome: 100000,
      currentSavings: 250000,
      emergencyFund: 150000,
      riskProfile: 'moderate'
    },
    ledger: {
      effectiveMonthlyIncome: 120000,
      effectiveMonthlyExpenses: 40000,
      totalIncomeTransactions: 20000,
      totalExpenseTransactions: 40000,
      recentTransactions: []
    },
    goals: {
      items: [
        { _id: '1', name: 'Car', targetAmount: 500000, currentAmount: 250000, category: 'purchase' }
      ],
      totalTargetAmount: 500000,
      totalCurrentAmount: 250000,
      count: 1
    },
    investments: {
      items: [
        { _id: '2', name: 'Nifty', type: 'Mutual Fund', currentValue: 300000, monthlyContribution: 10000 }
      ],
      totalValue: 300000,
      totalMonthlyContribution: 10000,
      count: 1
    }
  };

  const metrics = calculateFinancialMetrics(input);
  assert.strictEqual(metrics.monthlyIncome, 120000);
  assert.strictEqual(metrics.monthlyExpenses, 40000);
  assert.strictEqual(metrics.monthlyCashFlow, 80000);
  assert.strictEqual(metrics.savingsRate, 66.67);
  assert.strictEqual(metrics.emergencyFundCoverage, 3.8); // 150k / 40k = 3.75 -> round 3.8
  assert.strictEqual(metrics.totalInvestmentValue, 300000);
  assert.strictEqual(metrics.netWorth, 550000); // 250k savings + 300k inv
  assert.strictEqual(isNaN(metrics.monthlyCashFlow), false);
});

runTest('calculateFinancialMetrics: Zero data edge case (All zeroes)', () => {
  const input = {
    profile: { monthlyIncome: 0, currentSavings: 0, emergencyFund: 0, riskProfile: 'moderate' },
    ledger: { effectiveMonthlyIncome: 0, effectiveMonthlyExpenses: 0, totalIncomeTransactions: 0, totalExpenseTransactions: 0, recentTransactions: [] },
    goals: { items: [], totalTargetAmount: 0, totalCurrentAmount: 0, count: 0 },
    investments: { items: [], totalValue: 0, totalMonthlyContribution: 0, count: 0 }
  };

  const metrics = calculateFinancialMetrics(input);
  assert.strictEqual(metrics.monthlyIncome, 0);
  assert.strictEqual(metrics.monthlyExpenses, 0);
  assert.strictEqual(metrics.monthlyCashFlow, 0);
  assert.strictEqual(metrics.savingsRate, 0);
  assert.strictEqual(metrics.emergencyFundCoverage, 0);
  assert.strictEqual(metrics.netWorth, 0);
  assert.strictEqual(isNaN(metrics.savingsRate), false);
  assert.strictEqual(isFinite(metrics.savingsRate), true);
});

runTest('calculateFinancialMetrics: Financial deficit edge case (Expenses > Income)', () => {
  const input = {
    profile: { monthlyIncome: 50000, currentSavings: 20000, emergencyFund: 10000, riskProfile: 'moderate' },
    ledger: { effectiveMonthlyIncome: 50000, effectiveMonthlyExpenses: 80000, totalIncomeTransactions: 0, totalExpenseTransactions: 80000, recentTransactions: [] },
    goals: { items: [], totalTargetAmount: 0, totalCurrentAmount: 0, count: 0 },
    investments: { items: [], totalValue: 0, totalMonthlyContribution: 0, count: 0 }
  };

  const metrics = calculateFinancialMetrics(input);
  assert.strictEqual(metrics.monthlyIncome, 50000);
  assert.strictEqual(metrics.monthlyExpenses, 80000);
  assert.strictEqual(metrics.monthlyCashFlow, -30000);
  assert.strictEqual(metrics.savingsRate, -60);
  assert.strictEqual(metrics.expenseToIncomeRatio, 160);
});

// -------------------------------------------------------------
// 3. Health Score Engine Tests
// -------------------------------------------------------------
console.log('\n3. Financial Health Score Engine:');

runTest('calculateFinancialHealthScore: Bounds check (0 <= score <= 100)', () => {
  const healthyInput = {
    profile: { monthlyIncome: 100000, currentSavings: 200000, emergencyFund: 240000, riskProfile: 'moderate' },
    ledger: { effectiveMonthlyIncome: 100000, effectiveMonthlyExpenses: 40000 },
    goals: { items: [{ name: 'G1', targetAmount: 100000, currentAmount: 100000 }], totalTargetAmount: 100000, totalCurrentAmount: 100000, count: 1 },
    investments: { items: [{ name: 'I1', currentValue: 200000, monthlyContribution: 5000 }], totalValue: 200000, totalMonthlyContribution: 5000, count: 1 }
  };
  const healthyMetrics = calculateFinancialMetrics(healthyInput);
  const healthyScore = calculateFinancialHealthScore(healthyMetrics, healthyInput);

  assert(healthyScore.score >= 0 && healthyScore.score <= 100, 'Score should be between 0 and 100');
  assert.strictEqual(healthyScore.rating, 'Excellent');
  assert.strictEqual(Object.keys(healthyScore.components).length, 5);

  const deficitInput = {
    profile: { monthlyIncome: 0, currentSavings: 0, emergencyFund: 0, riskProfile: 'conservative' },
    ledger: { effectiveMonthlyIncome: 0, effectiveMonthlyExpenses: 50000 },
    goals: { items: [], totalTargetAmount: 0, totalCurrentAmount: 0, count: 0 },
    investments: { items: [], totalValue: 0, totalMonthlyContribution: 0, count: 0 }
  };
  const deficitMetrics = calculateFinancialMetrics(deficitInput);
  const deficitScore = calculateFinancialHealthScore(deficitMetrics, deficitInput);

  assert(deficitScore.score >= 0 && deficitScore.score <= 100, 'Deficit score should be within bounds');
  assert.strictEqual(deficitScore.rating, 'Critical');
});

// -------------------------------------------------------------
// 4. Decision Simulation Engine Tests (All 4 Types)
// -------------------------------------------------------------
console.log('\n4. Decision Simulation Engine:');

const baseData = {
  profile: { monthlyIncome: 100000, currentSavings: 200000, emergencyFund: 100000, riskProfile: 'moderate' },
  ledger: { effectiveMonthlyIncome: 100000, effectiveMonthlyExpenses: 40000, totalIncomeTransactions: 0, totalExpenseTransactions: 40000, recentTransactions: [] },
  goals: { items: [], totalTargetAmount: 0, totalCurrentAmount: 0, count: 0 },
  investments: { items: [{ currentValue: 150000, monthlyContribution: 5000 }], totalValue: 150000, totalMonthlyContribution: 5000, count: 1 }
};

runTest('Simulation: ONE_TIME_EXPENSE (Lump sum purchase)', () => {
  const sim = simulateFinancialDecision(baseData, {
    type: 'ONE_TIME_EXPENSE',
    amount: 50000,
    category: 'purchase',
    description: 'New Laptop'
  });

  assert.strictEqual(sim.decision.type, 'ONE_TIME_EXPENSE');
  assert.strictEqual(sim.before.currentSavings, 200000);
  assert.strictEqual(sim.after.currentSavings, 150000); // 200k - 50k
  assert.strictEqual(sim.changes.savingsChange, -50000);
  assert.strictEqual(sim.changes.netWorthChange, -50000);
  assert(sim.assumptions.length > 0, 'Should log assumptions');
});

runTest('Simulation: ONE_TIME_EXPENSE exceeding liquid savings (Emergency drawdown)', () => {
  const sim = simulateFinancialDecision(baseData, {
    type: 'ONE_TIME_EXPENSE',
    amount: 250000 // Exceeds 200k liquid savings -> draws 50k from emergency fund
  });

  assert.strictEqual(sim.after.currentSavings, 0);
  assert.strictEqual(sim.after.emergencyFund, 50000); // 100k - 50k
  assert(sim.warnings.length > 0, 'Should warn about emergency fund drawdown');
});

runTest('Simulation: MONTHLY_EXPENSE_CHANGE (Recurring increase)', () => {
  const sim = simulateFinancialDecision(baseData, {
    type: 'MONTHLY_EXPENSE_CHANGE',
    amount: 10000,
    description: 'Rent Hike'
  });

  assert.strictEqual(sim.before.monthlyExpenses, 40000);
  assert.strictEqual(sim.after.monthlyExpenses, 50000);
  assert.strictEqual(sim.changes.monthlyExpensesChange, 10000);
  assert.strictEqual(sim.changes.cashFlowChange, -10000);
});

runTest('Simulation: MONTHLY_INCOME_CHANGE (Percentage & Fixed)', () => {
  const simPct = simulateFinancialDecision(baseData, {
    type: 'MONTHLY_INCOME_CHANGE',
    percentage: 20 // 20% raise
  });

  assert.strictEqual(simPct.before.monthlyIncome, 100000);
  assert.strictEqual(simPct.after.monthlyIncome, 120000);
  assert.strictEqual(simPct.changes.monthlyIncomeChange, 20000);

  const simCut = simulateFinancialDecision(baseData, {
    type: 'MONTHLY_INCOME_CHANGE',
    amount: -30000 // ₹30,000 cut
  });

  assert.strictEqual(simCut.after.monthlyIncome, 70000);
  assert.strictEqual(simCut.changes.monthlyIncomeChange, -30000);
});

runTest('Simulation: MONTHLY_INVESTMENT_CHANGE (Step-up SIP)', () => {
  const sim = simulateFinancialDecision(baseData, {
    type: 'MONTHLY_INVESTMENT_CHANGE',
    amount: 10000,
    description: 'Mutual Fund Boost'
  });

  assert.strictEqual(sim.changes.monthlyInvestmentChange, 10000);
});

// -------------------------------------------------------------
// 5. Risk Engine Tests
// -------------------------------------------------------------
console.log('\n5. Risk Classifier Engine:');

runTest('RiskEngine: Detects baseline deficit and emergency fund depletion', () => {
  const deficitData = {
    profile: { monthlyIncome: 40000, currentSavings: 5000, emergencyFund: 5000, riskProfile: 'moderate' },
    ledger: { effectiveMonthlyIncome: 40000, effectiveMonthlyExpenses: 60000 },
    goals: { items: [], totalTargetAmount: 0, totalCurrentAmount: 0, count: 0 },
    investments: { items: [], totalValue: 0, totalMonthlyContribution: 0, count: 0 }
  };
  const deficitMetrics = calculateFinancialMetrics(deficitData);
  const deficitHealth = calculateFinancialHealthScore(deficitMetrics, deficitData);
  const baselineRisks = detectBaselineRisks(deficitMetrics, deficitHealth);

  assert(baselineRisks.some(r => r.severity === 'CRITICAL' && r.title === 'Cash Flow Deficit'));
  assert(baselineRisks.some(r => r.severity === 'CRITICAL' && r.title === 'Severe Emergency Vulnerability'));
});

// -------------------------------------------------------------
// 6. AI Explanation Validator & Fallback Tests
// -------------------------------------------------------------
console.log('\n6. AI Explanation Layer & Schema Validation:');

runTest('validateOverviewExplanation: Valid JSON schema passes', () => {
  const validJson = JSON.stringify({
    summary: 'Your finances are well structured.',
    strengths: ['Strong savings rate', 'Consistent cash flow'],
    concerns: ['Emergency fund is slightly below 6 months'],
    recommendedActions: [
      { action: 'Increase emergency fund', priority: 'HIGH', reason: 'To build a 6-month buffer' }
    ],
    disclaimer: 'For informational purposes only.'
  });

  const parsed = validateOverviewExplanation(parseJsonSafely(validJson));
  assert.strictEqual(parsed.summary, 'Your finances are well structured.');
  assert.strictEqual(parsed.strengths.length, 2);
  assert.strictEqual(parsed.recommendedActions[0].priority, 'HIGH');
});

runTest('validateOverviewExplanation: Strips markdown code fences', () => {
  const fenced = '```json\n{"summary": "Healthy finances", "strengths": [], "concerns": [], "recommendedActions": []}\n```';
  const parsed = validateOverviewExplanation(parseJsonSafely(fenced));
  assert.strictEqual(parsed.summary, 'Healthy finances');
});

runTest('validateOverviewExplanation: Malformed JSON triggers graceful fallback without throwing', () => {
  const broken = 'Invalid non-json response string from AI';
  const parsed = validateOverviewExplanation(parseJsonSafely(broken));
  assert(parsed.summary.length > 0, 'Should return fallback summary');
  assert.strictEqual(Array.isArray(parsed.strengths), true);
});

// -------------------------------------------------------------
// 7. Security & JWT Token Verification Tests
// -------------------------------------------------------------
console.log('\n7. Security & JWT Validation:');

runTest('JWT: Signs and verifies token safely', () => {
  const user = { _id: '507f1f77bcf86cd799439011', email: 'alex@example.com' };
  const token = generateToken(user);
  assert(typeof token === 'string' && token.length > 20);

  const decoded = verifyToken(token);
  assert.strictEqual(decoded.id, '507f1f77bcf86cd799439011');
});

runTest('JWT: Rejects invalid or tampered tokens with exception', () => {
  const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature';
  let threwError = false;
  try {
    verifyToken(tamperedToken);
  } catch (err) {
    threwError = true;
  }
  assert.strictEqual(threwError, true);
});

// -------------------------------------------------------------
// 8. Validation Helpers Tests
// -------------------------------------------------------------
console.log('\n8. Validation Helpers:');

runTest('isValidObjectId: Validates 24-hex characters MongoDB ObjectId', () => {
  assert.strictEqual(isValidObjectId('507f1f77bcf86cd799439011'), true);
  assert.strictEqual(isValidObjectId('64b8a2e1d7a9c3b4e5f6a7b8'), true);
  assert.strictEqual(isValidObjectId('invalid-id'), false);
  assert.strictEqual(isValidObjectId('123'), false);
  assert.strictEqual(isValidObjectId(''), false);
  assert.strictEqual(isValidObjectId(null), false);
  assert.strictEqual(isValidObjectId(undefined), false);
  assert.strictEqual(isValidObjectId(12345), false);
});

runTest('isSafeNumber & isPositiveNumber: Validates numbers accurately', () => {
  assert.strictEqual(isSafeNumber(100), true);
  assert.strictEqual(isSafeNumber(0), true);
  assert.strictEqual(isSafeNumber(-50), true);
  assert.strictEqual(isSafeNumber(NaN), false);
  assert.strictEqual(isSafeNumber(Infinity), false);

  assert.strictEqual(isPositiveNumber(50), true);
  assert.strictEqual(isPositiveNumber(0), false);
  assert.strictEqual(isPositiveNumber(-10), false);
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(` Test Results: ${passedTests} / ${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}

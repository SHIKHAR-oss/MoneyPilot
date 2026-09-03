import { getUserFinancialData } from '../services/financialDataService.js';
import { calculateFinancialMetrics } from '../engines/metricsEngine.js';
import { calculateFinancialHealthScore } from '../engines/healthScoreEngine.js';
import { detectBaselineRisks } from '../engines/riskEngine.js';
import { simulateFinancialDecision } from '../engines/simulationEngine.js';
import { explainFinancialOverview, explainSimulation } from '../services/aiExplanationService.js';

const VALID_DECISION_TYPES = [
  'ONE_TIME_EXPENSE',
  'MONTHLY_EXPENSE_CHANGE',
  'MONTHLY_INCOME_CHANGE',
  'MONTHLY_INVESTMENT_CHANGE'
];

/**
 * Generate an AI explanation for user's overall financial situation
 * @route POST /api/ai/explain-overview
 */
export const explainOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Deterministic Data Aggregation
    const financialData = await getUserFinancialData(userId);

    // 2. Deterministic Metrics & Health Score
    const metrics = calculateFinancialMetrics(financialData);
    const healthScore = calculateFinancialHealthScore(metrics, financialData);
    const risks = detectBaselineRisks(metrics, healthScore);

    // 3. AI Explanation Layer
    const aiResult = await explainFinancialOverview({
      metrics,
      healthScore,
      risks,
      breakdown: {
        profile: financialData.profile,
        ledger: financialData.ledger,
        investments: financialData.investments,
        goals: financialData.goals
      }
    });

    return res.status(200).json({
      status: 'success',
      aiStatus: aiResult.success ? 'available' : 'unavailable',
      ...(aiResult.code ? { aiCode: aiResult.code, aiMessage: aiResult.message } : {}),
      data: {
        explanation: aiResult.explanation,
        metrics,
        healthScore,
        risks,
        breakdown: {
          profile: financialData.profile,
          ledger: financialData.ledger,
          investments: financialData.investments,
          goals: financialData.goals
        }
      }
    });
  } catch (error) {
    console.error('[AI Controller - Explain Overview Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error generating financial overview explanation.'
    });
  }
};

/**
 * Generate an AI explanation for a decision simulation
 * @route POST /api/ai/explain-simulation
 */
export const explainSimulationDecision = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, amount, percentage, category, description } = req.body;

    if (!type || !VALID_DECISION_TYPES.includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid decision type. Must be one of: ${VALID_DECISION_TYPES.join(', ')}`
      });
    }

    // Validate type-specific numeric inputs
    if (type === 'ONE_TIME_EXPENSE') {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'amount must be a positive number greater than 0 for a ONE_TIME_EXPENSE.'
        });
      }
    } else if (type === 'MONTHLY_EXPENSE_CHANGE' || type === 'MONTHLY_INVESTMENT_CHANGE') {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount)) {
        return res.status(400).json({
          status: 'error',
          message: 'amount is required and must be a valid number.'
        });
      }
    } else if (type === 'MONTHLY_INCOME_CHANGE') {
      if (percentage === undefined && amount === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'MONTHLY_INCOME_CHANGE requires either a "percentage" or an "amount" parameter.'
        });
      }
    }

    const decision = {
      type,
      amount: amount !== undefined ? Number(amount) : undefined,
      percentage: percentage !== undefined ? Number(percentage) : undefined,
      category: category ? String(category).trim() : undefined,
      description: description ? String(description).trim() : undefined
    };

    // 1. Fetch user financial data
    const financialData = await getUserFinancialData(userId);

    // 2. Deterministic Simulation Engine
    const simulationResult = simulateFinancialDecision(financialData, decision);

    // 3. AI Explanation Layer
    const aiResult = await explainSimulation(simulationResult);

    return res.status(200).json({
      status: 'success',
      aiStatus: aiResult.success ? 'available' : 'unavailable',
      ...(aiResult.code ? { aiCode: aiResult.code, aiMessage: aiResult.message } : {}),
      data: {
        explanation: aiResult.explanation,
        simulation: simulationResult
      }
    });
  } catch (error) {
    console.error('[AI Controller - Explain Simulation Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error generating simulation explanation.'
    });
  }
};

export default {
  explainOverview,
  explainSimulationDecision
};

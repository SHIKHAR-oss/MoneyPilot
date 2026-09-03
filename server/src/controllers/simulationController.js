import { getUserFinancialData } from '../services/financialDataService.js';
import { simulateFinancialDecision } from '../engines/simulationEngine.js';
import { sanitizeNumber } from '../utils/mathHelpers.js';

const VALID_DECISION_TYPES = [
  'ONE_TIME_EXPENSE',
  'MONTHLY_EXPENSE_CHANGE',
  'MONTHLY_INCOME_CHANGE',
  'MONTHLY_INVESTMENT_CHANGE'
];

/**
 * Execute a deterministic 'what-if' financial simulation
 * @route POST /api/simulations/run
 */
export const runSimulation = async (req, res) => {
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
      if (parsedAmount > 1e12) {
        return res.status(400).json({
          status: 'error',
          message: 'Amount exceeds maximum allowable calculation threshold.'
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
      if (Math.abs(parsedAmount) > 1e12) {
        return res.status(400).json({
          status: 'error',
          message: 'Amount exceeds maximum allowable calculation threshold.'
        });
      }
    } else if (type === 'MONTHLY_INCOME_CHANGE') {
      if (percentage === undefined && amount === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'MONTHLY_INCOME_CHANGE requires either a "percentage" or an "amount" parameter.'
        });
      }
      if (percentage !== undefined) {
        const parsedPct = Number(percentage);
        if (isNaN(parsedPct) || parsedPct < -100 || parsedPct > 1000) {
          return res.status(400).json({
            status: 'error',
            message: 'percentage must be a number between -100% and 1000%.'
          });
        }
      }
      if (amount !== undefined) {
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || Math.abs(parsedAmount) > 1e12) {
          return res.status(400).json({
            status: 'error',
            message: 'amount must be a valid number.'
          });
        }
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

    // 2. Run simulation engine
    const simulationResult = simulateFinancialDecision(financialData, decision);

    return res.status(200).json({
      status: 'success',
      data: simulationResult
    });
  } catch (error) {
    console.error('[Run Simulation Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error executing financial simulation.'
    });
  }
};

export default {
  runSimulation
};

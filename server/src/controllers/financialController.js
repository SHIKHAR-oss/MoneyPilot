import { getUserFinancialData } from '../services/financialDataService.js';
import { calculateFinancialMetrics } from '../engines/metricsEngine.js';
import { calculateFinancialHealthScore } from '../engines/healthScoreEngine.js';
import { detectBaselineRisks } from '../engines/riskEngine.js';

/**
 * Get comprehensive financial overview for authenticated user
 * @route GET /api/financial/overview
 */
export const getFinancialOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Service Layer: Aggregate user data from MongoDB
    const financialData = await getUserFinancialData(userId);

    // 2. Metrics Engine: Deterministic ratios and figures
    const metrics = calculateFinancialMetrics(financialData);

    // 3. Health Score Engine: Transparent 0-100 scoring
    const healthScore = calculateFinancialHealthScore(metrics, financialData);

    // 4. Risk Engine: Deterministic baseline risks
    const risks = detectBaselineRisks(metrics, healthScore);

    return res.status(200).json({
      status: 'success',
      data: {
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
    console.error('[Financial Overview Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error computing financial overview.'
    });
  }
};

export default {
  getFinancialOverview
};

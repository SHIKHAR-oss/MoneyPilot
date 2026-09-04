import { isGeminiConfigured, getGeminiModel } from '../config/gemini.js';
import {
  parseJsonSafely,
  validateOverviewExplanation,
  validateSimulationExplanation,
  getFallbackOverviewExplanation,
  getFallbackSimulationExplanation
} from '../utils/aiResponseValidator.js';

const SYSTEM_INSTRUCTION = `
You are the explanation assistant inside MoneyPilot, a financial decision intelligence platform.
Your core philosophy is: "AI can suggest. The system checks. The user decides."

CRITICAL RULES:
1. All financial numbers, health scores, comparisons, and risks have already been calculated deterministically by the backend.
2. You must NEVER invent new financial figures or modify the provided calculations.
3. You must NEVER contradict the provided metrics.
4. You must explain what the numbers mean in clear, empathetic, and professional language.
5. Distinguish facts from suggestions.
6. Do not claim certainty about future financial outcomes.
7. Do not provide professional financial, legal, or investment advice.
8. Output MUST strictly be valid JSON matching the requested schema.
`.trim();

/**
 * Generate an AI explanation for user's overall financial health & position
 *
 * @param {object} params
 * @param {object} params.metrics - Deterministic metrics
 * @param {object} params.healthScore - Deterministic health score & components
 * @param {Array} params.risks - Detected baseline risks
 * @param {object} params.breakdown - Financial data summaries
 * @returns {Promise<{ success: boolean, explanation: object, error?: string }>}
 */
export const explainFinancialOverview = async ({ metrics, healthScore, risks, breakdown }) => {
  if (!isGeminiConfigured()) {
    return {
      success: false,
      code: 'AI_SERVICE_UNAVAILABLE',
      message: 'GEMINI_API_KEY is not configured on the server.',
      explanation: getFallbackOverviewExplanation()
    };
  }

  try {
    const model = getGeminiModel();
    if (!model) {
      return {
        success: false,
        code: 'AI_SERVICE_UNAVAILABLE',
        message: 'Could not initialize Gemini model.',
        explanation: getFallbackOverviewExplanation()
      };
    }

    // Sanitize and structure input payload
    const sanitizedPayload = {
      metrics: {
        monthlyIncome: metrics.monthlyIncome,
        monthlyExpenses: metrics.monthlyExpenses,
        monthlyCashFlow: metrics.monthlyCashFlow,
        savingsRate: `${metrics.savingsRate}%`,
        expenseToIncomeRatio: `${metrics.expenseToIncomeRatio}%`,
        emergencyFundCoverage: `${metrics.emergencyFundCoverage} months`,
        currentSavings: metrics.currentSavings,
        emergencyFund: metrics.emergencyFund,
        totalInvestmentValue: metrics.totalInvestmentValue,
        netWorth: metrics.netWorth
      },
      healthScore: {
        score: healthScore.score,
        rating: healthScore.rating,
        components: healthScore.components
      },
      detectedRisks: risks.map((r) => ({
        severity: r.severity,
        title: r.title,
        explanation: r.explanation
      })),
      goalsSummary: {
        totalGoals: breakdown.goals?.count || 0,
        overallProgress: `${metrics.goals?.overallProgress || 0}%`
      },
      investmentsSummary: {
        totalHoldings: breakdown.investments?.count || 0,
        totalMonthlySIP: breakdown.investments?.totalMonthlyContribution || 0
      }
    };

    const prompt = `
${SYSTEM_INSTRUCTION}

Analyze and explain the following verified deterministic financial data.

Financial Data:
${JSON.stringify(sanitizedPayload, null, 2)}

Return a JSON object conforming strictly to this format:
{
  "summary": "2-3 sentence overview explaining their current financial health and cash flow.",
  "strengths": ["1-3 key positive financial observations from the numbers"],
  "concerns": ["1-3 potential vulnerabilities or areas needing attention based on detected risks"],
  "recommendedActions": [
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "action": "Concrete, actionable step to improve health score or mitigate risk",
      "reason": "Why this specific step addresses the identified metric"
    }
  ],
  "disclaimer": "This explanation is informational and should not be considered professional financial advice."
}
`.trim();

    // Enforce 12-second timeout on AI response
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timed out')), 60000)
    );

    const apiPromise = model.generateContent(prompt);
    const result = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = result.response.text();

    const parsed = parseJsonSafely(responseText);
    const validatedExplanation = validateOverviewExplanation(parsed);

    return {
      success: true,
      explanation: validatedExplanation
    };
  } catch (error) {
    console.error('[AI Explanation Service - Overview Error]:', error.message);
    return {
      success: false,
      code: 'AI_GENERATION_FAILED',
      message: error.message || 'Error communicating with Gemini API.',
      explanation: getFallbackOverviewExplanation()
    };
  }
};

/**
 * Generate an AI explanation for a decision simulation comparison
 *
 * @param {object} simulationResult - Result from simulationEngine
 * @returns {Promise<{ success: boolean, explanation: object, error?: string }>}
 */
export const explainSimulation = async (simulationResult) => {
  if (!isGeminiConfigured()) {
    return {
      success: false,
      code: 'AI_SERVICE_UNAVAILABLE',
      message: 'GEMINI_API_KEY is not configured on the server.',
      explanation: getFallbackSimulationExplanation()
    };
  }

  try {
    const model = getGeminiModel();
    if (!model) {
      return {
        success: false,
        code: 'AI_SERVICE_UNAVAILABLE',
        message: 'Could not initialize Gemini model.',
        explanation: getFallbackSimulationExplanation()
      };
    }

    // Sanitize simulation payload
    const sanitizedPayload = {
      decision: simulationResult.decision,
      before: simulationResult.before,
      after: simulationResult.after,
      changes: simulationResult.changes,
      risks: simulationResult.risks,
      warnings: simulationResult.warnings,
      assumptions: simulationResult.assumptions
    };

    const prompt = `
${SYSTEM_INSTRUCTION}

Analyze and explain the following financial decision simulation.
Compare the 'before' state with the projected 'after' state based on the calculated deltas and risks.

Simulation Data:
${JSON.stringify(sanitizedPayload, null, 2)}

Return a JSON object conforming strictly to this format:
{
  "summary": "2-3 sentence summary explaining the direct impact of this decision on their finances.",
  "positiveImpacts": ["Any improvements in net worth, goal timeline, or investments, if applicable"],
  "negativeImpacts": ["Any reductions in savings, cash flow, emergency coverage, or health score"],
  "importantChanges": ["Key metrics that experience significant changes"],
  "riskExplanation": ["Clear explanations of any triggered risks or warning flags"],
  "suggestions": ["1-3 pragmatic adjustments the user could consider (e.g. phasing the purchase, adjusting monthly SIP)"],
  "disclaimer": "This is an informational analysis based on the provided financial data."
}
`.trim();

    // Enforce 12-second timeout on AI response
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timed out')), 60000)
    );

    const apiPromise = model.generateContent(prompt);
    const result = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = result.response.text();

    const parsed = parseJsonSafely(responseText);
    const validatedExplanation = validateSimulationExplanation(parsed);

    return {
      success: true,
      explanation: validatedExplanation
    };
  } catch (error) {
    console.error('[AI Explanation Service - Simulation Error]:', error.message);
    return {
      success: false,
      code: 'AI_GENERATION_FAILED',
      message: error.message || 'Error communicating with Gemini API.',
      explanation: getFallbackSimulationExplanation()
    };
  }
};

export default {
  explainFinancialOverview,
  explainSimulation
};

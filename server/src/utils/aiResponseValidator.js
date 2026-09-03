/**
 * AI Response Validator & JSON Sanitizer
 * Ensures all Gemini responses conform strictly to predefined TypeScript/JSON schemas
 */

const OVERVIEW_DISCLAIMER =
  'This explanation is informational and generated based on deterministic calculations. It does not constitute professional financial, legal, or investment advice.';

const SIMULATION_DISCLAIMER =
  'This simulation analysis is informational and calculated based on defined assumptions. It does not guarantee future financial outcomes.';

/**
 * Extracts and parses a JSON string safely
 * @param {string} text
 * @returns {object|null}
 */
export const parseJsonSafely = (text) => {
  if (!text || typeof text !== 'string') return null;

  try {
    let cleanText = text.trim();
    // Strip markdown code fences if present
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
    return JSON.parse(cleanText);
  } catch (err) {
    console.warn('[AI Validator] Failed to parse JSON from AI response:', err.message);
    return null;
  }
};

/**
 * Validates and normalizes Financial Overview Explanation
 * @param {object|null} parsed
 * @returns {object} Validated overview explanation
 */
export const validateOverviewExplanation = (parsed) => {
  if (!parsed || typeof parsed !== 'object') {
    return getFallbackOverviewExplanation();
  }

  const summary = typeof parsed.summary === 'string' && parsed.summary.trim()
    ? parsed.summary.trim()
    : 'Financial overview analysis calculated from your recorded profile and transaction history.';

  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const concerns = Array.isArray(parsed.concerns)
    ? parsed.concerns.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const recommendedActions = Array.isArray(parsed.recommendedActions)
    ? parsed.recommendedActions
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          priority: ['HIGH', 'MEDIUM', 'LOW'].includes(String(item.priority).toUpperCase())
            ? String(item.priority).toUpperCase()
            : 'MEDIUM',
          action: typeof item.action === 'string' ? item.action.trim() : 'Review financial allocation.',
          reason: typeof item.reason === 'string' ? item.reason.trim() : 'Supports overall financial resilience.'
        }))
    : [];

  return {
    summary,
    strengths,
    concerns,
    recommendedActions,
    disclaimer: typeof parsed.disclaimer === 'string' && parsed.disclaimer.trim()
      ? parsed.disclaimer.trim()
      : OVERVIEW_DISCLAIMER
  };
};

/**
 * Validates and normalizes Simulation Explanation
 * @param {object|null} parsed
 * @returns {object} Validated simulation explanation
 */
export const validateSimulationExplanation = (parsed) => {
  if (!parsed || typeof parsed !== 'object') {
    return getFallbackSimulationExplanation();
  }

  const summary = typeof parsed.summary === 'string' && parsed.summary.trim()
    ? parsed.summary.trim()
    : 'Simulation analysis calculated from your baseline finances and decision parameters.';

  const positiveImpacts = Array.isArray(parsed.positiveImpacts)
    ? parsed.positiveImpacts.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const negativeImpacts = Array.isArray(parsed.negativeImpacts)
    ? parsed.negativeImpacts.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const importantChanges = Array.isArray(parsed.importantChanges)
    ? parsed.importantChanges.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const riskExplanation = Array.isArray(parsed.riskExplanation)
    ? parsed.riskExplanation.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions.filter((item) => typeof item === 'string' && item.trim())
    : [];

  return {
    summary,
    positiveImpacts,
    negativeImpacts,
    importantChanges,
    riskExplanation,
    suggestions,
    disclaimer: typeof parsed.disclaimer === 'string' && parsed.disclaimer.trim()
      ? parsed.disclaimer.trim()
      : SIMULATION_DISCLAIMER
  };
};

/**
 * Fallback response when AI is offline or returns invalid JSON for Overview
 */
export const getFallbackOverviewExplanation = () => ({
  summary: 'Your financial overview has been calculated deterministically by the MoneyPilot engine.',
  strengths: ['Calculated financial metrics are available for review.'],
  concerns: [],
  recommendedActions: [
    {
      priority: 'MEDIUM',
      action: 'Review calculated metrics on the dashboard.',
      reason: 'AI explanation service is temporarily unavailable.'
    }
  ],
  disclaimer: OVERVIEW_DISCLAIMER
});

/**
 * Fallback response when AI is offline or returns invalid JSON for Simulation
 */
export const getFallbackSimulationExplanation = () => ({
  summary: 'Decision simulation has been calculated deterministically by the MoneyPilot engine.',
  positiveImpacts: [],
  negativeImpacts: [],
  importantChanges: ['Review the before and after numerical comparisons.'],
  riskExplanation: [],
  suggestions: ['Compare the baseline and projected cash flows before making a final decision.'],
  disclaimer: SIMULATION_DISCLAIMER
});

export default {
  parseJsonSafely,
  validateOverviewExplanation,
  validateSimulationExplanation,
  getFallbackOverviewExplanation,
  getFallbackSimulationExplanation
};

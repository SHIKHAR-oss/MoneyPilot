import { isGeminiConfigured, getGeminiModel } from '../config/gemini.js';
import { parseJsonSafely } from '../utils/aiResponseValidator.js';

const SYSTEM_INSTRUCTION = `
You are the AI Financial Assistant inside MoneyPilot, a personal financial decision intelligence platform.
Your core philosophy is: "AI can suggest. The system checks. The user decides."

CRITICAL ARCHITECTURE RULES:
1. All financial numbers, health scores, cash flows, and risks provided to you have already been calculated deterministically by MoneyPilot's calculation engines.
2. You must NEVER invent new financial numbers, account balances, or rates of return.
3. You must NEVER contradict the provided verified metrics.
4. If a user asks about data that is not recorded in the context (e.g. credit score, real estate value, specific tax brackets), clearly state that the data is not recorded in MoneyPilot instead of guessing.
5. Always clearly distinguish between calculated facts ("Calculated by MoneyPilot") and your recommendations ("AI suggestion").
6. Tone: Empathetic, objective, concise, and financially responsible. Avoid jargon overload.
7. NEVER give certified investment, legal, or tax advice; provide educational guidance.
8. Output MUST strictly be valid JSON matching the requested schema.
`.trim();

/**
 * Builds a sanitized, minimized financial context snapshot for the AI
 * Ensures no passwords, tokens, raw DB IDs, or extraneous metadata are leaked
 */
export const buildSanitizedFinancialContext = ({ metrics, healthScore, risks, breakdown }) => {
  // Sort and pick top expense categories
  const expensesByCategory = breakdown.ledger?.expensesByCategory || {};
  const totalExpenses = metrics.monthlyExpenses || 0;
  const topExpenses = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentageOfExpenses: totalExpenses > 0 ? `${Math.round((amt / totalExpenses) * 100)}%` : '0%'
    }));

  // Summarize goals
  const goalsSummary = (breakdown.goals?.items || []).map((g) => ({
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    progress: g.targetAmount > 0 ? `${Math.round((g.currentAmount / g.targetAmount) * 100)}%` : '0%',
    category: g.category
  }));

  // Summarize investments
  const investmentsSummary = (breakdown.investments?.items || []).map((inv) => ({
    name: inv.name,
    type: inv.type,
    currentValue: inv.currentValue,
    monthlyContribution: inv.monthlyContribution || 0
  }));

  return {
    cashFlowSummary: {
      monthlyIncome: metrics.monthlyIncome,
      monthlyExpenses: metrics.monthlyExpenses,
      monthlyCashFlow: metrics.monthlyCashFlow,
      savingsRate: `${metrics.savingsRate}%`,
      expenseToIncomeRatio: `${metrics.expenseToIncomeRatio}%`,
      emergencyFundCoverage: `${metrics.emergencyFundCoverage} months of expenses`
    },
    reservesAndAssets: {
      liquidSavings: metrics.currentSavings,
      dedicatedEmergencyFund: metrics.emergencyFund,
      totalInvestmentValue: metrics.totalInvestmentValue,
      totalMonthlySIP: breakdown.investments?.totalMonthlyContribution || 0,
      netWorth: metrics.netWorth
    },
    healthScoreOverview: {
      totalScore: healthScore.score,
      rating: healthScore.rating,
      components: healthScore.components
    },
    topExpenses,
    detectedRisks: (risks || []).map((r) => ({
      severity: r.severity,
      title: r.title,
      explanation: r.explanation
    })),
    goals: goalsSummary,
    investments: investmentsSummary,
    riskProfile: breakdown.profile?.riskProfile || 'moderate'
  };
};

/**
 * Deterministic offline fallback response generator based on user query keywords
 */
export const generateFallbackAssistantResponse = (query, context) => {
  const q = (query || '').toLowerCase();
  const { cashFlowSummary, healthScoreOverview, topExpenses, detectedRisks, reservesAndAssets } = context;

  if (q.includes('health') || q.includes('score')) {
    const lowestComponent = Object.entries(healthScoreOverview.components || {})
      .sort(([, a], [, b]) => (a.score || 0) - (b.score || 0))[0];

    const lowestName = lowestComponent ? lowestComponent[0] : 'buffer';
    const lowestScore = lowestComponent ? lowestComponent[1].score : 0;

    return {
      answer: `Your MoneyPilot Financial Health Score is currently ${healthScoreOverview.totalScore}/100 (${healthScoreOverview.rating}). Your lowest scoring pillar is ${lowestName} at ${lowestScore}/20. Increasing your emergency savings buffer and maintaining consistent monthly cash flow will have the fastest positive impact on your score.`,
      calculatedFacts: [
        `Overall Health Score: ${healthScoreOverview.totalScore}/100 (${healthScoreOverview.rating})`,
        `Emergency Coverage: ${cashFlowSummary.emergencyFundCoverage}`,
        `Monthly Savings Rate: ${cashFlowSummary.savingsRate}`
      ],
      suggestions: [
        `Focus on boosting your ${lowestName} score by allocating surplus cash flow to liquid reserves.`,
        `Maintain your current monthly savings rate of ${cashFlowSummary.savingsRate}.`
      ],
      disclaimer: 'This guidance is informational and calculated from your recorded financial metrics.'
    };
  }

  if (q.includes('spend') || q.includes('expense') || q.includes('cost')) {
    const topCat = topExpenses[0];
    const topCatStr = topCat ? `${topCat.category} (₹${topCat.amount.toLocaleString()}, ${topCat.percentageOfExpenses} of total expenses)` : 'no categorized expenses';

    return {
      answer: `Your recorded monthly expenses total ₹${cashFlowSummary.monthlyExpenses.toLocaleString()} (${cashFlowSummary.expenseToIncomeRatio} of your monthly income). Your highest recorded spending category is ${topCatStr}.`,
      calculatedFacts: [
        `Total Monthly Expenses: ₹${cashFlowSummary.monthlyExpenses.toLocaleString()}`,
        `Expense-to-Income Ratio: ${cashFlowSummary.expenseToIncomeRatio}`,
        `Top Spending Category: ${topCat ? topCat.category : 'N/A'}`
      ],
      suggestions: [
        `Review recurring subscriptions in your top spending categories to unlock additional monthly cash flow.`,
        `Aim to keep total essential expenses under 50-60% of take-home income.`
      ],
      disclaimer: 'This summary reflects only your actively recorded MoneyPilot transactions.'
    };
  }

  if (q.includes('save') || q.includes('savings') || q.includes('fund')) {
    return {
      answer: `Your current monthly cash flow surplus is ₹${cashFlowSummary.monthlyCashFlow.toLocaleString()} with a savings rate of ${cashFlowSummary.savingsRate}. Your liquid savings stand at ₹${reservesAndAssets.liquidSavings.toLocaleString()} with an emergency fund of ₹${reservesAndAssets.dedicatedEmergencyFund.toLocaleString()} (${cashFlowSummary.emergencyFundCoverage}).`,
      calculatedFacts: [
        `Current Savings Rate: ${cashFlowSummary.savingsRate}`,
        `Monthly Cash Flow Surplus: ₹${cashFlowSummary.monthlyCashFlow.toLocaleString()}`,
        `Emergency Buffer: ${cashFlowSummary.emergencyFundCoverage}`
      ],
      suggestions: [
        `Target accumulating 3 to 6 months of essential living expenses (approx. ₹${(cashFlowSummary.monthlyExpenses * 6).toLocaleString()}) in a dedicated liquid fund.`,
        `Automate monthly transfers right after income is received to keep your ${cashFlowSummary.savingsRate} savings rate consistent.`
      ],
      disclaimer: 'Calculated deterministically from your profile and ledger data.'
    };
  }

  // General default fallback
  return {
    answer: `Based on your MoneyPilot data, your monthly take-home income is ₹${cashFlowSummary.monthlyIncome.toLocaleString()} against ₹${cashFlowSummary.monthlyExpenses.toLocaleString()} in expenses, leaving a net cash flow of ₹${cashFlowSummary.monthlyCashFlow.toLocaleString()} (${cashFlowSummary.savingsRate} savings rate). Your financial health score is ${healthScoreOverview.totalScore}/100 with a net worth of ₹${reservesAndAssets.netWorth.toLocaleString()}.`,
    calculatedFacts: [
      `Monthly Cash Flow: ₹${cashFlowSummary.monthlyCashFlow.toLocaleString()}`,
      `Health Score: ${healthScoreOverview.totalScore}/100 (${healthScoreOverview.rating})`,
      `Liquid Reserves: ₹${reservesAndAssets.liquidSavings.toLocaleString()}`,
      `Net Worth: ₹${reservesAndAssets.netWorth.toLocaleString()}`
    ],
    suggestions: [
      `Maintain positive cash flow and consider simulating major purchases using the Decision Simulator before committing funds.`,
      `Review any detected risk alerts to prevent unexpected emergency fund depletion.`
    ],
    disclaimer: 'This explanation is informational and educational only. AI can suggest, the system checks, but you make the final decision.'
  };
};

/**
 * Generate a conversational response to a user's natural language financial question
 */
export const answerFinancialQuestion = async ({
  question,
  conversationHistory = [],
  metrics,
  healthScore,
  risks,
  breakdown
}) => {
  const sanitizedContext = buildSanitizedFinancialContext({
    metrics,
    healthScore,
    risks,
    breakdown
  });

  if (!isGeminiConfigured()) {
    return {
      success: true,
      source: 'deterministic_engine',
      response: generateFallbackAssistantResponse(question, sanitizedContext)
    };
  }

  try {
    const model = getGeminiModel();
    if (!model) {
      return {
        success: true,
        source: 'deterministic_engine',
        response: generateFallbackAssistantResponse(question, sanitizedContext)
      };
    }

    // Limit conversation history to the last 4 exchanges to prevent token bloat
    const limitedHistory = (conversationHistory || [])
      .slice(-4)
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        text: String(msg.content || msg.text || '').slice(0, 300)
      }));

    const prompt = `
${SYSTEM_INSTRUCTION}

VERIFIED FINANCIAL CONTEXT (Calculated by MoneyPilot):
${JSON.stringify(sanitizedContext, null, 2)}

RECENT CONVERSATION HISTORY:
${JSON.stringify(limitedHistory, null, 2)}

USER'S QUESTION:
"${question.trim()}"

Provide a comprehensive, accurate, and empathetic answer. Return ONLY a valid JSON object matching this schema:
{
  "answer": "Direct, clear answer to the user's question, grounded strictly in the numbers above. 2-4 concise paragraphs max.",
  "calculatedFacts": [
    "1 to 3 key verified facts or metrics calculated by MoneyPilot that directly support this answer"
  ],
  "suggestions": [
    "1 to 3 pragmatic steps or considerations the user can review"
  ],
  "disclaimer": "Informational and educational guidance based on your MoneyPilot data. You make the final financial decisions."
}
`.trim();

    // 60-second timeout on Gemini request
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timed out')), 60000)
    );

    const apiPromise = model.generateContent(prompt);
    const result = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = result.response.text();

    const parsed = parseJsonSafely(responseText);

    if (parsed && typeof parsed.answer === 'string') {
      return {
        success: true,
        source: 'gemini_ai',
        response: {
          answer: parsed.answer,
          calculatedFacts: Array.isArray(parsed.calculatedFacts) ? parsed.calculatedFacts : [],
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          disclaimer: parsed.disclaimer || 'Informational and educational guidance based on your MoneyPilot data.'
        }
      };
    }

    // Fallback if parsing didn't match schema
    return {
      success: true,
      source: 'deterministic_engine',
      response: generateFallbackAssistantResponse(question, sanitizedContext)
    };
  } catch (error) {
    console.warn('[AI Assistant Service] Falling back to deterministic response:', error.message);
    return {
      success: true,
      source: 'deterministic_engine',
      fallbackNotice: 'AI service temporarily unavailable; response generated from verified MoneyPilot calculations.',
      response: generateFallbackAssistantResponse(question, sanitizedContext)
    };
  }
};

export default {
  buildSanitizedFinancialContext,
  generateFallbackAssistantResponse,
  answerFinancialQuestion
};

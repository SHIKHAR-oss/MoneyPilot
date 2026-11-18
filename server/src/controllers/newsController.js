import { getFinancialNews, getPersonalizedArticleImpact, NEWS_CATEGORIES } from '../services/newsService.js';
import { getUserFinancialData } from '../services/financialDataService.js';
import { calculateFinancialMetrics } from '../engines/metricsEngine.js';
import { calculateFinancialHealthScore } from '../engines/healthScoreEngine.js';

/**
 * Get real financial news articles by category
 * @route GET /api/news
 */
export const getNewsArticles = async (req, res) => {
  try {
    const rawCategory = req.query.category || 'All';
    const category = NEWS_CATEGORIES.includes(rawCategory) ? rawCategory : 'All';

    const result = await getFinancialNews(category);

    return res.status(200).json({
      status: 'success',
      data: {
        category: result.category,
        count: result.count,
        cached: result.cached,
        stale: Boolean(result.stale),
        lastUpdated: result.lastUpdated,
        availableCategories: NEWS_CATEGORIES,
        articles: result.articles
      }
    });
  } catch (error) {
    console.error('[News Controller Error]:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch financial news. Please try again later.'
    });
  }
};

/**
 * Generate on-demand personalized "Why this matters to you" explanation for an article
 * @route POST /api/news/personalize
 */
export const personalizeArticle = async (req, res) => {
  try {
    const userId = req.user._id;
    const { article } = req.body;

    if (!article || typeof article !== 'object' || !article.title || !String(article.title).trim()) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ARTICLE_PAYLOAD',
        message: 'A valid article object with a non-empty title is required.'
      });
    }

    // 1. Fetch current user's financial data
    const financialData = await getUserFinancialData(userId);

    // 2. Deterministic calculations
    const metrics = calculateFinancialMetrics(financialData);
    const healthScore = calculateFinancialHealthScore(metrics, financialData);

    // 3. Prepare sanitized user financial summary (data minimization)
    const userFinancialSummary = {
      healthScore: {
        score: healthScore.score,
        rating: healthScore.rating
      },
      cashFlow: {
        monthlyIncome: metrics.monthlyIncome,
        monthlyExpenses: metrics.monthlyExpenses,
        monthlyCashFlow: metrics.monthlyCashFlow,
        savingsRate: `${metrics.savingsRate}%`,
        expenseToIncomeRatio: `${metrics.expenseToIncomeRatio}%`
      },
      reserves: {
        liquidSavings: metrics.currentSavings,
        emergencyFund: metrics.emergencyFund,
        emergencyCoverage: `${metrics.emergencyFundCoverage} months`
      },
      investments: {
        totalValue: metrics.totalInvestmentValue,
        totalMonthlySIP: financialData.investments?.totalMonthlyContribution || 0
      },
      goals: {
        totalCount: financialData.goals?.count || 0
      },
      riskProfile: financialData.profile?.riskProfile || 'moderate'
    };

    // 4. Generate or retrieve cached personalization
    const result = await getPersonalizedArticleImpact({
      userId,
      article: {
        id: article.id || article.link,
        title: String(article.title).trim(),
        category: article.category || 'Financial News',
        source: article.source || 'Financial Media',
        description: article.description || '',
        link: article.link || ''
      },
      userFinancialSummary
    });

    return res.status(200).json({
      status: 'success',
      data: {
        impactAnalysis: result.impactAnalysis,
        userContextFactors: result.userContextFactors,
        disclaimer: result.disclaimer,
        source: result.source || 'ai_engine',
        cached: Boolean(result.cached)
      }
    });
  } catch (error) {
    console.error('[News Controller - Personalization Error]:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate personalized news analysis.'
    });
  }
};

export default {
  getNewsArticles,
  personalizeArticle
};

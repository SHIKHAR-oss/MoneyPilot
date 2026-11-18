import { isGeminiConfigured, getGeminiModel } from '../config/gemini.js';
import { parseJsonSafely } from '../utils/aiResponseValidator.js';

export const NEWS_CATEGORIES = [
  'All',
  'Market',
  'Economy',
  'Banking',
  'Personal Finance',
  'Mutual Funds',
  'Stocks',
  'RBI',
  'Government / Tax'
];

const CATEGORY_RSS_URLS = {
  'All': 'https://news.google.com/rss/search?q=business+finance+stock+market+india&hl=en-IN&gl=IN&ceid=IN:en',
  'Market': 'https://news.google.com/rss/search?q=indian+stock+market+sensex+nifty&hl=en-IN&gl=IN&ceid=IN:en',
  'Economy': 'https://news.google.com/rss/search?q=india+economy+gdp+inflation&hl=en-IN&gl=IN&ceid=IN:en',
  'Banking': 'https://news.google.com/rss/search?q=indian+banking+sector+banks+loans&hl=en-IN&gl=IN&ceid=IN:en',
  'Personal Finance': 'https://news.google.com/rss/search?q=personal+finance+savings+investing+india&hl=en-IN&gl=IN&ceid=IN:en',
  'Mutual Funds': 'https://news.google.com/rss/search?q=mutual+funds+sip+nav+india&hl=en-IN&gl=IN&ceid=IN:en',
  'Stocks': 'https://news.google.com/rss/search?q=stocks+shares+equity+india+bse+nse&hl=en-IN&gl=IN&ceid=IN:en',
  'RBI': 'https://news.google.com/rss/search?q=reserve+bank+of+india+rbi+monetary+policy&hl=en-IN&gl=IN&ceid=IN:en',
  'Government / Tax': 'https://news.google.com/rss/search?q=income+tax+india+gst+budget+ministry+of+finance&hl=en-IN&gl=IN&ceid=IN:en'
};

// 15-minute in-memory cache for news feeds per category
const newsCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

// In-memory cache for personalized article explanations: key -> { timestamp, data }
const personalizationCache = new Map();
const PERSONALIZATION_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Decode HTML entities and strip XML/HTML tags
 */
export const cleanHtmlText = (str = '') => {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Normalizes an XML string into clean, structured, deduplicated article objects
 */
export const parseRssFeedXml = (xmlText, assignedCategory = 'Market') => {
  if (!xmlText || typeof xmlText !== 'string') return [];

  const articles = [];
  const seenUrls = new Set();
  const seenTitles = new Set();

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link\s*\/?>([\s\S]*?)<\/link>/i) || block.match(/<link>([^<]+)/i);
    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i);

    let rawTitle = titleMatch ? cleanHtmlText(titleMatch[1]) : '';
    let rawLink = linkMatch ? linkMatch[1].trim() : '';
    let rawPubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
    let rawSource = sourceMatch ? cleanHtmlText(sourceMatch[1]) : '';
    let rawDesc = descMatch ? cleanHtmlText(descMatch[1]) : '';

    // Strip trailing source name from title if source is already provided or suffixed
    if (rawSource && rawTitle.endsWith(` - ${rawSource}`)) {
      rawTitle = rawTitle.slice(0, -(rawSource.length + 3)).trim();
    } else if (!rawSource && rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      rawSource = parts.pop().trim();
      rawTitle = parts.join(' - ').trim();
    }

    if (!rawTitle || !rawLink) continue;

    // Deduplicate
    const normalizedUrl = rawLink.split('?')[0].toLowerCase();
    const normalizedTitleKey = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (seenUrls.has(normalizedUrl) || seenTitles.has(normalizedTitleKey)) {
      continue;
    }
    seenUrls.add(normalizedUrl);
    seenTitles.add(normalizedTitleKey);

    // Provide clean description if RSS description was only an HTML link
    let description = rawDesc;
    if (!description || description.length < 25 || description.startsWith('http')) {
      description = `${rawTitle}. Published by ${rawSource || 'Financial Media'}. Read the complete story at the original publisher.`;
    }

    // Format safe date
    let publishedAt = rawPubDate;
    const parsedDate = new Date(rawPubDate);
    if (!isNaN(parsedDate.getTime())) {
      publishedAt = parsedDate.toISOString();
    }

    // Create unique deterministic ID
    const articleId = Buffer.from(`${rawLink}-${rawTitle.slice(0, 20)}`).toString('base64url').slice(0, 24);

    articles.push({
      id: articleId,
      title: rawTitle,
      source: rawSource || 'Financial News',
      link: rawLink,
      publishedAt,
      description,
      category: assignedCategory
    });
  }

  return articles;
};

/**
 * Fetch financial news for a requested category with 15-minute in-memory caching
 */
export const getFinancialNews = async (category = 'All') => {
  const normalizedCategory = NEWS_CATEGORIES.includes(category) ? category : 'All';
  const now = Date.now();

  // Check cache
  const cached = newsCache.get(normalizedCategory);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS) && cached.articles.length > 0) {
    return {
      category: normalizedCategory,
      count: cached.articles.length,
      cached: true,
      lastUpdated: new Date(cached.timestamp).toISOString(),
      articles: cached.articles
    };
  }

  const feedUrl = CATEGORY_RSS_URLS[normalizedCategory] || CATEGORY_RSS_URLS['All'];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (MoneyPilot Financial Decision Engine; Node.js/20)'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`News provider returned HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parsedArticles = parseRssFeedXml(xmlText, normalizedCategory);

    if (parsedArticles.length === 0 && cached && cached.articles.length > 0) {
      // If new fetch was empty but cache exists, return stale cache gracefully
      return {
        category: normalizedCategory,
        count: cached.articles.length,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString(),
        articles: cached.articles
      };
    }

    // Store in cache
    newsCache.set(normalizedCategory, {
      timestamp: now,
      articles: parsedArticles
    });

    return {
      category: normalizedCategory,
      count: parsedArticles.length,
      cached: false,
      lastUpdated: new Date(now).toISOString(),
      articles: parsedArticles
    };
  } catch (error) {
    console.error(`[News Service] Failed to fetch news for ${normalizedCategory}:`, error.message);

    // If cache exists even if expired, return it as resilient fallback
    if (cached && cached.articles.length > 0) {
      return {
        category: normalizedCategory,
        count: cached.articles.length,
        cached: true,
        stale: true,
        lastUpdated: new Date(cached.timestamp).toISOString(),
        articles: cached.articles
      };
    }

    throw new Error(`Could not retrieve financial news: ${error.message}`);
  }
};

/**
 * Deterministic offline personalized impact synthesizer
 */
export const synthesizeFallbackPersonalization = ({ article, userFinancialSummary }) => {
  const { healthScore, cashFlow, reserves, investments, goals, riskProfile } = userFinancialSummary;
  const category = (article.category || '').toLowerCase();
  const title = (article.title || '').toLowerCase();

  const factors = [
    `Financial Health Score: ${healthScore.score}/100 (${healthScore.rating})`,
    `Monthly Cash Flow: ₹${cashFlow.monthlyCashFlow.toLocaleString('en-IN')} (${cashFlow.savingsRate} savings rate)`,
    `Liquid Reserves: ₹${reserves.liquidSavings.toLocaleString('en-IN')} (${reserves.emergencyCoverage} coverage)`
  ];

  if (investments.totalMonthlySIP > 0) {
    factors.push(`Active Monthly SIP: ₹${investments.totalMonthlySIP.toLocaleString('en-IN')}/mo`);
  }

  let impact = '';

  if (category === 'rbi' || title.includes('repo') || title.includes('rate') || title.includes('inflation')) {
    impact = `RBI interest rate adjustments directly influence your borrowing and fixed-income returns. With ₹${reserves.liquidSavings.toLocaleString('en-IN')} in liquid reserves and ${reserves.emergencyCoverage} of emergency fund coverage, rate shifts affect the yield on your liquid savings. Since your risk profile is ${riskProfile}, maintaining your liquid buffer shields your monthly cash flow of ₹${cashFlow.monthlyCashFlow.toLocaleString('en-IN')} against rising cost-of-living pressure.`;
  } else if (category === 'mutual funds' || category === 'stocks' || category === 'market' || title.includes('nifty') || title.includes('sensex') || title.includes('sip')) {
    impact = `Market movements directly impact your investment portfolio of ₹${investments.totalValue.toLocaleString('en-IN')} and your monthly SIP of ₹${investments.totalMonthlySIP.toLocaleString('en-IN')}. For a ${riskProfile} investor, market volatility is a natural part of long-term compounding. Maintaining consistent SIP contributions without pausing helps average out acquisition costs across your active financial goals.`;
  } else if (category === 'government / tax' || title.includes('tax') || title.includes('gst') || title.includes('budget')) {
    impact = `Tax and fiscal policy changes directly alter take-home monthly income. With your current monthly take-home cash flow of ₹${cashFlow.monthlyCashFlow.toLocaleString('en-IN')} and an expense-to-income ratio of ${cashFlow.expenseToIncomeRatio}, any adjustments to tax deductions or exemption slabs can expand your monthly surplus and accelerate progress on your ${goals.totalCount} financial goals.`;
  } else if (category === 'banking' || title.includes('bank') || title.includes('deposit') || title.includes('loan')) {
    impact = `Banking regulations and lending rate adjustments affect credit products and savings account yields. With liquid savings of ₹${reserves.liquidSavings.toLocaleString('en-IN')}, evaluate high-yield sweep accounts or fixed deposits for your emergency reserves while preserving instant liquidity for emergencies.`;
  } else {
    impact = `This macroeconomic development has indirect effects on consumer prices and portfolio valuation. Given your current ${healthScore.score}/100 (${healthScore.rating}) health score and positive cash flow of ₹${cashFlow.monthlyCashFlow.toLocaleString('en-IN')}, you maintain solid resilience against unexpected financial headwinds.`;
  }

  return {
    impactAnalysis: impact,
    userContextFactors: factors,
    disclaimer: 'Informational AI interpretation based on your MoneyPilot financial records. Not financial advice. The original publisher remains the factual source.'
  };
};

/**
 * Generate on-demand personalized "Why This Matters To You" explanation for a specific article
 */
export const getPersonalizedArticleImpact = async ({ userId, article, userFinancialSummary }) => {
  const cacheKey = `${userId}:${article.id || article.link}`;
  const now = Date.now();

  const cached = personalizationCache.get(cacheKey);
  if (cached && (now - cached.timestamp < PERSONALIZATION_CACHE_TTL_MS)) {
    return {
      cached: true,
      ...cached.data
    };
  }

  // If Gemini is not configured, generate verified deterministic impact
  if (!isGeminiConfigured()) {
    const result = synthesizeFallbackPersonalization({ article, userFinancialSummary });
    personalizationCache.set(cacheKey, { timestamp: now, data: result });
    return { cached: false, source: 'deterministic_engine', ...result };
  }

  try {
    const model = getGeminiModel();
    if (!model) {
      const result = synthesizeFallbackPersonalization({ article, userFinancialSummary });
      personalizationCache.set(cacheKey, { timestamp: now, data: result });
      return { cached: false, source: 'deterministic_engine', ...result };
    }

    const prompt = `
You are the financial intelligence analyst for MoneyPilot.
Core principle: "AI can suggest. The system checks. The user decides."

ARTICLE:
Headline: "${article.title}"
Category: "${article.category}"
Publisher: "${article.source}"
Summary: "${article.description}"

USER'S VERIFIED FINANCIAL METRICS (Calculated by MoneyPilot):
- Financial Health Score: ${userFinancialSummary.healthScore.score}/100 (${userFinancialSummary.healthScore.rating})
- Monthly Net Cash Flow: ₹${userFinancialSummary.cashFlow.monthlyCashFlow.toLocaleString()} (${userFinancialSummary.cashFlow.savingsRate} savings rate)
- Monthly Expenses: ₹${userFinancialSummary.cashFlow.monthlyExpenses.toLocaleString()} (${userFinancialSummary.cashFlow.expenseToIncomeRatio} of income)
- Liquid Savings: ₹${userFinancialSummary.reserves.liquidSavings.toLocaleString()}
- Dedicated Emergency Fund: ₹${userFinancialSummary.reserves.emergencyFund.toLocaleString()} (${userFinancialSummary.reserves.emergencyCoverage} months coverage)
- Total Investments: ₹${userFinancialSummary.investments.totalValue.toLocaleString()} (Monthly SIP: ₹${userFinancialSummary.investments.totalMonthlySIP.toLocaleString()})
- Goals Tracked: ${userFinancialSummary.goals.totalCount} active goals
- Risk Tolerance Profile: ${userFinancialSummary.riskProfile}

TASK:
Explain "Why This Matters To You" in 2 to 3 concise, empathetic, and objective sentences.
Connect this real news story to the user's actual financial numbers (e.g. how it touches their savings buffer, monthly SIP, cash flow, or risk profile).
Do NOT invent new account numbers. Do NOT give certified investment advice or recommend buying specific individual stocks.

Return ONLY a valid JSON object matching this schema:
{
  "impactAnalysis": "2-3 sentence personalized explanation connecting this news event to their actual financial position.",
  "userContextFactors": [
    "1-3 short badges indicating which user metrics are relevant (e.g., 'Emergency Buffer: 5 months', 'Monthly SIP: ₹10,000', 'Risk Profile: Moderate')"
  ],
  "disclaimer": "Informational AI interpretation based on your MoneyPilot financial records. Not financial advice. The original publisher remains the factual source."
}
`.trim();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 60000)
    );

    const apiPromise = model.generateContent(prompt);
    const result = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = result.response.text();
    const parsed = parseJsonSafely(responseText);

    if (parsed && typeof parsed.impactAnalysis === 'string') {
      const finalData = {
        impactAnalysis: parsed.impactAnalysis,
        userContextFactors: Array.isArray(parsed.userContextFactors) ? parsed.userContextFactors : [
          `Health Score: ${userFinancialSummary.healthScore.score}/100`,
          `Cash Flow: ₹${userFinancialSummary.cashFlow.monthlyCashFlow.toLocaleString()}`,
          `Risk Profile: ${userFinancialSummary.riskProfile}`
        ],
        disclaimer: parsed.disclaimer || 'Informational AI interpretation based on your MoneyPilot financial records. Not financial advice.'
      };

      personalizationCache.set(cacheKey, { timestamp: now, data: finalData });
      return { cached: false, source: 'gemini_ai', ...finalData };
    }

    // Fallback if parsing failed
    const fallbackResult = synthesizeFallbackPersonalization({ article, userFinancialSummary });
    personalizationCache.set(cacheKey, { timestamp: now, data: fallbackResult });
    return { cached: false, source: 'deterministic_engine', ...fallbackResult };
  } catch (err) {
    console.warn('[News Service] AI personalization fallback:', err.message);
    const fallbackResult = synthesizeFallbackPersonalization({ article, userFinancialSummary });
    personalizationCache.set(cacheKey, { timestamp: now, data: fallbackResult });
    return { cached: false, source: 'deterministic_engine', ...fallbackResult };
  }
};

export default {
  NEWS_CATEGORIES,
  cleanHtmlText,
  parseRssFeedXml,
  getFinancialNews,
  getPersonalizedArticleImpact
};

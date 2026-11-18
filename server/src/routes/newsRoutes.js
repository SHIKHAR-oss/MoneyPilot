import { Router } from 'express';
import { getNewsArticles, personalizeArticle } from '../controllers/newsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Public / Authenticated read news feed (fast, cached, does not call Gemini)
router.get('/', getNewsArticles);

// Authenticated, rate-limited on-demand AI personalization endpoint
router.post('/personalize', authenticate, requireDb, aiRateLimiter, personalizeArticle);

export default router;

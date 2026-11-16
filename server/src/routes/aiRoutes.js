import { Router } from 'express';
import { explainOverview, explainSimulationDecision, askAssistant } from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Protected AI explanation & assistant routes
router.use(authenticate, requireDb);

router.post('/explain-overview', aiRateLimiter, explainOverview);
router.post('/explain-simulation', aiRateLimiter, explainSimulationDecision);
router.post('/assistant', aiRateLimiter, askAssistant);

export default router;

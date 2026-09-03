import { Router } from 'express';
import { explainOverview, explainSimulationDecision } from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Protected AI explanation routes
router.use(authenticate, requireDb);

router.post('/explain-overview', explainOverview);
router.post('/explain-simulation', explainSimulationDecision);

export default router;

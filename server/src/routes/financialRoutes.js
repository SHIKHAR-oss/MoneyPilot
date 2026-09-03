import { Router } from 'express';
import { getFinancialOverview } from '../controllers/financialController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Protected financial intelligence routes
router.use(authenticate, requireDb);

router.get('/overview', getFinancialOverview);

export default router;

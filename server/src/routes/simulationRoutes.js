import { Router } from 'express';
import { runSimulation } from '../controllers/simulationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Protected decision simulation routes
router.use(authenticate, requireDb);

router.post('/run', runSimulation);

export default router;

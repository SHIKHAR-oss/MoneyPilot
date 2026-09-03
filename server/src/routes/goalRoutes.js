import { Router } from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from '../controllers/goalController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// All goal endpoints require authentication and active database
router.use(authenticate, requireDb);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;

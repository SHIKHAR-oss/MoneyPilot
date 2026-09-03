import { Router } from 'express';
import {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment
} from '../controllers/investmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// All investment endpoints require authentication and active database
router.use(authenticate, requireDb);

router.get('/', getInvestments);
router.post('/', createInvestment);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);

export default router;

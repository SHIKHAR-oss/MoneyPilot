import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// All transaction endpoints require authentication and active database
router.use(authenticate, requireDb);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;

import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public auth routes (require database availability)
router.post('/register', requireDb, register);
router.post('/login', requireDb, login);

// Protected auth route
router.get('/me', authenticate, getMe);

export default router;

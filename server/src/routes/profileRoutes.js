import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// All profile routes are protected by authentication & require database
router.use(authenticate, requireDb);

router.get('/', getProfile);
router.put('/', upsertProfile);
router.post('/', upsertProfile);

export default router;

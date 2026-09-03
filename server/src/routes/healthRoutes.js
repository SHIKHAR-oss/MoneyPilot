import { Router } from 'express';
import { getDbStatus, isDbConnected } from '../config/db.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to verify server status, environment, and DB status
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'MoneyPilot API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: getDbStatus(),
      connected: isDbConnected()
    }
  });
});

export default router;

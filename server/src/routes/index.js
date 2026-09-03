import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import goalRoutes from './goalRoutes.js';
import investmentRoutes from './investmentRoutes.js';
import financialRoutes from './financialRoutes.js';
import simulationRoutes from './simulationRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

// Public / System routes
router.use('/health', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// User financial domain CRUD routes
router.use('/profile', profileRoutes);
router.use('/transactions', transactionRoutes);
router.use('/goals', goalRoutes);
router.use('/investments', investmentRoutes);

// Deterministic financial intelligence & simulation routes
router.use('/financial', financialRoutes);
router.use('/simulations', simulationRoutes);

// AI Explanation routes
router.use('/ai', aiRoutes);

export default router;

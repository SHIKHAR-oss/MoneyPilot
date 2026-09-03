import { isDbConnected } from '../config/db.js';

/**
 * Middleware to ensure MongoDB is available before database-dependent route execution
 */
export const requireDb = (req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      status: 'error',
      code: 'DB_UNAVAILABLE',
      message: 'Database service is currently unavailable. Please configure and verify MONGODB_URI.'
    });
  }
  next();
};

export default requireDb;

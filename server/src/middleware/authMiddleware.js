import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

/**
 * Authentication Middleware
 * Validates incoming JWT Bearer token and attaches authenticated user to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        code: 'AUTH_TOKEN_MISSING',
        message: 'Authentication required. No Bearer token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        code: 'AUTH_TOKEN_INVALID',
        message: 'Malformed authorization header.'
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          code: 'AUTH_TOKEN_EXPIRED',
          message: 'Authentication token has expired. Please log in again.'
        });
      }
      return res.status(401).json({
        status: 'error',
        code: 'AUTH_TOKEN_INVALID',
        message: 'Invalid or manipulated authentication token.'
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        status: 'error',
        code: 'AUTH_TOKEN_INVALID',
        message: 'Token payload does not contain user identifier.'
      });
    }

    // If database is connected, verify user exists in database
    if (isDbConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          status: 'error',
          code: 'AUTH_USER_NOT_FOUND',
          message: 'User belonging to this token no longer exists.'
        });
      }
      req.user = user;
    } else {
      // Degraded fallback when testing without DB
      req.user = { _id: decoded.id };
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error encountered.'
    });
  }
};

export default authenticate;

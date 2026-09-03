import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is not defined.');
    }
    // Fallback secret for non-production development environments
    return 'moneypilot_dev_default_jwt_secret_2026_finance_engine';
  }
  return secret;
};

/**
 * Generate a signed JWT token for a user
 * @param {string|object} userOrId - User's MongoDB ObjectId string or user object
 * @returns {string} Signed JWT string
 */
export const generateToken = (userOrId) => {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const id = typeof userOrId === 'object' && userOrId !== null
    ? String(userOrId._id || userOrId.id)
    : String(userOrId);
  return jwt.sign({ id }, secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT string to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};

export default {
  generateToken,
  verifyToken
};

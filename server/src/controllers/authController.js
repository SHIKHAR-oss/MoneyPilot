import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    // Create user (password is hashed in User pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    const token = generateToken(user._id.toString());

    return res.status(201).json({
      status: 'success',
      message: 'Account registered successfully.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error during registration.'
    });
  }
};

/**
 * Log in an existing user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Explicitly select password field to verify
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id.toString());
    const sanitizedUser = user.toJSON();

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      data: {
        user: sanitizedUser,
        token
      }
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error during login.'
    });
  }
};

/**
 * Get authenticated user's current profile
 * @route GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('[Auth getMe Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error retrieving user profile.'
    });
  }
};

export default {
  register,
  login,
  getMe
};

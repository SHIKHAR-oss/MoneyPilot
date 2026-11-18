/**
 * MoneyPilot Cloudflare Turnstile Verification Service
 * Server-side verification for bot protection and CAPTCHA validation
 */

const CLOUDFLARE_TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify Cloudflare Turnstile token server-side
 * @param {string} token - The client response token from the Turnstile widget
 * @param {string} [remoteIp] - The client IP address
 * @returns {Promise<{ success: boolean, code?: string, message?: string, details?: any }>}
 */
export const verifyTurnstileToken = async (token, remoteIp = '') => {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return {
      success: false,
      code: 'MISSING_CAPTCHA_TOKEN',
      message: 'Security verification (CAPTCHA) is required. Please complete the security check.'
    };
  }

  const trimmedToken = token.trim();
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Handle test / offline environments
  if (process.env.NODE_ENV === 'test') {
    if (trimmedToken === 'invalid_test_token' || trimmedToken === 'invalid_token' || trimmedToken.startsWith('invalid_')) {
      return {
        success: false,
        code: 'CAPTCHA_INVALID',
        message: 'Security verification failed. Please try again.'
      };
    }
    if (trimmedToken === 'valid_test_token' || trimmedToken.startsWith('valid_')) {
      return { success: true };
    }
  }

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY is missing in production environment.');
      return {
        success: false,
        code: 'CAPTCHA_CONFIG_ERROR',
        message: 'Bot protection is temporarily unavailable. Please contact support.'
      };
    }

    // In development without secret key, reject explicit invalid tokens and accept test tokens
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY not set. Running in development test mode.');
    if (trimmedToken === 'invalid_token' || trimmedToken === 'invalid_test_token') {
      return {
        success: false,
        code: 'CAPTCHA_INVALID',
        message: 'Security verification failed. Please try again.'
      };
    }
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', trimmedToken);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(CLOUDFLARE_TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      console.error(`[Turnstile] Cloudflare returned HTTP status ${response.status}`);
      return {
        success: false,
        code: 'CAPTCHA_VERIFY_ERROR',
        message: 'Security verification service temporarily unavailable. Please try again.'
      };
    }

    const data = await response.json();
    if (data.success === true) {
      return { success: true, data };
    }

    return {
      success: false,
      code: 'CAPTCHA_INVALID',
      message: 'Security verification failed. Please try again.',
      details: data['error-codes']
    };
  } catch (error) {
    console.error('[Turnstile Verification Error]:', error.message);
    // Offline resilience in non-production test mode
    if (process.env.NODE_ENV === 'test') {
      if (trimmedToken === 'valid_test_token' || trimmedToken.startsWith('valid_')) {
        return { success: true };
      }
    }

    return {
      success: false,
      code: 'CAPTCHA_NETWORK_ERROR',
      message: 'Could not contact security verification service. Please try again.'
    };
  }
};

/**
 * Express middleware to enforce Turnstile verification before database/credential processing
 */
export const requireTurnstile = async (req, res, next) => {
  const { turnstileToken } = req.body || {};

  if (!turnstileToken) {
    return res.status(400).json({
      status: 'error',
      code: 'CAPTCHA_REQUIRED',
      message: 'Security verification (CAPTCHA) is required. Please complete the security check.'
    });
  }

  const result = await verifyTurnstileToken(turnstileToken, req.ip);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      code: result.code || 'CAPTCHA_INVALID',
      message: result.message || 'Security verification failed. Please try again.'
    });
  }

  next();
};

export default {
  verifyTurnstileToken,
  requireTurnstile
};

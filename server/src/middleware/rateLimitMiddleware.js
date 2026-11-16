/**
 * In-Memory Sliding Window Rate Limiter
 * Provides low-risk, dependency-free abuse protection for expensive AI endpoints
 */

export const createRateLimiter = ({
  windowMs = 10 * 60 * 1000, // 10 minutes
  max = 30, // max 30 requests per window
  message = 'Too many AI requests. Please wait a few moments before trying again.',
  code = 'AI_RATE_LIMIT_EXCEEDED'
} = {}) => {
  const requests = new Map();

  // Periodically cleanup expired entries every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter((t) => now - t < windowMs);
      if (validTimestamps.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, validTimestamps);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval so it doesn't hold the Node process open in test suites
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Identify client by user ID if authenticated, otherwise by IP
    const clientId = req.user?._id ? req.user._id.toString() : (req.ip || req.connection.remoteAddress || 'anonymous');
    const now = Date.now();

    const clientTimestamps = requests.get(clientId) || [];
    const validTimestamps = clientTimestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= max) {
      const oldestTimestamp = validTimestamps[0];
      const retryAfterSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);

      return res.status(429).json({
        status: 'error',
        code,
        message,
        retryAfter: retryAfterSeconds
      });
    }

    validTimestamps.push(now);
    requests.set(clientId, validTimestamps);
    next();
  };
};

export const aiRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: 'Too many AI Assistant questions in a short period. Please wait a few moments before asking again.'
});

export default aiRateLimiter;

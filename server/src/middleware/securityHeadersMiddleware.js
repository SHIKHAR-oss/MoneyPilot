/**
 * Security Headers Middleware
 * Attaches standard, recommended HTTP security headers without extra dependencies
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking by disallowing framing
  res.setHeader('X-Frame-Options', 'DENY');

  // Modern browsers disable legacy XSS filter to prevent side-channel exploits
  res.setHeader('X-XSS-Protection', '0');

  // Control referrer information sent in HTTP headers
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent browser from caching sensitive financial API responses
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/health')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

export default securityHeaders;

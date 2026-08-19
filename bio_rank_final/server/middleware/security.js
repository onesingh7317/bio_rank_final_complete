function createLimiter(windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests. Please try again later.') {
  const hits = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leak
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now - record.start > windowMs) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (timer.unref) timer.unref();

  return (req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = (forwarded ? forwarded.split(',')[0].trim() : req.ip) || req.socket.remoteAddress || 'unknown';
    const key = `${req.baseUrl || ''}:${clientIp}`;
    const now = Date.now();
    const record = hits.get(key) || { count: 0, start: now };

    if (now - record.start > windowMs) {
      record.count = 1;
      record.start = now;
    } else {
      record.count++;
    }
    hits.set(key, record);

    if (record.count > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

// Global API rate limiter (120 req / 15 min)
function rateLimiter(windowMs = 15 * 60 * 1000, max = 120) {
  return createLimiter(windowMs, max, 'Too many requests from this IP. Please try again later.');
}

// Strict Authentication rate limiter (10 attempts / 15 min to prevent brute force)
function authRateLimiter(windowMs = 15 * 60 * 1000, max = 10) {
  return createLimiter(windowMs, max, 'Too many login or registration attempts. Please try again after 15 minutes.');
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy allowing local assets, Google fonts, and HTTPS images
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:* https:;"
  );
  
  res.removeHeader('X-Powered-By');
  next();
}

module.exports = { rateLimiter, authRateLimiter, securityHeaders };

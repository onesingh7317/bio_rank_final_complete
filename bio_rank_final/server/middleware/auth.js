const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn(
    '[auth] WARNING: JWT_SECRET is not set in the environment. Using an ' +
    'insecure development fallback. Set JWT_SECRET before deploying.'
  );
  return 'dev-only-insecure-secret-do-not-use-in-production';
})();

/* ============================================================
   requireAuth — verifies the JWT on the Authorization header
   ("Bearer <token>"), attaches { userId, role } to req.user.
   Use on any route that needs a logged-in user (student or admin).
   ============================================================ */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/* ============================================================
   requireAdmin — must run AFTER requireAuth (relies on req.user).
   Server-side role check, per the requirement that this is the real
   protection, not the frontend route guard.
   ============================================================ */
function requireAdmin(req, res, next) {
  if (!req.user) {
    // Defensive: this middleware is misused if requireAuth didn't run first.
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

/* ============================================================
   optionalAuth — parses the JWT if present, but does not block if absent.
   Attaches req.user if a valid token is provided.
   ============================================================ */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { userId: decoded.userId, role: decoded.role };
    } catch (err) {
      // Invalid/expired token -> continue as unauthenticated guest
    }
  }
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth, JWT_SECRET };

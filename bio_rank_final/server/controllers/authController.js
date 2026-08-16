const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const TOKEN_EXPIRY = '7d';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ userId: user._id.toString(), role: user.role }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

function publicUser(user) {
  // Never send passwordHash back to the client.
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    targetYear: user.targetYear,
    board: user.board,
    studyHoursPerDay: user.studyHoursPerDay,
    configured: user.configured,
    foundationDone: user.foundationDone,
  };
}

/* ---- POST /api/auth/signup ----
   Always creates role: 'student'. There is intentionally no way to pass
   a role in from the request body — admin accounts are created only via
   the seed script (scripts/seedAdmin.js), never through this route. */
async function signup(req, res) {
  try {
    const { name, username, email, password } = req.body || {};

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'name, username, email, and password are all required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email or username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: 'student', // hardcoded — see comment above
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('[auth.signup]', err);
    return res.status(500).json({ error: 'Signup failed.' });
  }
}

/* ---- POST /api/auth/login ----
   Accepts email OR username in a single `identifier` field, since the
   frontend's profile screen lets a student have both. */
async function login(req, res) {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier and password are required.' });
    }

    const normalized = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalized }, { username: normalized }],
    });

    // Same error message whether the user doesn't exist or the password is
    // wrong — don't leak which one it was.
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('[auth.login]', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
}

/* ---- GET /api/auth/me ----
   Convenience route for the frontend to check "who am I / am I an admin"
   using just the token — needed by the /admin route guard. */
async function me(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('[auth.me]', err);
    return res.status(500).json({ error: 'Failed to fetch current user.' });
  }
}

module.exports = { signup, login, me };

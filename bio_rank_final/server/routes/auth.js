const express = require('express');
const router = express.Router();
const { signup, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/security');

router.post('/signup', authRateLimiter(), signup);
router.post('/login', authRateLimiter(), login);
router.get('/me', requireAuth, me);

module.exports = router;

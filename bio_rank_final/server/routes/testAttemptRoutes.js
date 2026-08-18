const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  submitTest,
  getAttemptHistory,
  getAttemptById,
} = require('../controllers/testAttemptController');

// Submit test attempt & evaluate answers
router.post('/submit', optionalAuth, submitTest);

// Retrieve attempt history
router.get('/history', optionalAuth, getAttemptHistory);

// Retrieve specific attempt review by ID
router.get('/history/:id', optionalAuth, getAttemptById);
router.get('/:id', optionalAuth, getAttemptById);

module.exports = router;

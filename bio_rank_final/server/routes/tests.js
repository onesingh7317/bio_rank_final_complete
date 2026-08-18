const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { requireAuth } = require('../middleware/auth');

router.post('/submit', requireAuth, testController.submitTest);
router.get('/history', requireAuth, testController.getHistory);
router.get('/:id', requireAuth, testController.getAttempt);

module.exports = router;

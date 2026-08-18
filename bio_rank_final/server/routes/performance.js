const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, performanceController.getPerformance);
router.post('/sync', requireAuth, performanceController.syncPerformance);

module.exports = router;

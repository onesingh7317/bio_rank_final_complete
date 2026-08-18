const express = require('express');
const router = express.Router();
const improvementController = require('../controllers/improvementController');
const { requireAuth } = require('../middleware/auth');

router.post('/sync', requireAuth, improvementController.syncImprovementBook);
router.get('/', requireAuth, improvementController.getImprovementBook);
router.put('/:id', requireAuth, improvementController.updateEntry);

module.exports = router;

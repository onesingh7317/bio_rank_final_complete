const express = require('express');
const { createFeedback, listFeedback } = require('../controllers/feedbackController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.post('/', createFeedback);

adminRouter.get('/', requireAuth, requireAdmin, listFeedback);

module.exports = { publicRouter, adminRouter };

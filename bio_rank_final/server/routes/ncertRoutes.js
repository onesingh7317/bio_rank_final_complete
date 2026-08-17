const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  getNcertQuestions,
  getNcertQuestionById,
  createNcertQuestion,
  updateNcertQuestion,
  deleteNcertQuestion,
} = require('../controllers/ncertQuestionController');

// Public/Student routes (can be accessed to practice NCERT line-by-line questions)
router.get('/', getNcertQuestions);
router.get('/:id', getNcertQuestionById);

// Admin-only management routes
router.post('/', requireAuth, requireAdmin, createNcertQuestion);
router.put('/:id', requireAuth, requireAdmin, updateNcertQuestion);
router.delete('/:id', requireAuth, requireAdmin, deleteNcertQuestion);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getPublicChapters,
  getPublicSubSkills,
  generateTestPaper,
} = require('../controllers/publicContentController');
const { listQuestions } = require('../controllers/publicController');

// Chapters & Sub-Skills
router.get('/chapters', getPublicChapters);
router.get('/sub-skills', getPublicSubSkills);

// Question Bank & Secure Test Paper Generation
router.get('/questions/test', generateTestPaper);
router.get('/questions', listQuestions);

module.exports = router;

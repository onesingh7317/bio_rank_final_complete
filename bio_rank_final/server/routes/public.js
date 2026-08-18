const express = require('express');
const { listChapters, listQuestions } = require('../controllers/publicController');

const router = express.Router();

router.get('/chapters', listChapters);
router.get('/questions', listQuestions);

module.exports = router;

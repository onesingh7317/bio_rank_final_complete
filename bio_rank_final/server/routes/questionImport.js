const express = require('express');
const multer = require('multer');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { previewImport, confirmImport } = require('../controllers/csvImportController');

// Memory storage — no need to persist the raw CSV to disk, per instructions.
// 5MB cap is a reasonable ceiling for a question-bank CSV; adjust if you
// expect larger files.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(requireAuth, requireAdmin);

router.post('/preview', upload.single('file'), previewImport);
router.post('/confirm', confirmImport); // JSON body, no file — no multer needed here

module.exports = router;

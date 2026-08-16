const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  listFullLengthTests,
  getFullLengthTest,
  createFullLengthTest,
  updateFullLengthTest,
  deleteFullLengthTest,
} = require('../controllers/fullLengthTestController');

router.use(requireAuth, requireAdmin);

router.get('/', listFullLengthTests);
router.get('/:id', getFullLengthTest);
router.post('/', createFullLengthTest);
router.put('/:id', updateFullLengthTest);
router.delete('/:id', deleteFullLengthTest);

module.exports = router;

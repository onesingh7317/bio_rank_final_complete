const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  listSubSkills,
  getSubSkill,
  createSubSkill,
  updateSubSkill,
  deleteSubSkill,
} = require('../controllers/subSkillController');

router.use(requireAuth, requireAdmin);

router.get('/', listSubSkills);
router.get('/:id', getSubSkill);
router.post('/', createSubSkill);
router.put('/:id', updateSubSkill);
router.delete('/:id', deleteSubSkill);

module.exports = router;

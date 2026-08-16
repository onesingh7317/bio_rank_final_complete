const mongoose = require('mongoose');
const SubSkill = require('../models/SubSkill');
const Chapter = require('../models/Chapter');
const { logAction } = require('../utils/auditLog');

const VALID_BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze'];

async function validateSubSkillInput(body, { partial = false } = {}) {
  const errors = [];
  const { name, chapterId, bloomLevel } = body;

  if (!partial || name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('name is required.');
    }
  }

  if (!partial || bloomLevel !== undefined) {
    if (!VALID_BLOOM_LEVELS.includes(bloomLevel)) {
      errors.push(`bloomLevel must be one of: ${VALID_BLOOM_LEVELS.join(', ')}.`);
    }
  }

  if (!partial || chapterId !== undefined) {
    if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
      errors.push('chapterId is required and must be a valid id.');
    } else {
      const chapter = await Chapter.findOne({ _id: chapterId, isDeleted: false });
      if (!chapter) {
        errors.push('chapterId does not reference an existing, active chapter.');
      }
    }
  }

  return errors;
}

/* ---- GET /api/admin/sub-skills?chapterId=&includeDeleted=true ---- */
async function listSubSkills(req, res) {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const filter = includeDeleted ? {} : { isDeleted: false };

    if (req.query.chapterId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.chapterId)) {
        return res.status(400).json({ error: 'Invalid chapterId.' });
      }
      filter.chapterId = req.query.chapterId;
    }

    const subSkills = await SubSkill.find(filter).sort({ name: 1 });
    return res.json({ subSkills });
  } catch (err) {
    console.error('[subSkill.list]', err);
    return res.status(500).json({ error: 'Failed to list sub-skills.' });
  }
}

/* ---- GET /api/admin/sub-skills/:id ---- */
async function getSubSkill(req, res) {
  try {
    const subSkill = await SubSkill.findById(req.params.id);
    if (!subSkill) return res.status(404).json({ error: 'Sub-skill not found.' });
    return res.json({ subSkill });
  } catch (err) {
    console.error('[subSkill.get]', err);
    return res.status(400).json({ error: 'Invalid sub-skill id.' });
  }
}

/* ---- POST /api/admin/sub-skills ---- */
async function createSubSkill(req, res) {
  try {
    const errors = await validateSubSkillInput(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { name, chapterId, bloomLevel } = req.body;
    const trimmedName = name.trim();

    // Unique within chapter, not globally — matches the schema's compound index.
    const dup = await SubSkill.findOne({ chapterId, name: trimmedName, isDeleted: false });
    if (dup) {
      return res.status(409).json({ error: `A sub-skill named "${trimmedName}" already exists in this chapter.` });
    }

    const subSkill = await SubSkill.create({ name: trimmedName, chapterId, bloomLevel });

    await logAction({
      userId: req.user.userId,
      action: 'create',
      entityType: 'SubSkill',
      entityId: subSkill._id,
      changes: subSkill.toObject(),
    });

    return res.status(201).json({ subSkill });
  } catch (err) {
    console.error('[subSkill.create]', err);
    return res.status(500).json({ error: 'Failed to create sub-skill.' });
  }
}

/* ---- PUT /api/admin/sub-skills/:id ---- */
async function updateSubSkill(req, res) {
  try {
    const subSkill = await SubSkill.findById(req.params.id);
    if (!subSkill) return res.status(404).json({ error: 'Sub-skill not found.' });

    const errors = await validateSubSkillInput(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const { name, chapterId, bloomLevel } = req.body;
    const effectiveChapterId = chapterId !== undefined ? chapterId : subSkill.chapterId;

    if (name !== undefined) {
      const trimmedName = name.trim();
      const dup = await SubSkill.findOne({
        chapterId: effectiveChapterId,
        name: trimmedName,
        isDeleted: false,
        _id: { $ne: subSkill._id },
      });
      if (dup) {
        return res.status(409).json({ error: `A sub-skill named "${trimmedName}" already exists in this chapter.` });
      }
      subSkill.name = trimmedName;
    }
    if (chapterId !== undefined) subSkill.chapterId = chapterId;
    if (bloomLevel !== undefined) subSkill.bloomLevel = bloomLevel;

    await subSkill.save();

    await logAction({
      userId: req.user.userId,
      action: 'update',
      entityType: 'SubSkill',
      entityId: subSkill._id,
      changes: req.body,
    });

    return res.json({ subSkill });
  } catch (err) {
    console.error('[subSkill.update]', err);
    return res.status(500).json({ error: 'Failed to update sub-skill.' });
  }
}

/* ---- DELETE /api/admin/sub-skills/:id ----
   Soft delete only, same no-cascade reasoning as Chapter. */
async function deleteSubSkill(req, res) {
  try {
    const subSkill = await SubSkill.findById(req.params.id);
    if (!subSkill) return res.status(404).json({ error: 'Sub-skill not found.' });

    subSkill.isDeleted = true;
    await subSkill.save();

    await logAction({
      userId: req.user.userId,
      action: 'delete',
      entityType: 'SubSkill',
      entityId: subSkill._id,
    });

    return res.json({ subSkill });
  } catch (err) {
    console.error('[subSkill.delete]', err);
    return res.status(500).json({ error: 'Failed to delete sub-skill.' });
  }
}

module.exports = { listSubSkills, getSubSkill, createSubSkill, updateSubSkill, deleteSubSkill };

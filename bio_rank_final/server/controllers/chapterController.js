const Chapter = require('../models/Chapter');
const { logAction } = require('../utils/auditLog');

const VALID_CLASSES = ['11', '12'];

function validateChapterInput(body, { partial = false } = {}) {
  const errors = [];
  const { name, class: klass, weightage, icon } = body;

  if (!partial || name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('name is required.');
    }
  }
  if (!partial || klass !== undefined) {
    if (!VALID_CLASSES.includes(klass)) {
      errors.push(`class must be one of: ${VALID_CLASSES.join(', ')}.`);
    }
  }
  if (weightage !== undefined && weightage !== null && weightage !== '') {
    const num = Number(weightage);
    if (isNaN(num) || num < 0 || num > 10) {
      errors.push('weightage must be a number between 0 and 10.');
    }
  }
  if (icon !== undefined && typeof icon !== 'string') {
    errors.push('icon must be a string.');
  }

  return errors;
}

/* ---- GET /api/admin/chapters?includeDeleted=true ---- */
async function listChapters(req, res) {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const filter = includeDeleted ? {} : { isDeleted: false };
    const chapters = await Chapter.find(filter).sort({ createdAt: 1 });
    return res.json({ chapters });
  } catch (err) {
    console.error('[chapter.list]', err);
    return res.status(500).json({ error: 'Failed to list chapters.' });
  }
}

/* ---- GET /api/admin/chapters/:id ---- */
async function getChapter(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found.' });
    return res.json({ chapter });
  } catch (err) {
    console.error('[chapter.get]', err);
    return res.status(400).json({ error: 'Invalid chapter id.' });
  }
}

/* ---- POST /api/admin/chapters ---- */
async function createChapter(req, res) {
  try {
    const errors = validateChapterInput(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { name, class: klass, weightage, icon } = req.body;
    const trimmedName = name.trim();

    const dup = await Chapter.findOne({ name: trimmedName, isDeleted: false });
    if (dup) {
      return res.status(409).json({ error: `A chapter named "${trimmedName}" already exists.` });
    }

    const chapter = await Chapter.create({
      name: trimmedName,
      class: klass,
      weightage: (weightage !== undefined && weightage !== null && weightage !== '') ? Number(weightage) : 5,
      icon: icon || undefined, // let schema default apply if omitted
    });

    await logAction({
      userId: req.user.userId,
      action: 'create',
      entityType: 'Chapter',
      entityId: chapter._id,
      changes: chapter.toObject(),
    });

    return res.status(201).json({ chapter });
  } catch (err) {
    console.error('[chapter.create]', err);
    return res.status(500).json({ error: 'Failed to create chapter.' });
  }
}

/* ---- PUT /api/admin/chapters/:id ---- */
async function updateChapter(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found.' });

    const errors = validateChapterInput(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const { name, class: klass, weightage, icon } = req.body;

    if (name !== undefined) {
      const trimmedName = name.trim();
      const dup = await Chapter.findOne({
        name: trimmedName,
        isDeleted: false,
        _id: { $ne: chapter._id },
      });
      if (dup) {
        return res.status(409).json({ error: `A chapter named "${trimmedName}" already exists.` });
      }
      chapter.name = trimmedName;
    }
    if (klass !== undefined) chapter.class = klass;
    if (weightage !== undefined) chapter.weightage = weightage;
    if (icon !== undefined) chapter.icon = icon;

    await chapter.save();

    await logAction({
      userId: req.user.userId,
      action: 'update',
      entityType: 'Chapter',
      entityId: chapter._id,
      changes: req.body,
    });

    return res.json({ chapter });
  } catch (err) {
    console.error('[chapter.update]', err);
    return res.status(500).json({ error: 'Failed to update chapter.' });
  }
}

/* ---- DELETE /api/admin/chapters/:id ----
   Soft delete only. Succeeds even if Questions still reference this
   chapter, per the confirmed no-cascade behavior. */
async function deleteChapter(req, res) {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found.' });

    chapter.isDeleted = true;
    await chapter.save();

    await logAction({
      userId: req.user.userId,
      action: 'delete',
      entityType: 'Chapter',
      entityId: chapter._id,
    });

    return res.json({ chapter });
  } catch (err) {
    console.error('[chapter.delete]', err);
    return res.status(500).json({ error: 'Failed to delete chapter.' });
  }
}

module.exports = { listChapters, getChapter, createChapter, updateChapter, deleteChapter };

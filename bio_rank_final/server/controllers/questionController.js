const mongoose = require('mongoose');
const Question = require('../models/Question');
const Chapter = require('../models/Chapter');
const SubSkill = require('../models/SubSkill');
const { logAction } = require('../utils/auditLog');
const {
  VALID_BLOOM_LEVELS,
  isValidBloomLevel,
  isValidWeightage,
  isNonBlankString,
  isValidCorrectOption,
} = require('../utils/questionValidation');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/* ---- Shared validation for create/update.
   Does NOT re-validate `options` shape (exactly 4 non-empty strings) —
   that's already enforced by the schema-level validator on Question, per
   the instruction not to duplicate it here. Mongoose will throw a
   ValidationError on save if it's wrong, and we surface that below. ---- */
async function validateQuestionInput(body, { partial = false } = {}) {
  const errors = [];
  const { chapterId, subSkillId, bloomLevel, weightage, text, correctOption, explanation } = body;

  let chapter = null;

  if (!partial || chapterId !== undefined) {
    if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
      errors.push('chapterId is required and must be a valid id.');
    } else {
      chapter = await Chapter.findOne({ _id: chapterId, isDeleted: false });
      if (!chapter) errors.push('chapterId does not reference an existing, active chapter.');
    }
  }

  if (!partial || subSkillId !== undefined) {
    if (!subSkillId || !mongoose.Types.ObjectId.isValid(subSkillId)) {
      errors.push('subSkillId is required and must be a valid id.');
    } else {
      const subSkill = await SubSkill.findOne({ _id: subSkillId, isDeleted: false });
      if (!subSkill) {
        errors.push('subSkillId does not reference an existing, active sub-skill.');
      } else {
        // Must belong to the given chapter (or, on partial update where
        // chapterId isn't being changed, the question's *current* chapter —
        // the controller passes the effective chapterId in for that case).
        const effectiveChapterId = chapterId !== undefined ? chapterId : body._effectiveChapterId;
        if (effectiveChapterId && subSkill.chapterId.toString() !== effectiveChapterId.toString()) {
          errors.push('subSkillId does not belong to the given chapterId.');
        }
      }
    }
  }

  if (!partial || bloomLevel !== undefined) {
    if (!isValidBloomLevel(bloomLevel)) {
      errors.push(`bloomLevel must be one of: ${VALID_BLOOM_LEVELS.join(', ')}.`);
    }
  }

  if (!partial || weightage !== undefined) {
    if (!isValidWeightage(weightage)) {
      errors.push('weightage must be a number between 0 and 10.');
    }
  }

  if (!partial || text !== undefined) {
    if (!isNonBlankString(text)) {
      errors.push('text is required.');
    }
  }

  if (!partial || correctOption !== undefined) {
    if (!isValidCorrectOption(correctOption)) {
      errors.push('correctOption must be an integer between 0 and 3 (0-indexed).');
    }
  }

  if (!partial || explanation !== undefined) {
    if (!isNonBlankString(explanation)) {
      errors.push('explanation is required.');
    }
  }

  return { errors, chapter };
}

/* ---- GET /api/admin/questions ----
   Filters: chapterId, subSkillId, year, bloomLevel, isFoundation.
   Pagination: page (default 1), limit (default 20, max 100). */
async function listQuestions(req, res) {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const filter = includeDeleted ? {} : { isDeleted: false };

    if (req.query.chapterId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.chapterId)) {
        return res.status(400).json({ error: 'Invalid chapterId.' });
      }
      filter.chapterId = req.query.chapterId;
    }
    if (req.query.subSkillId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.subSkillId)) {
        return res.status(400).json({ error: 'Invalid subSkillId.' });
      }
      filter.subSkillId = req.query.subSkillId;
    }
    if (req.query.year) {
      const year = parseInt(req.query.year, 10);
      if (Number.isNaN(year)) return res.status(400).json({ error: 'Invalid year.' });
      filter.year = year;
    }
    if (req.query.bloomLevel) {
      if (!VALID_BLOOM_LEVELS.includes(req.query.bloomLevel)) {
        return res.status(400).json({ error: `bloomLevel must be one of: ${VALID_BLOOM_LEVELS.join(', ')}.` });
      }
      filter.bloomLevel = req.query.bloomLevel;
    }
    if (req.query.isFoundation !== undefined) {
      filter.isFoundation = req.query.isFoundation === 'true';
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    return res.json({
      questions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[question.list]', err);
    return res.status(500).json({ error: 'Failed to list questions.' });
  }
}

/* ---- GET /api/admin/questions/:id ---- */
async function getQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    return res.json({ question });
  } catch (err) {
    console.error('[question.get]', err);
    return res.status(400).json({ error: 'Invalid question id.' });
  }
}

/* ---- POST /api/admin/questions ---- */
async function createQuestion(req, res) {
  try {
    const { errors } = await validateQuestionInput(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const {
      chapterId, subSkillId, bloomLevel, weightage, year,
      text, options, correctOption, explanation, isFoundation,
    } = req.body;

    let question;
    try {
      question = await Question.create({
        chapterId, subSkillId, bloomLevel, weightage,
        year: year !== undefined ? year : null,
        text: text.trim(),
        options,
        correctOption,
        explanation: explanation.trim(),
        isFoundation: !!isFoundation,
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }

    // Increment the parent chapter's cached count. Two sequential writes,
    // not a transaction — see note in the Stage 4 handoff about why
    // (questionCount is a recoverable cache, not source-of-truth data).
    await Chapter.updateOne({ _id: chapterId }, { $inc: { questionCount: 1 } });

    await logAction({
      userId: req.user.userId,
      action: 'create',
      entityType: 'Question',
      entityId: question._id,
      changes: question.toObject(),
    });

    return res.status(201).json({ question });
  } catch (err) {
    console.error('[question.create]', err);
    return res.status(500).json({ error: 'Failed to create question.' });
  }
}

/* ---- PUT /api/admin/questions/:id ---- */
async function updateQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });

    // Pass the question's CURRENT chapterId as the fallback for subSkill
    // ownership validation, in case chapterId isn't part of this update.
    const bodyWithContext = { ...req.body, _effectiveChapterId: question.chapterId };
    const { errors } = await validateQuestionInput(bodyWithContext, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const oldChapterId = question.chapterId.toString();
    const {
      chapterId, subSkillId, bloomLevel, weightage, year,
      text, options, correctOption, explanation, isFoundation,
    } = req.body;

    if (chapterId !== undefined) question.chapterId = chapterId;
    if (subSkillId !== undefined) question.subSkillId = subSkillId;
    if (bloomLevel !== undefined) question.bloomLevel = bloomLevel;
    if (weightage !== undefined) question.weightage = weightage;
    if (year !== undefined) question.year = year;
    if (text !== undefined) question.text = text.trim();
    if (options !== undefined) question.options = options; // schema validator enforces shape on save
    if (correctOption !== undefined) question.correctOption = correctOption;
    if (explanation !== undefined) question.explanation = explanation.trim();
    if (isFoundation !== undefined) question.isFoundation = !!isFoundation;

    try {
      await question.save();
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }

    // If the chapter changed, move the cached count: decrement old, increment new.
    const newChapterId = question.chapterId.toString();
    if (chapterId !== undefined && newChapterId !== oldChapterId) {
      await Chapter.updateOne({ _id: oldChapterId }, { $inc: { questionCount: -1 } });
      await Chapter.updateOne({ _id: newChapterId }, { $inc: { questionCount: 1 } });
    }

    await logAction({
      userId: req.user.userId,
      action: 'update',
      entityType: 'Question',
      entityId: question._id,
      changes: req.body,
    });

    return res.json({ question });
  } catch (err) {
    console.error('[question.update]', err);
    return res.status(500).json({ error: 'Failed to update question.' });
  }
}

/* ---- DELETE /api/admin/questions/:id ----
   Soft delete. Decrements the parent chapter's cached questionCount. */
async function deleteQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });

    if (question.isDeleted) {
      // Already deleted — don't double-decrement the count on a repeat call.
      return res.json({ question });
    }

    question.isDeleted = true;
    await question.save();

    await Chapter.updateOne({ _id: question.chapterId }, { $inc: { questionCount: -1 } });

    await logAction({
      userId: req.user.userId,
      action: 'delete',
      entityType: 'Question',
      entityId: question._id,
    });

    return res.json({ question });
  } catch (err) {
    console.error('[question.delete]', err);
    return res.status(500).json({ error: 'Failed to delete question.' });
  }
}

module.exports = { listQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion };

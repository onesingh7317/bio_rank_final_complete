const FullLengthTest = require('../models/FullLengthTest');
const { logAction } = require('../utils/auditLog');
const { isNonBlankString } = require('../utils/questionValidation');

/* ---- Field-level validation.
   No question-availability check against Question count — see the
   Stage 6 handoff conversation: numberOfQuestions is a target/config
   value for the test definition, not a live constraint. That check
   belongs at test-attempt time (a different, not-yet-built stage), not
   here. ---- */
function validateFullLengthTestInput(body, { partial = false } = {}) {
  const errors = [];
  const { title, description, numberOfQuestions, durationMinutes } = body;

  if (!partial || title !== undefined) {
    if (!isNonBlankString(title)) {
      errors.push('title is required.');
    }
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push('description must be a string.');
  }

  if (!partial || numberOfQuestions !== undefined) {
    if (
      typeof numberOfQuestions !== 'number' ||
      !Number.isInteger(numberOfQuestions) ||
      numberOfQuestions < 1
    ) {
      errors.push('numberOfQuestions must be an integer of at least 1.');
    }
  }

  if (!partial || durationMinutes !== undefined) {
    if (
      typeof durationMinutes !== 'number' ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1
    ) {
      errors.push('durationMinutes must be an integer of at least 1.');
    }
  }

  return errors;
}

/* ---- GET /api/admin/full-length-tests?includeDeleted=true ----
   No pagination — full-length test definitions realistically stay in
   the tens, not hundreds, unlike Question. */
async function listFullLengthTests(req, res) {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const filter = includeDeleted ? {} : { isDeleted: false };
    const tests = await FullLengthTest.find(filter).sort({ title: 1 });
    return res.json({ fullLengthTests: tests });
  } catch (err) {
    console.error('[fullLengthTest.list]', err);
    return res.status(500).json({ error: 'Failed to list full-length tests.' });
  }
}

/* ---- GET /api/admin/full-length-tests/:id ---- */
async function getFullLengthTest(req, res) {
  try {
    const test = await FullLengthTest.findById(req.params.id).populate('questions');
    if (!test) return res.status(404).json({ error: 'Full-length test not found.' });
    return res.json({ fullLengthTest: test, populatedQuestions: test.questions || [] });
  } catch (err) {
    console.error('[fullLengthTest.get]', err);
    return res.status(400).json({ error: 'Invalid full-length test id.' });
  }
}

/* ---- POST /api/admin/full-length-tests ---- */
async function createFullLengthTest(req, res) {
  try {
    const errors = validateFullLengthTestInput(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { title, description, numberOfQuestions, durationMinutes, questions } = req.body;

    const test = await FullLengthTest.create({
      title: title.trim(),
      description: description !== undefined ? description.trim() : '',
      numberOfQuestions,
      durationMinutes,
      questions: Array.isArray(questions) ? questions : [],
    });

    await logAction({
      userId: req.user.userId,
      action: 'create',
      entityType: 'FullLengthTest',
      entityId: test._id,
      changes: test.toObject(),
    });

    return res.status(201).json({ fullLengthTest: test });
  } catch (err) {
    console.error('[fullLengthTest.create]', err);
    return res.status(500).json({ error: 'Failed to create full-length test.' });
  }
}

/* ---- PUT /api/admin/full-length-tests/:id ---- */
async function updateFullLengthTest(req, res) {
  try {
    const test = await FullLengthTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Full-length test not found.' });

    const errors = validateFullLengthTestInput(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const { title, description, numberOfQuestions, durationMinutes, questions } = req.body;

    if (title !== undefined) test.title = title.trim();
    if (description !== undefined) test.description = description.trim();
    if (numberOfQuestions !== undefined) test.numberOfQuestions = numberOfQuestions;
    if (durationMinutes !== undefined) test.durationMinutes = durationMinutes;
    if (questions !== undefined && Array.isArray(questions)) test.questions = questions;

    await test.save();

    await logAction({
      userId: req.user.userId,
      action: 'update',
      entityType: 'FullLengthTest',
      entityId: test._id,
      changes: req.body,
    });

    return res.json({ fullLengthTest: test });
  } catch (err) {
    console.error('[fullLengthTest.update]', err);
    return res.status(500).json({ error: 'Failed to update full-length test.' });
  }
}

/* ---- DELETE /api/admin/full-length-tests/:id ----
   Soft delete only. */
async function deleteFullLengthTest(req, res) {
  try {
    const test = await FullLengthTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Full-length test not found.' });

    if (test.isDeleted) {
      return res.json({ fullLengthTest: test }); // already deleted, no-op
    }

    test.isDeleted = true;
    await test.save();

    await logAction({
      userId: req.user.userId,
      action: 'delete',
      entityType: 'FullLengthTest',
      entityId: test._id,
    });

    return res.json({ fullLengthTest: test });
  } catch (err) {
    console.error('[fullLengthTest.delete]', err);
    return res.status(500).json({ error: 'Failed to delete full-length test.' });
  }
}

/* ---- POST /api/admin/full-length-tests/:id/questions ----
   Add existing question IDs or create and attach a new question to this FLT. */
async function addQuestionToFLT(req, res) {
  try {
    const test = await FullLengthTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Full-length test not found.' });

    if (!Array.isArray(test.questions)) test.questions = [];

    // Case 1: single existing question ID
    if (req.body.questionId) {
      const qIdStr = req.body.questionId.toString();
      const alreadyHas = test.questions.some((q) => q.toString() === qIdStr);
      if (!alreadyHas) {
        test.questions.push(req.body.questionId);
        await test.save();
      }
      await logAction({
        userId: req.user.userId,
        action: 'update',
        entityType: 'FullLengthTest',
        entityId: test._id,
        changes: { addedQuestion: req.body.questionId },
      });
      const populated = await FullLengthTest.findById(test._id).populate('questions');
      return res.json({ ok: true, fullLengthTest: populated });
    }

    // Case 2: multiple existing question IDs
    if (req.body.questionIds && Array.isArray(req.body.questionIds)) {
      req.body.questionIds.forEach((qId) => {
        const qIdStr = qId.toString();
        if (!test.questions.some((q) => q.toString() === qIdStr)) {
          test.questions.push(qId);
        }
      });
      await test.save();
      await logAction({
        userId: req.user.userId,
        action: 'update',
        entityType: 'FullLengthTest',
        entityId: test._id,
        changes: { addedQuestions: req.body.questionIds },
      });
      const populated = await FullLengthTest.findById(test._id).populate('questions');
      return res.json({ ok: true, fullLengthTest: populated });
    }

    // Case 3: create new question & attach
    if (req.body.text) {
      const Question = require('../models/Question');
      const { validateQuestionInput } = require('../utils/questionValidation');
      const errors = validateQuestionInput(req.body);
      if (errors.length) return res.status(400).json({ errors });

      const newQ = await Question.create(req.body);
      test.questions.push(newQ._id);
      await test.save();

      await logAction({
        userId: req.user.userId,
        action: 'create',
        entityType: 'Question',
        entityId: newQ._id,
        changes: newQ.toObject(),
      });

      const populated = await FullLengthTest.findById(test._id).populate('questions');
      return res.status(201).json({ ok: true, question: newQ, fullLengthTest: populated });
    }

    return res.status(400).json({ error: 'Provide questionId, questionIds, or new question fields.' });
  } catch (err) {
    console.error('[fullLengthTest.addQuestion]', err);
    return res.status(500).json({ error: 'Failed to add question to test.' });
  }
}

/* ---- DELETE /api/admin/full-length-tests/:id/questions/:questionId ----
   Remove a question from this FLT. */
async function removeQuestionFromFLT(req, res) {
  try {
    const test = await FullLengthTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Full-length test not found.' });

    if (Array.isArray(test.questions)) {
      test.questions = test.questions.filter((q) => q.toString() !== req.params.questionId.toString());
      await test.save();
    }

    await logAction({
      userId: req.user.userId,
      action: 'update',
      entityType: 'FullLengthTest',
      entityId: test._id,
      changes: { removedQuestion: req.params.questionId },
    });

    const populated = await FullLengthTest.findById(test._id).populate('questions');
    return res.json({ ok: true, fullLengthTest: populated });
  } catch (err) {
    console.error('[fullLengthTest.removeQuestion]', err);
    return res.status(500).json({ error: 'Failed to remove question from test.' });
  }
}

module.exports = {
  listFullLengthTests,
  getFullLengthTest,
  createFullLengthTest,
  updateFullLengthTest,
  deleteFullLengthTest,
  addQuestionToFLT,
  removeQuestionFromFLT,
};

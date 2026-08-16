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
    const test = await FullLengthTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Full-length test not found.' });
    return res.json({ fullLengthTest: test });
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

    const { title, description, numberOfQuestions, durationMinutes } = req.body;

    const test = await FullLengthTest.create({
      title: title.trim(),
      description: description !== undefined ? description.trim() : '',
      numberOfQuestions,
      durationMinutes,
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

    const { title, description, numberOfQuestions, durationMinutes } = req.body;

    if (title !== undefined) test.title = title.trim();
    if (description !== undefined) test.description = description.trim();
    if (numberOfQuestions !== undefined) test.numberOfQuestions = numberOfQuestions;
    if (durationMinutes !== undefined) test.durationMinutes = durationMinutes;

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

module.exports = {
  listFullLengthTests,
  getFullLengthTest,
  createFullLengthTest,
  updateFullLengthTest,
  deleteFullLengthTest,
};

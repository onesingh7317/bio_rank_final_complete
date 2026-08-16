const { parse } = require('csv-parse/sync');
const Chapter = require('../models/Chapter');
const SubSkill = require('../models/SubSkill');
const Question = require('../models/Question');
const { logAction } = require('../utils/auditLog');
const importCache = require('../utils/importCache');
const {
  isValidBloomLevel,
  isValidWeightage,
  isNonBlankString,
  VALID_BLOOM_LEVELS,
} = require('../utils/questionValidation');

const REQUIRED_COLUMNS = [
  'chapter', 'sub_skill', 'bloom_level', 'weightage', 'year',
  'question_text', 'option_1', 'option_2', 'option_3', 'option_4',
  'correct_option', 'explanation',
];

/* ---- Validate + normalize a single CSV row.
   Returns { valid: boolean, errors: string[], data: {...} | null }.
   `data` (only present if valid) is already resolved/converted: real
   chapterId/subSkillId ObjectIds, correctOption converted to 0-indexed. ---- */
async function validateRow(row, rowNumber, chapterCache, subSkillCache) {
  const errors = [];

  // 1. Required columns present (non-blank check happens per-field below;
  //    this just catches genuinely missing columns from a malformed CSV).
  for (const col of REQUIRED_COLUMNS) {
    if (row[col] === undefined) {
      errors.push(`Missing column "${col}".`);
    }
  }
  if (errors.length) return { valid: false, errors, data: null };

  const chapterName = (row.chapter || '').trim();
  const subSkillName = (row.sub_skill || '').trim();
  const bloomLevel = (row.bloom_level || '').trim().toLowerCase();
  const weightageRaw = (row.weightage || '').trim();
  const yearRaw = (row.year || '').trim();
  const questionText = (row.question_text || '').trim();
  const options = [row.option_1, row.option_2, row.option_3, row.option_4].map((o) => (o || '').trim());
  const correctOptionRaw = (row.correct_option || '').trim();
  const explanation = (row.explanation || '').trim();

  // 2. Chapter resolution — case-insensitive name match, active only.
  //    chapterCache/subSkillCache avoid re-querying Mongo for every row
  //    when the same chapter/sub-skill repeats across hundreds of rows.
  let chapter = null;
  if (!chapterName) {
    errors.push('chapter is required.');
  } else {
    const key = chapterName.toLowerCase();
    if (chapterCache.has(key)) {
      chapter = chapterCache.get(key);
    } else {
      chapter = await Chapter.findOne({
        isDeleted: false,
        name: { $regex: `^${escapeRegex(chapterName)}$`, $options: 'i' },
      });
      chapterCache.set(key, chapter);
    }
    if (!chapter) {
      errors.push(`Chapter "${chapterName}" does not match any existing, active chapter.`);
    }
  }

  // 3. Sub-skill resolution — case-insensitive name match, scoped to the
  //    resolved chapter, active only. Skipped if chapter itself failed.
  let subSkill = null;
  if (chapter) {
    if (!subSkillName) {
      errors.push('sub_skill is required.');
    } else {
      const key = `${chapter._id}::${subSkillName.toLowerCase()}`;
      if (subSkillCache.has(key)) {
        subSkill = subSkillCache.get(key);
      } else {
        subSkill = await SubSkill.findOne({
          chapterId: chapter._id,
          isDeleted: false,
          name: { $regex: `^${escapeRegex(subSkillName)}$`, $options: 'i' },
        });
        subSkillCache.set(key, subSkill);
      }
      if (!subSkill) {
        errors.push(`Sub-skill "${subSkillName}" does not match any active sub-skill under chapter "${chapterName}".`);
      }
    }
  }

  // 4. Bloom level.
  if (!isValidBloomLevel(bloomLevel)) {
    errors.push(`bloom_level must be one of: ${VALID_BLOOM_LEVELS.join(', ')}.`);
  }

  // 5. Weightage.
  const weightage = weightageRaw === '' ? NaN : Number(weightageRaw);
  if (!isValidWeightage(weightage)) {
    errors.push('weightage must be a number between 0 and 10.');
  }

  // 6. Year — nullable. Blank is fine; if present, must be a real number.
  let year = null;
  if (yearRaw !== '') {
    const parsedYear = Number(yearRaw);
    if (Number.isNaN(parsedYear)) {
      errors.push('year must be a number if provided (leave blank if not applicable).');
    } else {
      year = parsedYear;
    }
  }

  // 7. Question text.
  if (!isNonBlankString(questionText)) {
    errors.push('question_text is required.');
  }

  // 8. Options — exactly 4 non-empty (schema will also enforce this on
  //    save, but checking here lets us report it in the row-level preview
  //    instead of a generic schema error the admin can't map back to a row).
  if (options.some((o) => !o)) {
    errors.push('All 4 options (option_1-option_4) must be non-empty.');
  }

  // 9. correct_option — validated as 1-4 (what the admin typed), converted
  //    to 0-3 for storage.
  let correctOption = null;
  const correctOptionNum = Number(correctOptionRaw);
  if (
    correctOptionRaw === '' ||
    Number.isNaN(correctOptionNum) ||
    !Number.isInteger(correctOptionNum) ||
    correctOptionNum < 1 ||
    correctOptionNum > 4
  ) {
    errors.push('correct_option must be an integer from 1 to 4.');
  } else {
    correctOption = correctOptionNum - 1; // convert to 0-indexed
  }

  // 10. Explanation.
  if (!isNonBlankString(explanation)) {
    errors.push('explanation is required.');
  }

  if (errors.length) {
    return { valid: false, errors, data: null };
  }

  return {
    valid: true,
    errors: [],
    data: {
      rowNumber,
      chapterId: chapter._id.toString(),
      chapterName: chapter.name,
      subSkillId: subSkill._id.toString(),
      subSkillName: subSkill.name,
      bloomLevel,
      weightage,
      year,
      text: questionText,
      options,
      correctOption,
      explanation,
    },
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ---- POST /api/admin/questions/import/preview ----
   Multipart form upload, field name "file". Validates every row, writes
   NOTHING to the database. Caches the full validated result server-side
   (see utils/importCache.js) and returns an importId the confirm step
   references, rather than requiring the client to echo all row data back. */
async function previewImport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Expected a multipart field named "file".' });
    }

    let records;
    try {
      records = parse(req.file.buffer, {
        columns: (headerRow) => headerRow.map((h) => h.trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      return res.status(400).json({ error: `Failed to parse CSV: ${err.message}` });
    }

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file has no data rows.' });
    }

    // Caches to avoid re-querying Mongo once per row for repeated
    // chapter/sub-skill names across a large file.
    const chapterCache = new Map();
    const subSkillCache = new Map();

    const rows = [];
    for (let i = 0; i < records.length; i++) {
      const rowNumber = i + 2; // +2: 1-indexed, plus header row
      const result = await validateRow(records[i], rowNumber, chapterCache, subSkillCache);
      rows.push({ rowNumber, valid: result.valid, errors: result.errors, data: result.data });
    }

    const validRows = rows.filter((r) => r.valid);
    const invalidRows = rows.filter((r) => !r.valid);

    const importId = importCache.put({
      validData: validRows.map((r) => r.data),
      invalidCount: invalidRows.length,
      uploadedBy: req.user.userId,
    });

    return res.json({
      importId,
      totalRows: rows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      rows, // full row-by-row report, in original order, for the preview UI
    });
  } catch (err) {
    console.error('[csvImport.preview]', err);
    return res.status(500).json({ error: 'Failed to process CSV import preview.' });
  }
}

/* ---- POST /api/admin/questions/import/confirm ----
   Body: { importId, mode: "skip-invalid" | "abort-if-any-invalid" }.

   Note: "abort-if-any-invalid" only makes sense relative to the ORIGINAL
   preview's invalid count, which we don't have here (only validData is
   cached, not the invalid rows) — see the check below for how this is
   handled, and the comment explaining why. */
async function confirmImport(req, res) {
  try {
    const { importId, mode } = req.body || {};

    if (!importId || typeof importId !== 'string') {
      return res.status(400).json({ error: 'importId is required.' });
    }
    if (mode !== 'skip-invalid' && mode !== 'abort-if-any-invalid') {
      return res.status(400).json({ error: 'mode is required and must be "skip-invalid" or "abort-if-any-invalid".' });
    }

    const cached = importCache.get(importId);
    if (!cached) {
      return res.status(404).json({ error: 'No pending import found for this importId. It may have expired (30 min TTL) or already been confirmed — re-run the preview.' });
    }

    // We only cache VALID rows' full data from the preview (invalid rows
    // have nothing committable), but we DO cache invalidCount alongside
    // it — so abort-if-any-invalid is enforced server-side, not just
    // trusted from the client's earlier preview read.
    const { validData, invalidCount } = cached;

    if (mode === 'abort-if-any-invalid' && invalidCount > 0) {
      return res.status(400).json({
        error: `Cannot confirm with mode "abort-if-any-invalid": ${invalidCount} row(s) failed validation in the preview. Re-run preview with a corrected file, or confirm with mode "skip-invalid".`,
      });
    }

    const createdIds = [];
    const chapterIncrements = new Map(); // chapterId -> count, batched at the end

    for (const row of validData) {
      const question = await Question.create({
        chapterId: row.chapterId,
        subSkillId: row.subSkillId,
        bloomLevel: row.bloomLevel,
        weightage: row.weightage,
        year: row.year,
        text: row.text,
        options: row.options,
        correctOption: row.correctOption,
        explanation: row.explanation,
        isFoundation: false, // CSV import doesn't set foundation status; edit individually after import if needed
      });
      createdIds.push(question._id);
      chapterIncrements.set(row.chapterId, (chapterIncrements.get(row.chapterId) || 0) + 1);
    }

    for (const [chapterId, count] of chapterIncrements.entries()) {
      await Chapter.updateOne({ _id: chapterId }, { $inc: { questionCount: count } });
    }

    // One AuditLog entry for the whole batch (design decision — see
    // conversation notes: avoids N audit rows for one CSV upload).
    // Guard against createdIds being empty: AuditLog.entityId is a
    // required field, so there's nothing valid to log (and nothing
    // meaningful to say) if zero questions were actually created —
    // e.g. confirm called with mode "skip-invalid" on an all-invalid
    // preview. Found and fixed during the Stage 7 review pass.
    if (createdIds.length > 0) {
      await logAction({
        userId: req.user.userId,
        action: 'create',
        entityType: 'Question',
        entityId: createdIds[0],
        changes: {
          importBatch: true,
          mode,
          questionCount: createdIds.length,
          questionIds: createdIds,
        },
      });
    }

    importCache.remove(importId);

    return res.status(201).json({
      created: createdIds.length,
      questionIds: createdIds,
    });
  } catch (err) {
    console.error('[csvImport.confirm]', err);
    return res.status(500).json({ error: 'Failed to confirm import.' });
  }
}

module.exports = { previewImport, confirmImport };

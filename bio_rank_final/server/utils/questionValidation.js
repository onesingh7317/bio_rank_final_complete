const VALID_BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze'];

/* ============================================================
   Field-level validators shared between questionController.js (single
   create/update) and csvImportController.js (bulk import), so the two
   don't silently drift apart on what counts as a valid question.

   These check VALUES only (not existence of chapter/sub-skill in the
   DB, and not the options-array shape, which the Mongoose schema
   validator already owns) — each caller wraps these with its own
   chapter/sub-skill resolution logic, since that differs (ID lookup for
   the single-question API vs. name resolution for CSV rows).
   ============================================================ */

function isValidBloomLevel(value) {
  return VALID_BLOOM_LEVELS.includes(value);
}

function isValidWeightage(value) {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0 && value <= 10;
}

function isNonBlankString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// correctOption here is the INTERNAL 0-indexed value.
function isValidCorrectOption(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3;
}

module.exports = {
  VALID_BLOOM_LEVELS,
  isValidBloomLevel,
  isValidWeightage,
  isNonBlankString,
  isValidCorrectOption,
};

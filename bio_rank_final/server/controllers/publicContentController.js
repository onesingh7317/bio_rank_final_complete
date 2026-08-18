const Chapter = require('../models/Chapter');
const SubSkill = require('../models/SubSkill');
const Question = require('../models/Question');

/* ============================================================
   GET /api/chapters
   Returns all active chapters (isDeleted: false) sorted by class (11, 12)
   then alphabetically by name.
   Fields returned: _id, name, icon, class, weightage, questionCount
   ============================================================ */
async function getPublicChapters(req, res) {
  try {
    const chapters = await Chapter.find({ isDeleted: false })
      .select('name icon class weightage questionCount')
      .sort({ class: 1, name: 1 })
      .lean();

    return res.json({ ok: true, chapters });
  } catch (error) {
    console.error('[publicContent.getPublicChapters]', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch chapters.' });
  }
}

/* ============================================================
   GET /api/sub-skills
   Returns active sub-skills, optionally filtered by ?chapterId=
   Fields returned: _id, name, chapterId, bloomLevel
   ============================================================ */
async function getPublicSubSkills(req, res) {
  try {
    const { chapterId } = req.query;
    const filter = { isDeleted: false };

    if (chapterId) {
      filter.chapterId = chapterId;
    }

    const subSkills = await SubSkill.find(filter)
      .select('name chapterId bloomLevel')
      .sort({ name: 1 })
      .lean();

    return res.json({ ok: true, subSkills });
  } catch (error) {
    console.error('[publicContent.getPublicSubSkills]', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch sub-skills.' });
  }
}

/* ============================================================
   GET /api/questions/test
   Generates a test question paper for Chapter Test, PYQ Test, or Foundation assessment.
   Query params:
     - chapterId: string ObjectId
     - subSkillId: string ObjectId
     - year: number (e.g. 2024)
     - mode: 'chapter' | 'pyq' | 'foundation'
     - count: number (default 10, min 1, max 90)

   SECURITY REQUIREMENT:
   Excludes `correctOption` and `explanation` from the payload so answer keys
   cannot be inspected in the browser network tab or devtools during an active test.
   ============================================================ */
async function generateTestPaper(req, res) {
  try {
    const { chapterId, subSkillId, year, mode, count } = req.query;

    const requestedCount = Math.min(90, Math.max(1, parseInt(count, 10) || 10));
    const filter = { isDeleted: false };

    if (chapterId) {
      filter.chapterId = chapterId;
    }
    if (subSkillId) {
      filter.subSkillId = subSkillId;
    }
    if (year) {
      const parsedYear = parseInt(year, 10);
      if (!Number.isNaN(parsedYear)) {
        filter.year = parsedYear;
      }
    }

    if (mode === 'foundation') {
      filter.isFoundation = true;
    } else if (mode === 'pyq' && !year) {
      // If mode is PYQ but no specific year specified, only pick questions that have a year assigned
      filter.year = { $ne: null };
    }

    // Fetch questions matching filter, excluding correctOption and explanation
    const questions = await Question.find(filter)
      .select('-correctOption -explanation')
      .populate('chapterId', 'name icon class')
      .populate('subSkillId', 'name bloomLevel')
      .limit(requestedCount)
      .lean();

    // Shuffle questions slightly for randomized test papers
    const shuffled = questions.sort(() => 0.5 - Math.random());

    return res.json({
      ok: true,
      mode: mode || 'chapter',
      count: shuffled.length,
      questions: shuffled,
    });
  } catch (error) {
    console.error('[publicContent.generateTestPaper]', error);
    return res.status(500).json({ ok: false, error: 'Failed to generate test paper.' });
  }
}

module.exports = {
  getPublicChapters,
  getPublicSubSkills,
  generateTestPaper,
};

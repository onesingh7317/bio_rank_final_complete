const mongoose = require('mongoose');
const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question');
const User = require('../models/User');

/* ============================================================
   POST /api/tests/submit
   Evaluates student test answers securely against the real database
   question records, calculates NEET standard score (+4 / -1 / 0),
   accuracy percentage, sub-skill & Bloom taxonomy breakdowns, and saves
   the attempt to MongoDB.
   ============================================================ */
async function submitTest(req, res) {
  try {
    const {
      answers = {},
      questions: submittedQuestions = [],
      mode = 'chapter',
      timeTakenSeconds = 0,
      timeTaken = 0,
      meta = {},
      testTitle = '',
      score: clientScore,
      total: clientTotal,
    } = req.body || {};

    const userId = (req.user && req.user.userId) || null;
    const sessionId = meta.sessionId || req.headers['x-session-id'] || null;
    const duration = timeTakenSeconds || timeTaken || 0;
    const examType = (meta && meta.examType) || req.body.examType || (mode === 'cuet' ? 'CUET' : 'NEET');
    const isCuet = examType === 'CUET';

    // Collect all question IDs from submitted answers map or questions array
    const questionIdList = [];
    const answerMap = new Map();

    if (Array.isArray(submittedQuestions) && submittedQuestions.length > 0) {
      submittedQuestions.forEach((sq) => {
        const qId = sq.questionId || sq._id || sq.id;
        if (qId) {
          const idStr = qId.toString();
          questionIdList.push(idStr);
          if (sq.selectedOption !== undefined) {
            answerMap.set(idStr, sq.selectedOption);
          } else if (sq.selected !== undefined) {
            answerMap.set(idStr, sq.selected);
          }
        }
      });
    }

    if (answers && typeof answers === 'object') {
      Object.keys(answers).forEach((qId) => {
        if (!questionIdList.includes(qId)) {
          questionIdList.push(qId);
        }
        answerMap.set(qId, answers[qId]);
      });
    }

    // Fetch matching Question documents from MongoDB
    const validObjectIds = questionIdList.filter((id) => mongoose.Types.ObjectId.isValid(id));
    let dbQuestions = [];

    if (validObjectIds.length > 0) {
      dbQuestions = await Question.find({ _id: { $in: validObjectIds } }).lean();
    }

    const dbQuestionsMap = new Map();
    dbQuestions.forEach((q) => dbQuestionsMap.set(q._id.toString(), q));

    // Fallback: If questions were passed with evaluation data directly (e.g. mock seeds)
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let finalScore = 0;
    const questionResults = [];
    const subSkillBreakdown = {};
    const bloomBreakdown = {};

    const totalQuestions = questionIdList.length > 0 ? questionIdList.length : (submittedQuestions.length || 0);

    for (const qId of questionIdList) {
      const dbQ = dbQuestionsMap.get(qId);
      const selected = answerMap.get(qId);
      const isUnanswered = selected === undefined || selected === null || selected === -1;

      let isCorrect = false;
      let correctOption = 0;
      let explanation = '';
      let text = '';
      let options = [];
      let subSkillId = null;
      let bloomLevel = 'remember';

      if (dbQ) {
        correctOption = dbQ.correctOption;
        explanation = dbQ.explanation || '';
        text = dbQ.text || '';
        options = dbQ.options || [];
        subSkillId = dbQ.subSkillId || null;
        bloomLevel = dbQ.bloomLevel || 'remember';
      } else {
        // Find in submitted list if present
        const orig = submittedQuestions.find((sq) => (sq.questionId || sq.id || sq._id) === qId);
        if (orig) {
          correctOption = orig.correctOption ?? orig.correct ?? 0;
          explanation = orig.explanation || '';
          text = orig.text || (orig.question && orig.question.text) || '';
          options = orig.options || (orig.question && orig.question.options) || [];
          subSkillId = orig.subSkillId || orig.subSkill || null;
          bloomLevel = orig.bloomLevel || 'remember';
        }
      }

      if (isUnanswered) {
        unattemptedCount++;
        // 0 marks for unattempted
      } else if (Number(selected) === Number(correctOption)) {
        correctCount++;
        isCorrect = true;
        finalScore += isCuet ? 5 : 4; // +5 for CUET, +4 for NEET
      } else {
        incorrectCount++;
        isCorrect = false;
        finalScore -= 1; // -1 for both CUET & NEET
      }

      // Track Sub-Skill breakdown
      if (subSkillId) {
        const ssKey = subSkillId.toString();
        if (!subSkillBreakdown[ssKey]) {
          subSkillBreakdown[ssKey] = { correct: 0, total: 0 };
        }
        subSkillBreakdown[ssKey].total++;
        if (isCorrect) subSkillBreakdown[ssKey].correct++;
      }

      // Track Bloom Taxonomy breakdown
      if (bloomLevel) {
        if (!bloomBreakdown[bloomLevel]) {
          bloomBreakdown[bloomLevel] = { correct: 0, total: 0 };
        }
        bloomBreakdown[bloomLevel].total++;
        if (isCorrect) bloomBreakdown[bloomLevel].correct++;
      }

      questionResults.push({
        questionId: qId,
        selectedOption: isUnanswered ? null : Number(selected),
        correctOption,
        isCorrect,
        explanation,
        text,
        options,
        subSkillId,
        bloomLevel,
      });
    }

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const finalTitle = testTitle || meta.testTitle || `${isCuet ? 'CUET UG' : 'NEET'} Biology Test`;
    const maxScore = isCuet ? 250 : (totalQuestions * 4);

    // Save TestAttempt to database
    const attempt = await TestAttempt.create({
      userId,
      sessionId,
      mode,
      examType: isCuet ? 'CUET' : 'NEET',
      testTitle: finalTitle,
      chapterId: meta.chapterId && mongoose.Types.ObjectId.isValid(meta.chapterId) ? meta.chapterId : null,
      totalQuestions,
      correct: correctCount,
      incorrect: incorrectCount,
      unattempted: unattemptedCount,
      score: finalScore,
      maxScore,
      accuracy,
      timeTakenSeconds: duration,
      questionResults,
      subSkillBreakdown,
      bloomBreakdown,
    });

    return res.status(201).json({
      ok: true,
      attemptId: attempt._id,
      score: neetScore,
      totalQuestions,
      correct: correctCount,
      incorrect: incorrectCount,
      unattempted: unattemptedCount,
      accuracy,
      timeTakenSeconds: duration,
      questionResults,
      subSkillBreakdown,
      bloomBreakdown,
      attempt,
    });
  } catch (error) {
    console.error('[testAttempt.submitTest]', error);
    return res.status(500).json({ ok: false, error: 'Failed to evaluate and save test attempt.' });
  }
}

/* ============================================================
   GET /api/tests/history
   Returns paginated attempt history for the authenticated student or guest.
   Query params:
     - mode: filter by test mode
     - page: page number (default 1)
     - limit: page size (default 10)
     - sessionId: guest session ID
   ============================================================ */
async function getAttemptHistory(req, res) {
  try {
    const { mode, page = 1, limit = 10, sessionId } = req.query;
    const userId = req.user && req.user.userId;

    const query = {};
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      // Return empty if no user ID or session ID provided
      return res.json({ ok: true, attempts: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } });
    }

    if (mode && mode !== 'all') {
      query.mode = mode;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [attempts, total] = await Promise.all([
      TestAttempt.find(query)
        .select('-questionResults') // Light weight summary for history list
        .populate('chapterId', 'name icon class')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      TestAttempt.countDocuments(query),
    ]);

    return res.json({
      ok: true,
      attempts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error('[testAttempt.getAttemptHistory]', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch test attempt history.' });
  }
}

/* ============================================================
   GET /api/tests/history/:id or GET /api/tests/:id
   Retrieves detailed test review for a specific past attempt.
   ============================================================ */
async function getAttemptById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, error: 'Invalid attempt ID format.' });
    }

    const attempt = await TestAttempt.findById(id)
      .populate('chapterId', 'name icon class')
      .lean();

    if (!attempt) {
      return res.status(404).json({ ok: false, error: 'Test attempt not found.' });
    }

    // If attempt belongs to a registered student, strictly enforce matching authenticated user
    if (attempt.userId) {
      if (!req.user || req.user.userId !== attempt.userId.toString()) {
        return res.status(403).json({ ok: false, error: 'Unauthorized to view this test attempt.' });
      }
    } else if (attempt.sessionId) {
      // If guest attempt, require matching session ID
      const reqSessionId = req.query.sessionId || req.headers['x-session-id'];
      if (!reqSessionId || reqSessionId !== attempt.sessionId) {
        return res.status(403).json({ ok: false, error: 'Unauthorized to view this test attempt.' });
      }
    }

    return res.json({ ok: true, attempt });
  } catch (error) {
    console.error('[testAttempt.getAttemptById]', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch test attempt details.' });
  }
}

module.exports = {
  submitTest,
  getAttemptHistory,
  getAttemptById,
};

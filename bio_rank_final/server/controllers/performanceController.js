const mongoose = require('mongoose');
const TestAttempt = require('../models/TestAttempt');
const User = require('../models/User');

/* ============================================================
   GET /api/user/performance
   Computes comprehensive student metrics:
   - Total tests & total questions attempted
   - Overall accuracy % and NEET net scores
   - Real-time Rank & Percentile computed against all active students
   - Chapter-wise mastery statistics
   ============================================================ */
exports.getPerformance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Aggregate total stats for current student
    const userStats = await TestAttempt.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          totalQuestions: { $sum: { $ifNull: ['$totalQuestions', 0] } },
          totalScore: { $sum: '$score' },
          totalCorrect: { $sum: { $ifNull: ['$correct', 0] } },
          totalPossible: {
            $sum: {
              $cond: [
                { $gt: ['$totalQuestions', 0] },
                { $multiply: ['$totalQuestions', 4] },
                { $ifNull: ['$total', 0] },
              ],
            },
          },
        },
      },
    ]);

    let totalTests = 0;
    let totalQuestions = 0;
    let overallAccuracy = 0;
    let netScore = 0;

    if (userStats.length > 0) {
      totalTests = userStats[0].totalTests;
      totalQuestions = userStats[0].totalQuestions;
      netScore = userStats[0].totalScore;
      if (userStats[0].totalQuestions > 0) {
        overallAccuracy = Math.round((userStats[0].totalCorrect / userStats[0].totalQuestions) * 100);
      } else if (userStats[0].totalPossible > 0) {
        overallAccuracy = Math.max(0, Math.round((userStats[0].totalScore / userStats[0].totalPossible) * 100));
      }
    }

    // 2. Aggregate chapter-wise stats
    const chapterStats = await TestAttempt.aggregate([
      { $match: { userId: userObjectId, 'meta.chapterId': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$meta.chapterId',
          testsCount: { $sum: 1 },
          totalScore: { $sum: '$score' },
          totalPossible: { $sum: '$total' },
        },
      },
      {
        $project: {
          chapterId: '$_id',
          testsCount: 1,
          accuracy: {
            $cond: [
              { $gt: ['$totalPossible', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalScore', '$totalPossible'] }, 100] }, 0] },
              0,
            ],
          },
          _id: 0,
        },
      },
    ]);

    // 3. Global Rank & Percentile Calculation Engine
    // Ranks all students by:
    // Criteria 1: Marks Scored (totalScore DESC)
    // Criteria 2: Avg Time Taken Per Question (avgTimePerQuestion ASC - faster solver wins)
    const allStudentStandings = await TestAttempt.aggregate([
      { $match: { userId: { $ne: null } } },
      {
        $group: {
          _id: '$userId',
          totalTests: { $sum: 1 },
          totalScore: { $sum: '$score' },
          totalQuestions: { $sum: { $ifNull: ['$totalQuestions', 0] } },
          totalTimeTaken: { $sum: { $ifNull: ['$timeTakenSeconds', 0] } },
          totalCorrect: { $sum: { $ifNull: ['$correct', 0] } },
          totalIncorrect: { $sum: { $ifNull: ['$incorrect', 0] } },
          totalPossible: {
            $sum: {
              $cond: [
                { $gt: ['$totalQuestions', 0] },
                { $multiply: ['$totalQuestions', 4] },
                { $ifNull: ['$total', 0] },
              ],
            },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          totalTests: 1,
          totalScore: 1,
          totalQuestions: 1,
          totalTimeTaken: 1,
          avgTimePerQuestion: {
            $cond: [
              { $gt: ['$totalQuestions', 0] },
              { $round: [{ $divide: ['$totalTimeTaken', '$totalQuestions'] }, 1] },
              999,
            ],
          },
          accuracy: {
            $cond: [
              { $gt: ['$totalQuestions', 0] },
              { $multiply: [{ $divide: ['$totalCorrect', '$totalQuestions'] }, 100] },
              0,
            ],
          },
          totalIncorrect: 1,
        },
      },
      {
        $sort: {
          totalScore: -1,          // 1. Higher Marks Scored (Criteria 1)
          avgTimePerQuestion: 1,   // 2. Lower Avg Time Taken Per Question (Criteria 2)
          accuracy: -1,            // 3. Higher Accuracy
          totalIncorrect: 1,       // 4. Lesser Negative Marks
        },
      },
    ]);

    let rank = 0;
    let percentile = 0;
    const totalRankedStudents = allStudentStandings.length;

    if (totalRankedStudents > 0) {
      const studentIndex = allStudentStandings.findIndex(
        (s) => s.userId.toString() === userId.toString()
      );

      if (studentIndex !== -1) {
        rank = studentIndex + 1;
        // Percentile formula: ((totalStudents - rank + 1) / totalStudents) * 100
        percentile = Math.max(
          1,
          Math.min(99.9, Math.round(((totalRankedStudents - rank + 1) / totalRankedStudents) * 100 * 10) / 10)
        );
      } else {
        // Not yet taken any tests
        rank = totalRankedStudents + 1;
        percentile = 0;
      }
    }

    // 4. Streaks
    let currentStreak = 0;
    let bestStreak = 0;
    const user = await User.findById(userId).lean();
    if (user && user.performance) {
      currentStreak = user.performance.currentStreak || 0;
      bestStreak = user.performance.bestStreak || 0;
    }

    return res.status(200).json({
      ok: true,
      performance: {
        totalTests,
        totalQuestions,
        overallAccuracy,
        netScore,
        currentStreak,
        bestStreak,
        rank,
        percentile,
        totalStudents: Math.max(totalRankedStudents, 1),
        chapterWiseStats: chapterStats,
      },
    });
  } catch (error) {
    console.error('[performance.getPerformance]', error);
    return res.status(500).json({ ok: false, error: 'Server error while fetching performance.' });
  }
};

/* ============================================================
   GET /api/user/performance/leaderboard
   Returns the global top students leaderboard based on:
   1. Marks Scored (totalScore DESC)
   2. Avg Time Per Question (avgTimePerQuestion ASC)
   ============================================================ */
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const standings = await TestAttempt.aggregate([
      { $match: { userId: { $ne: null } } },
      {
        $group: {
          _id: '$userId',
          totalTests: { $sum: 1 },
          totalScore: { $sum: '$score' },
          totalQuestions: { $sum: { $ifNull: ['$totalQuestions', 0] } },
          totalTimeTaken: { $sum: { $ifNull: ['$timeTakenSeconds', 0] } },
          totalCorrect: { $sum: { $ifNull: ['$correct', 0] } },
          totalIncorrect: { $sum: { $ifNull: ['$incorrect', 0] } },
          totalPossible: {
            $sum: {
              $cond: [
                { $gt: ['$totalQuestions', 0] },
                { $multiply: ['$totalQuestions', 4] },
                { $ifNull: ['$total', 0] },
              ],
            },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          totalTests: 1,
          totalScore: 1,
          totalQuestions: 1,
          totalTimeTaken: 1,
          avgTimePerQuestion: {
            $cond: [
              { $gt: ['$totalQuestions', 0] },
              { $round: [{ $divide: ['$totalTimeTaken', '$totalQuestions'] }, 1] },
              999,
            ],
          },
          accuracy: {
            $cond: [
              { $gt: ['$totalQuestions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalCorrect', '$totalQuestions'] }, 100] }, 1] },
              0,
            ],
          },
          totalIncorrect: 1,
        },
      },
      {
        $sort: {
          totalScore: -1,          // Criteria 1: Marks Scored
          avgTimePerQuestion: 1,   // Criteria 2: Avg Time Per Question
          accuracy: -1,            // Tie-breaker: Accuracy
          totalIncorrect: 1,       // Tie-breaker: Fewer wrong answers
        },
      },
      { $limit: limitNum },
    ]);

    // Populate user profile info
    const userIds = standings.map((s) => s.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name username avatarUrl performance classLevel')
      .lean();

    const userMap = new Map();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    const leaderboard = standings.map((item, index) => {
      const u = userMap.get(item.userId.toString());
      return {
        rank: index + 1,
        userId: item.userId,
        name: (u && u.name) || 'Anonymous Student',
        username: (u && u.username) || '',
        avatarUrl: (u && u.avatarUrl) || null,
        classLevel: (u && u.classLevel) || '12th',
        streak: (u && u.performance && u.performance.currentStreak) || 0,
        totalTests: item.totalTests,
        totalScore: item.totalScore,
        accuracy: item.accuracy,
      };
    });

    return res.json({ ok: true, leaderboard, totalStudents: standings.length });
  } catch (error) {
    console.error('[performance.getLeaderboard]', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch leaderboard.' });
  }
};

/* ============================================================
   POST /api/user/performance/sync
   Syncs student streaks and metrics.
   ============================================================ */
exports.syncPerformance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentStreak, bestStreak } = req.body;

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          'performance.currentStreak': Number(currentStreak) || 0,
          'performance.bestStreak': Number(bestStreak) || 0,
          'performance.lastSync': new Date(),
        },
      }
    );

    return res.status(200).json({ ok: true, synced: true });
  } catch (error) {
    console.error('[performance.syncPerformance]', error);
    return res.status(500).json({ ok: false, error: 'Server error while syncing performance.' });
  }
};

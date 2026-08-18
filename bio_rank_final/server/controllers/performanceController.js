const mongoose = require('mongoose');
const TestAttempt = require('../models/TestAttempt');
const User = require('../models/User');

exports.getPerformance = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Aggregate total stats for the user
    const userStats = await TestAttempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          totalQuestions: { $sum: { $size: "$questions" } },
          totalScore: { $sum: "$score" },
          totalPossible: { $sum: "$total" }
        }
      }
    ]);

    let totalTests = 0, totalQuestions = 0, overallAccuracy = 0;
    if (userStats.length > 0) {
      totalTests = userStats[0].totalTests;
      totalQuestions = userStats[0].totalQuestions;
      if (userStats[0].totalPossible > 0) {
        overallAccuracy = (userStats[0].totalScore / userStats[0].totalPossible) * 100;
      }
    }

    // Aggregate chapter-wise stats
    const chapterStats = await TestAttempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), "meta.chapterId": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$meta.chapterId",
          testsCount: { $sum: 1 },
          totalScore: { $sum: "$score" },
          totalPossible: { $sum: "$total" }
        }
      },
      {
        $project: {
          chapterId: "$_id",
          testsCount: 1,
          accuracy: {
            $cond: [
              { $gt: ["$totalPossible", 0] },
              { $multiply: [{ $divide: ["$totalScore", "$totalPossible"] }, 100] },
              0
            ]
          },
          _id: 0
        }
      }
    ]);

    // Simple streaks and rank placeholders (could be expanded based on User data or more advanced aggregation)
    let currentStreak = 0;
    let bestStreak = 0;
    
    const user = await User.findById(userId).lean();
    if (user && user.performance) {
        currentStreak = user.performance.currentStreak || 0;
        bestStreak = user.performance.bestStreak || 0;
    }

    const rank = 0; // Requires calculating overall accuracy for all users to determine rank
    const percentile = 0; // Requires calculation relative to others
    
    return res.status(200).json({
      performance: {
        totalTests,
        totalQuestions,
        overallAccuracy,
        currentStreak,
        bestStreak,
        rank,
        percentile,
        chapterWiseStats: chapterStats
      }
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return res.status(500).json({ error: 'Server error while fetching performance.' });
  }
};

exports.syncPerformance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentStreak, bestStreak, ...otherStats } = req.body;

    // We can store this in the User model's `performance` field, assuming it exists or can be mixed in.
    // Given the prompt suggests "For simplicity, save to a StudentPerformance embedded doc or just return { ok: true }",
    // we'll update the User document if possible, otherwise just return ok: true.
    await User.updateOne(
      { _id: userId },
      { $set: { "performance.currentStreak": currentStreak, "performance.bestStreak": bestStreak, "performance.lastSync": new Date() } }
    );

    return res.status(200).json({ ok: true, synced: true });
  } catch (error) {
    console.error('Error syncing performance:', error);
    return res.status(500).json({ error: 'Server error while syncing performance.' });
  }
};

const TestAttempt = require('../models/TestAttempt');

exports.submitTest = async (req, res) => {
  try {
    const { mode, meta, questions, score, total, accuracy, timeTaken, neetScore } = req.body;
    
    const attempt = new TestAttempt({
      userId: req.user.userId,
      mode,
      meta,
      questions,
      score,
      total,
      accuracy,
      timeTaken,
      neetScore
    });

    await attempt.save();
    return res.status(201).json({ ok: true, attempt });
  } catch (error) {
    console.error('Error submitting test attempt:', error);
    return res.status(500).json({ error: 'Server error while submitting test attempt.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { mode, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user.userId };
    if (mode) query.mode = mode;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [attempts, total] = await Promise.all([
      TestAttempt.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      TestAttempt.countDocuments(query)
    ]);

    return res.status(200).json({
      attempts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching test history:', error);
    return res.status(500).json({ error: 'Server error while fetching test history.' });
  }
};

exports.getAttempt = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).lean();

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    return res.status(200).json({ attempt });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    return res.status(500).json({ error: 'Server error while fetching attempt.' });
  }
};

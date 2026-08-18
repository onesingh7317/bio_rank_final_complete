const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { level, data } = req.body;
    
    if (!level) {
      return res.status(400).json({ ok: false, error: 'Level is required' });
    }

    const feedbackData = { level, data };
    if (req.user) {
      feedbackData.submittedBy = req.user.userId || req.user._id || null;
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({ ok: true, feedback });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

exports.listFeedback = async (req, res) => {
  try {
    const { level, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (level) query.level = level;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [feedback, total] = await Promise.all([
      Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('submittedBy', 'name email'),
      Feedback.countDocuments(query)
    ]);

    res.json({
      ok: true,
      feedback,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error listing feedback:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

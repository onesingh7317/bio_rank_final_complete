const Chapter = require('../models/Chapter');
const Question = require('../models/Question');

exports.listChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find({ isDeleted: false })
      .sort({ class: 1, name: 1 });
      
    res.json({ ok: true, chapters });
  } catch (error) {
    console.error('Error listing chapters:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

exports.listQuestions = async (req, res) => {
  try {
    const { chapterId, year, bloomLevel, limit = 20, page = 1 } = req.query;
    
    const query = { isDeleted: false };
    
    if (chapterId) query.chapterId = chapterId;
    if (year) query.year = parseInt(year);
    if (bloomLevel) query.bloomLevel = bloomLevel;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      Question.find(query)
        .select('-correctOption -explanation')
        .populate('chapterId', 'name icon class')
        .skip(skip)
        .limit(parseInt(limit)),
      Question.countDocuments(query)
    ]);

    res.json({
      ok: true,
      questions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error listing questions:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

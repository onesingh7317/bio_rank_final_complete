const NcertQuestion = require('../models/NcertQuestion');
const Chapter = require('../models/Chapter');
const AuditLog = require('../models/AuditLog');

function escapeRegex(str) {
  return (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getNcertQuestions(req, res) {
  try {
    const { chapterId, class: classNum, questionType, difficulty, search, page = 1, limit = 20 } = req.query;
    const filter = { active: true };

    if (chapterId) filter.chapterId = chapterId;
    if (classNum) filter.class = classNum;
    if (questionType) filter.questionType = questionType;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { text: { $regex: safeSearch, $options: 'i' } },
        { topic: { $regex: safeSearch, $options: 'i' } },
        { ncertReference: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const isAdmin = req.user && req.user.role === 'admin';
    let query = NcertQuestion.find(filter)
      .populate('chapterId', 'name class')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    if (!isAdmin) {
      query = query.select('-correctOption -explanation');
    }

    const [questions, total] = await Promise.all([
      query.lean(),
      NcertQuestion.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return res.json({
      questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error('getNcertQuestions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve NCERT Bio Focus questions.' });
  }
}

async function getNcertQuestionById(req, res) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let query = NcertQuestion.findById(req.params.id).populate('chapterId', 'name class');
    if (!isAdmin) {
      query = query.select('-correctOption -explanation');
    }
    const question = await query.lean();
    if (!question) {
      return res.status(404).json({ error: 'NCERT question not found.' });
    }
    return res.json({ question });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch question.' });
  }
}

async function createNcertQuestion(req, res) {
  try {
    const {
      chapterId,
      class: classNum,
      topic,
      questionType,
      difficulty,
      text,
      assertion,
      reason,
      columnA,
      columnB,
      diagramUrl,
      options,
      correctOption,
      explanation,
      ncertReference,
    } = req.body;

    if (!chapterId || !text || !options || correctOption === undefined) {
      return res.status(400).json({ error: 'chapterId, text, 4 options, and correctOption are required.' });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ error: 'Options must contain exactly 4 items.' });
    }

    const chapter = await Chapter.findById(chapterId);
    const resolvedClass = classNum || (chapter ? chapter.class : '11');

    const newQ = new NcertQuestion({
      chapterId,
      class: resolvedClass,
      topic: topic || '',
      questionType: questionType || 'mcq',
      difficulty: difficulty || 'medium',
      text: text.trim(),
      assertion: assertion ? assertion.trim() : '',
      reason: reason ? reason.trim() : '',
      columnA: Array.isArray(columnA) ? columnA : [],
      columnB: Array.isArray(columnB) ? columnB : [],
      diagramUrl: diagramUrl ? diagramUrl.trim() : '',
      options: options.map((o) => String(o).trim()),
      correctOption: Number(correctOption),
      explanation: explanation ? explanation.trim() : '',
      ncertReference: ncertReference ? ncertReference.trim() : '',
    });

    await newQ.save();

    // Audit log
    if (req.user) {
      await AuditLog.create({
        userId: req.user._id,
        action: 'create',
        entityType: 'NcertQuestion',
        entityId: newQ._id,
        after: newQ.toObject(),
      }).catch((e) => console.error('AuditLog error:', e));
    }

    return res.status(201).json({ question: newQ });
  } catch (err) {
    console.error('createNcertQuestion error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create NCERT question.' });
  }
}

async function updateNcertQuestion(req, res) {
  try {
    const question = await NcertQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'NCERT question not found.' });
    }

    const fields = [
      'chapterId',
      'class',
      'topic',
      'questionType',
      'difficulty',
      'text',
      'assertion',
      'reason',
      'columnA',
      'columnB',
      'diagramUrl',
      'options',
      'correctOption',
      'explanation',
      'ncertReference',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        question[f] = req.body[f];
      }
    });

    await question.save();

    if (req.user) {
      await AuditLog.create({
        userId: req.user._id,
        action: 'update',
        entityType: 'NcertQuestion',
        entityId: question._id,
        after: question.toObject(),
      }).catch((e) => console.error('AuditLog error:', e));
    }

    return res.json({ question });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to update NCERT question.' });
  }
}

async function deleteNcertQuestion(req, res) {
  try {
    const question = await NcertQuestion.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'NCERT question not found.' });
    }

    if (req.user) {
      await AuditLog.create({
        userId: req.user._id,
        action: 'delete',
        entityType: 'NcertQuestion',
        entityId: question._id,
        before: question.toObject(),
      }).catch((e) => console.error('AuditLog error:', e));
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete NCERT question.' });
  }
}

module.exports = {
  getNcertQuestions,
  getNcertQuestionById,
  createNcertQuestion,
  updateNcertQuestion,
  deleteNcertQuestion,
};

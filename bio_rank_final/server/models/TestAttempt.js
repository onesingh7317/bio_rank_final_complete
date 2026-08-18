const mongoose = require('mongoose');
const testAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { type: String, enum: ['chapter', 'pyq', 'foundation', 'full-length', 'micro-retest', 'spaced-retest'], required: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // chapterId, testId, etc.
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number, default: null }, // 0-3 or null if unanswered
    correctOption: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    timeTaken: { type: Number, default: 0 }, // seconds
  }],
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  accuracy: { type: Number, required: true }, // percentage
  timeTaken: { type: Number, default: 0 }, // total seconds
  neetScore: { type: Number, default: null }, // NEET marking: +4/-1
}, { timestamps: true });
testAttemptSchema.index({ userId: 1, createdAt: -1 });
testAttemptSchema.index({ userId: 1, mode: 1 });
module.exports = mongoose.model('TestAttempt', testAttemptSchema);

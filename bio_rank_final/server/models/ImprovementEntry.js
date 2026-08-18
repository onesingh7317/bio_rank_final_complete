const mongoose = require('mongoose');
const improvementEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  questionText: { type: String, default: '' },
  chapterName: { type: String, default: '' },
  subSkillName: { type: String, default: '' },
  status: { type: String, enum: ['active', 'reviewing', 'mastered'], default: 'active' },
  wrongDate: { type: Date, default: Date.now },
  nextReviewDate: { type: Date, default: null },
  reviewCount: { type: Number, default: 0 },
  mistakeReason: { type: String, default: '' },
}, { timestamps: true });
improvementEntrySchema.index({ userId: 1, status: 1 });
module.exports = mongoose.model('ImprovementEntry', improvementEntrySchema);

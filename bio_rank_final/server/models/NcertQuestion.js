const mongoose = require('mongoose');

const ncertQuestionSchema = new mongoose.Schema(
  {
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    class: { type: String, enum: ['11', '12'], required: true },
    topic: { type: String, default: '', trim: true },
    questionType: {
      type: String,
      enum: ['mcq', 'assertion_reason', 'matching', 'diagram'],
      default: 'mcq',
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      required: true,
    },
    text: { type: String, required: true, trim: true },

    // Assertion & Reason specific fields
    assertion: { type: String, default: '', trim: true },
    reason: { type: String, default: '', trim: true },

    // Matching specific fields (Column I and Column II pairs)
    columnA: { type: [String], default: [] },
    columnB: { type: [String], default: [] },

    // Diagram specific fields
    diagramUrl: { type: String, default: '', trim: true },

    // 4 standard options
    options: {
      type: [String],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length === 4,
        'Options must contain exactly 4 choices.',
      ],
    },
    correctOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },

    explanation: { type: String, required: true, trim: true },
    ncertReference: { type: String, default: '', trim: true }, // e.g. "NCERT Class 11, Page 134, Paragraph 2"
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ncertQuestionSchema.index({ chapterId: 1, class: 1, questionType: 1 });

module.exports = mongoose.model('NcertQuestion', ncertQuestionSchema);

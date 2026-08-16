const mongoose = require('mongoose');

/* ============================================================
   Question — matches DB.questions in js/data.js:
   { id, chapter (FK), subSkill (FK), bloomLevel, weightage, year,
     text, options[4], correct, explanation }

   IMPORTANT: `correctOption` is 0-indexed to match the frontend's
   `correct` field exactly (verified against q001: correct: 1 ->
   options[1] = 'Helicase'). The CSV import's `correct_option` column
   is 1-4 for human readability and gets converted to 0-3 on ingest —
   do not confuse the two.
   ============================================================ */
const questionSchema = new mongoose.Schema(
  {
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    subSkillId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubSkill', required: true },
    bloomLevel: {
      type: String,
      enum: ['remember', 'understand', 'apply', 'analyze'],
      required: true,
    },
    weightage: { type: Number, required: true, min: 0, max: 10 },
    year: { type: Number, default: null }, // nullable — not every question is tied to a PYQ year

    text: { type: String, required: true, trim: true },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 4 && arr.every((o) => typeof o === 'string' && o.trim().length > 0),
        message: 'A question must have exactly 4 non-empty options.',
      },
    },

    correctOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },

    explanation: { type: String, required: true, trim: true },

    // Marks whether this question is part of the foundation/onboarding
    // assessment set (replaces the hardcoded DB.foundationQuestions ID list).
    isFoundation: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

questionSchema.index({ chapterId: 1 });
questionSchema.index({ subSkillId: 1 });
questionSchema.index({ year: 1 });

module.exports = mongoose.model('Question', questionSchema);

const mongoose = require('mongoose');

/* ============================================================
   TestAttempt — records full evaluated test attempts by students
   (and guest users). Stores detailed question results with explanations,
   NEET standard score (+4 / -1 / 0), accuracy, and sub-skill / Bloom
   taxonomy breakdowns for performance and weakness analysis.
   ============================================================ */
const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      required: false,
    },
    sessionId: {
      type: String,
      default: null,
    },
    mode: {
      type: String,
      enum: [
        'chapter',
        'pyq',
        'foundation',
        'micro',
        'spaced',
        'fulllength',
        'full-length',
        'micro-retest',
        'spaced-retest',
        'ncert-focus',
      ],
      required: true,
      default: 'chapter',
    },
    testTitle: {
      type: String,
      default: 'Biology Practice Test',
      trim: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    correct: {
      type: Number,
      required: true,
      min: 0,
    },
    incorrect: {
      type: Number,
      required: true,
      min: 0,
    },
    unattempted: {
      type: Number,
      required: true,
      min: 0,
    },
    score: {
      type: Number,
      required: true, // NEET standard: +4 for correct, -1 for incorrect, 0 for unattempted
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    questionResults: [
      {
        questionId: {
          type: mongoose.Schema.Types.Mixed, // supports ObjectId or string reference
          ref: 'Question',
        },
        selectedOption: {
          type: Number,
          default: null, // 0-3, or null if unattempted
        },
        correctOption: {
          type: Number,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        explanation: {
          type: String,
          default: '',
        },
        text: {
          type: String,
          default: '',
        },
        options: {
          type: [String],
          default: [],
        },
        subSkillId: {
          type: mongoose.Schema.Types.Mixed,
          ref: 'SubSkill',
          default: null,
        },
        bloomLevel: {
          type: String,
          default: 'remember',
        },
      },
    ],
    subSkillBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    bloomBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

testAttemptSchema.index({ userId: 1, createdAt: -1 });
testAttemptSchema.index({ userId: 1, mode: 1 });
testAttemptSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);

const mongoose = require('mongoose');

/* ============================================================
   QuestionReport — stores student-submitted issue reports for
   individual quiz questions. The admin panel lists these and lets
   admins resolve, dismiss, or delete them.
   ============================================================ */
const questionReportSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      default: null,
    },
    questionText: {
      type: String,
      default: '',
    },
    chapterName: {
      type: String,
      default: 'General',
    },
    reason: {
      type: String,
      required: [true, 'A reason is required.'],
      enum: {
        values: [
          'Incorrect Answer / Wrong Correct Option',
          'Question Formulation / Typo Error',
          'Incorrect / Incomplete Options',
          'Wrong or Misleading Explanation',
          'Other',
          // Legacy / catch-all values the frontend may still send
          'Incorrect answer key',
          'Unclear wording',
          'Typo or error',
          'Wrong options',
          'General Issue',
        ],
        message: 'Invalid report reason: {VALUE}',
      },
    },
    comments: {
      type: String,
      default: '',
      maxlength: [2000, 'Comments must be under 2000 characters.'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient admin queries (filter by status, sort by newest)
questionReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('QuestionReport', questionReportSchema);

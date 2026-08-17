const mongoose = require('mongoose');

/* ============================================================
   FullLengthTest — matches DB.fullLengthTests in js/data.js:
   { id, title, description, numberOfQuestions, durationMinutes }
   ============================================================ */
const fullLengthTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    durationMinutes: { type: Number, required: true, min: 1 },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FullLengthTest', fullLengthTestSchema);

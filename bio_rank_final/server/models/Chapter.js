const mongoose = require('mongoose');

/* ============================================================
   Chapter — matches DB.chapters in js/data.js:
   { id, name, icon, questions, class, weightage }
   `questions` (question count) is NOT stored here — it's derived by
   counting Question documents referencing this chapter, so it can't
   drift out of sync with reality the way the hardcoded mock count can.
   ============================================================ */
const chapterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    icon: { type: String, default: '📘' }, // emoji, matches frontend's usage
    class: { type: String, enum: ['11', '12'], required: true },
    weightage: { type: Number, required: true, min: 0, max: 10 },

    // Cached count, not derived live (confirmed) — the Question CRUD
    // controller (Stage 4) and CSV import (Stage 5) must increment/
    // decrement this whenever a Question is created/deleted, or it will
    // drift from reality. Flagging this dependency now so it isn't missed.
    questionCount: { type: Number, default: 0 },

    // Soft delete — confirmed behavior: a Chapter/SubSkill can be
    // soft-deleted (hidden from admin/student lists) even with Questions
    // still attached; those Questions stay linked to it and are NOT
    // cascaded or reassigned. This means "deleted" chapters can still be
    // referenced by live Question docs — list/detail queries elsewhere
    // must be written knowing that's possible.
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chapter', chapterSchema);

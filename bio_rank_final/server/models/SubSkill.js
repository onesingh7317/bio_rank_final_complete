const mongoose = require('mongoose');

/* ============================================================
   SubSkill — matches DB.subSkills in js/data.js:
   { id, name, chapter (FK), bloomLevel }
   ============================================================ */
const subSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    bloomLevel: {
      type: String,
      enum: ['remember', 'understand', 'apply', 'analyze'],
      required: true,
      // Note: these 4 values are exactly what's used across DB.subSkills
      // and DB.questions in the existing frontend — no 'evaluate'/'create'
      // levels appear anywhere in the mock data. Flagging in case the
      // real taxonomy is meant to be fuller.
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A sub-skill name should be unique within its chapter, not globally —
// two different chapters could reasonably have a sub-skill with the same name.
subSkillSchema.index({ chapterId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SubSkill', subSkillSchema);

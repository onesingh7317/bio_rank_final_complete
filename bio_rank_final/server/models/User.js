const mongoose = require('mongoose');

/* ============================================================
   User — students and admins share this model, distinguished by `role`.
   Matches frontend's `state.student` shape (name, username, targetYear,
   board, studyHoursPerDay, strongAreas, weakAreas) plus real auth fields
   that the frontend currently fakes (see js/account.js — passwordUpdatedAt
   was only ever a boolean flag, never a real hash).
   ============================================================ */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },

    // Fields already present in the frontend's student profile shape —
    // included so the profile screen can map 1:1 once connected.
    classLevel: { type: String, default: '12th' },
    targetYear: { type: String, default: null },
    board: { type: String, default: null },
    studyHoursPerDay: { type: String, default: null },
    strongAreas: { type: [String], default: [] },
    weakAreas: { type: [String], default: [] },
    avatarUrl: { type: String, default: null }, // real file storage URL, not base64

    configured: { type: Boolean, default: false },
    foundationDone: { type: Boolean, default: false },

    // Embedded student performance metrics (streaks, sync data)
    performance: {
      currentStreak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
      lastSync: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

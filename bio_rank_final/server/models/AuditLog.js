const mongoose = require('mongoose');

/* ============================================================
   AuditLog — tracks admin content changes.
   No UI consumes this yet (per your instructions, step 7 just wires
   writes into it) — but the shape is designed to support a future
   "activity log" screen without changes.
   ============================================================ */
const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['create', 'update', 'delete'], required: true },
    entityType: {
      type: String,
      enum: ['Chapter', 'SubSkill', 'Question', 'FullLengthTest'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // Optional snapshot of what changed — cheap to include now, useful
    // later for a diff view. Kept loose (Mixed) since shape varies by entity.
    changes: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true } // createdAt doubles as "when"
);

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ userId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

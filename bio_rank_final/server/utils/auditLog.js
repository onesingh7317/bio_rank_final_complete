const AuditLog = require('../models/AuditLog');

/* ============================================================
   logAction — thin wrapper so every controller writes audit entries
   the same way. Intentionally fire-and-forget from the caller's
   perspective is NOT what we do here — we await it, but we don't let a
   logging failure break the actual request (see try/catch below), since
   the primary DB write already succeeded by the time this runs.
   ============================================================ */
async function logAction({ userId, action, entityType, entityId, changes = null }) {
  try {
    await AuditLog.create({ userId, action, entityType, entityId, changes });
  } catch (err) {
    // Deliberately non-fatal: the actual CRUD operation already succeeded.
    // Losing an audit log entry is bad, but it shouldn't 500 a successful
    // chapter/question edit.
    console.error('[auditLog] Failed to write audit entry:', err);
  }
}

module.exports = { logAction };

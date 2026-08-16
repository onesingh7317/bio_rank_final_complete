const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

const VALID_ACTIONS = ['create', 'update', 'delete'];
const VALID_ENTITY_TYPES = ['Chapter', 'SubSkill', 'Question', 'FullLengthTest'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/* ---- GET /api/admin/audit-logs ----
   Read-only. No create/update/delete routes exist for this resource —
   entries are only ever written via logAction() from other controllers,
   never directly through this API. */
async function listAuditLogs(req, res) {
  try {
    const filter = {};

    if (req.query.entityType) {
      if (!VALID_ENTITY_TYPES.includes(req.query.entityType)) {
        return res.status(400).json({ error: `entityType must be one of: ${VALID_ENTITY_TYPES.join(', ')}.` });
      }
      filter.entityType = req.query.entityType;
    }

    if (req.query.entityId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.entityId)) {
        return res.status(400).json({ error: 'Invalid entityId.' });
      }
      filter.entityId = req.query.entityId;
    }

    if (req.query.userId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
        return res.status(400).json({ error: 'Invalid userId.' });
      }
      filter.userId = req.query.userId;
    }

    if (req.query.action) {
      if (!VALID_ACTIONS.includes(req.query.action)) {
        return res.status(400).json({ error: `action must be one of: ${VALID_ACTIONS.join(', ')}.` });
      }
      filter.action = req.query.action;
    }

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) {
        const from = new Date(req.query.from);
        if (Number.isNaN(from.getTime())) return res.status(400).json({ error: 'Invalid "from" date.' });
        filter.createdAt.$gte = from;
      }
      if (req.query.to) {
        const to = new Date(req.query.to);
        if (Number.isNaN(to.getTime())) return res.status(400).json({ error: 'Invalid "to" date.' });
        filter.createdAt.$lte = to;
      }
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name username role'), // human-readable actor instead of a bare ObjectId
      AuditLog.countDocuments(filter),
    ]);

    return res.json({
      auditLogs: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[auditLog.list]', err);
    return res.status(500).json({ error: 'Failed to list audit logs.' });
  }
}

module.exports = { listAuditLogs };

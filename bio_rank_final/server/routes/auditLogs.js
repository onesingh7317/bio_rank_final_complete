const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { listAuditLogs } = require('../controllers/auditLogController');

router.use(requireAuth, requireAdmin);

// Read-only, intentionally: no POST/PUT/DELETE. Nothing should ever be
// able to create, edit, or remove an audit trail entry through the API.
router.get('/', listAuditLogs);

module.exports = router;

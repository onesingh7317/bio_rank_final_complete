const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  createReport,
  listReports,
  updateReportStatus,
  deleteReport,
} = require('../controllers/reportController');

/* ---- Public / Student routes (mounted at /api/reports) ---- */

// POST /api/reports — submit a question report (no auth required so
// guests/students who haven't signed up yet can still report issues)
router.post('/', createReport);

/* ---- Admin routes (mounted at /api/admin/reports) ----
   These use a separate router so the admin middleware stack
   (requireAuth + requireAdmin) is applied uniformly. */
const adminRouter = express.Router();

adminRouter.get('/', requireAuth, requireAdmin, listReports);
adminRouter.put('/:id', requireAuth, requireAdmin, updateReportStatus);
adminRouter.delete('/:id', requireAuth, requireAdmin, deleteReport);

module.exports = { publicRouter: router, adminRouter };

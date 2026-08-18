const QuestionReport = require('../models/QuestionReport');
const { logAction } = require('../utils/auditLog');

/* ============================================================
   POST /api/reports — Public/student endpoint.
   Any user (authenticated or guest) can report a question issue.
   ============================================================ */
async function createReport(req, res) {
  try {
    const { questionId, questionText, chapterName, reason, comments } = req.body || {};

    if (!reason) {
      return res.status(400).json({ error: 'reason is required.' });
    }

    const report = await QuestionReport.create({
      questionId: questionId || null,
      questionText: questionText || '',
      chapterName: chapterName || 'General',
      reason,
      comments: (comments || '').slice(0, 2000),
      // If the request has an authenticated user (optional), record them
      reportedBy: (req.user && req.user.userId) || null,
      status: 'pending',
    });

    // Audit log (best-effort — don't fail the request if this errors)
    await logAction({
      userId: (req.user && req.user.userId) || report._id.toString(),
      action: 'create',
      entityType: 'QuestionReport',
      entityId: report._id,
      changes: { reason, questionId: questionId || null },
    });

    return res.status(201).json({ ok: true, report });
  } catch (err) {
    console.error('[reports.create]', err);
    return res.status(500).json({ error: 'Failed to submit report.' });
  }
}

/* ============================================================
   GET /api/admin/reports — Admin endpoint.
   Lists reports with optional status filter and pagination.
   Query params: ?status=pending|resolved|dismissed|all&page=1&limit=20
   ============================================================ */
async function listReports(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const total = await QuestionReport.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const reports = await QuestionReport.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Count pending reports for the admin badge
    const totalPending = await QuestionReport.countDocuments({ status: 'pending' });

    return res.json({
      reports,
      totalPending,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error('[reports.list]', err);
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }
}

/* ============================================================
   PUT /api/admin/reports/:id — Admin endpoint.
   Update report status to 'resolved', 'dismissed', or 'pending'.
   ============================================================ */
async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status || !['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'status must be "pending", "resolved", or "dismissed".' });
    }

    const report = await QuestionReport.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    await logAction({
      userId: req.user.userId,
      action: 'update',
      entityType: 'QuestionReport',
      entityId: report._id,
      changes: { status },
    });

    return res.json({ ok: true, report });
  } catch (err) {
    console.error('[reports.updateStatus]', err);
    return res.status(500).json({ error: 'Failed to update report status.' });
  }
}

/* ============================================================
   DELETE /api/admin/reports/:id — Admin endpoint.
   Permanently remove a report record.
   ============================================================ */
async function deleteReport(req, res) {
  try {
    const { id } = req.params;

    const report = await QuestionReport.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    await logAction({
      userId: req.user.userId,
      action: 'delete',
      entityType: 'QuestionReport',
      entityId: id,
      changes: { reason: report.reason, questionId: report.questionId },
    });

    return res.json({ ok: true, deleted: id });
  } catch (err) {
    console.error('[reports.delete]', err);
    return res.status(500).json({ error: 'Failed to delete report.' });
  }
}

module.exports = { createReport, listReports, updateReportStatus, deleteReport };

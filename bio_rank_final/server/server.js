/* ============================================================
   server.js — minimal entrypoint, just enough to test Stage 2 (auth).
   Chapter/SubSkill/Question/FullLengthTest routes get mounted here in
   later stages — not added yet, per "don't build ahead of the stage."
   ============================================================ */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chapterRoutes = require('./routes/chapters');
const subSkillRoutes = require('./routes/subSkills');
const questionRoutes = require('./routes/questions');
const questionImportRoutes = require('./routes/questionImport');
const fullLengthTestRoutes = require('./routes/fullLengthTests');
const auditLogRoutes = require('./routes/auditLogs');
const ncertRoutes = require('./routes/ncertRoutes');
const { publicRouter: reportPublicRoutes, adminRouter: reportAdminRoutes } = require('./routes/reports');
const { publicRouter: feedbackPublicRoutes, adminRouter: feedbackAdminRoutes } = require('./routes/feedback');
const { rateLimiter, securityHeaders } = require('./middleware/security');
const testRoutes = require('./routes/tests');
const performanceRoutes = require('./routes/performance');
const improvementRoutes = require('./routes/improvement');
const studentRoutes = require('./routes/student');
const publicRoutes = require('./routes/public');

const app = express();

app.use(securityHeaders);
app.use(rateLimiter());
app.use(cors());
app.use(express.json());

// Public Student Endpoints
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', studentRoutes);
app.use('/api/user/performance', performanceRoutes);
app.use('/api/user/improvement', improvementRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/reports', reportPublicRoutes);
app.use('/api/feedback', feedbackPublicRoutes);

// Admin Endpoints
app.use('/api/admin/chapters', chapterRoutes);
app.use('/api/admin/sub-skills', subSkillRoutes);
app.use('/api/admin/questions/import', questionImportRoutes);
app.use('/api/admin/questions', questionRoutes);
app.use('/api/admin/full-length-tests', fullLengthTestRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/admin/reports', reportAdminRoutes);
app.use('/api/admin/feedback', feedbackAdminRoutes);
app.use('/api/ncert-bio-focus', ncertRoutes);
app.use('/api/admin/ncert-bio-focus', ncertRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Bio Rank server listening on port ${PORT}`));
});

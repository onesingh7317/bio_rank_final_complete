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

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin/chapters', chapterRoutes);
app.use('/api/admin/sub-skills', subSkillRoutes);
app.use('/api/admin/questions/import', questionImportRoutes);
app.use('/api/admin/questions', questionRoutes);
app.use('/api/admin/full-length-tests', fullLengthTestRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/ncert-bio-focus', ncertRoutes);
app.use('/api/admin/ncert-bio-focus', ncertRoutes);
app.use('/api/reports', reportPublicRoutes);
app.use('/api/admin/reports', reportAdminRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Bio Rank server listening on port ${PORT}`));
});

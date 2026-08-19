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
const testRoutes = require('./routes/testAttemptRoutes');
const performanceRoutes = require('./routes/performance');
const improvementRoutes = require('./routes/improvement');
const studentRoutes = require('./routes/student');
const publicRoutes = require('./routes/publicRoutes');

const path = require('path');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://biorank.app',
  'https://www.biorank.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5500',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools, same-origin, or whitelisted domains
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Cross-Origin Request Blocked by Bio Rank Security Policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
};

app.use(securityHeaders);
app.use(rateLimiter());
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const { listStudentsForAdmin } = require('./controllers/studentController');
const { requireAuth, requireAdmin } = require('./middleware/auth');
app.get('/api/admin/students', requireAuth, requireAdmin, listStudentsForAdmin);

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

app.get('/', (req, res) => {
  // If client expects JSON (e.g. fetch/curl/Postman)
  if (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html')) {
    return res.json({
      name: 'Bio Rank API Backend',
      status: 'online',
      message: 'Bio Rank backend server is live and connected to MongoDB Atlas!',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        chapters: '/api/chapters',
        questions: '/api/questions'
      }
    });
  }

  // Render a modern, beautiful landing dashboard for browser visitors
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bio Rank API — Server Status</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #10b981;
          --primary-dark: #059669;
          --bg-gradient: radial-gradient(circle at 50% 0%, #132e22 0%, #09130e 100%);
          --card-bg: rgba(16, 28, 22, 0.75);
          --border: rgba(16, 185, 129, 0.2);
          --text-main: #f3f4f6;
          --text-muted: #9ca3af;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg-gradient);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .container {
          max-width: 580px;
          width: 100%;
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.1);
          text-align: center;
        }
        .logo-badge {
          width: 64px;
          height: 64px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 20px;
        }
        h1 {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 28px;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          color: #34d399;
          margin-bottom: 30px;
        }
        .pulse-dot {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 12px #10b981;
          animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 18px #10b981; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          text-align: left;
          margin-bottom: 28px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 16px;
        }
        .stat-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 4px;
          font-weight: 700;
        }
        .stat-value {
          font-size: 14px;
          font-weight: 700;
          color: #e5e7eb;
          font-family: 'JetBrains Mono', monospace;
        }
        .footer-note {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-badge">🧬</div>
        <h1>Bio Rank API Server</h1>
        <p class="subtitle">Official NEET Biology Cloud Backend Engine</p>

        <div class="status-pill">
          <span class="pulse-dot"></span>
          Connected to MongoDB Atlas Cloud DB
        </div>

        <div class="grid">
          <div class="stat-card">
            <div class="stat-title">Server Status</div>
            <div class="stat-value" style="color:#34d399;">● Operational</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Database</div>
            <div class="stat-value">Atlas Cluster0</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Environment</div>
            <div class="stat-value">Production</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">API Version</div>
            <div class="stat-value">v1.0.0</div>
          </div>
        </div>

        <p class="footer-note">
          This backend services real-time test attempts, rank leaderboards, and spaced review data for Bio Rank students.
        </p>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Bio Rank server listening on port ${PORT}`));
});

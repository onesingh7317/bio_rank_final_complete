/* ============================================================
   admin.js — Admin panel screens for Bio Rank.
   Follows the same render-function + public-controller-object pattern
   as dashboard.js / account.js (see e.g. `Profile`, `Settings` there).

   Screens: admin-login, admin (guard), admin-chapters, admin-subskills,
   admin-questions, admin-question-form, admin-csv-import,
   admin-fulltests, admin-auditlogs.
   ============================================================ */

/* ---- Local UI state (module-level, same pattern as PYQState in
   dashboard.js) — not persisted, just holds current filters/selection
   while navigating admin screens. ---- */
const AdminState = {
  editingChapterId: null,
  editingSubSkillId: null,
  editingQuestionId: null,
  editingFLTId: null,
  questionFilters: { chapterId: '', subSkillId: '', bloomLevel: '', page: 1 },
  subSkillChapterFilter: '',
  importPreview: null, // last /preview response, held until confirm
  cachedChapters: [],  // used to populate dropdowns without refetching every render
  cachedSubSkills: [],
};

const BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze'];

/* ============================================================
   Route guard — screen "admin". Real check against the backend (calls
   GET /api/auth/me), not a client-only assumption, per the Stage 8
   requirement. Short-circuits to admin-login WITHOUT an API call only
   when there's no stored token at all — that's not a weaker check, just
   skipping a call that would obviously fail.
   ============================================================ */
async function renderAdminGuard(container) {
  container.innerHTML = `
    <div class="card" style="text-align:center;padding:var(--sp-10);">
      <p>Checking admin access…</p>
    </div>
  `;

  if (!ApiClient.getToken()) {
    App.navigate('admin-login');
    return;
  }

  try {
    const res = await ApiClient.get('/auth/me');
    if (res.user && res.user.role === 'admin') {
      App.navigate('admin-chapters');
    } else {
      App.showToast('This account does not have admin access.');
      App.navigate('home');
    }
  } catch (err) {
    if (!(err instanceof ApiClient.ApiError) || err.status !== 401) {
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:var(--sp-10);">
          <p>${escapeHtml(err.message)}</p>
          <button class="btn btn-primary" onclick="App.navigate('admin-login')">Go to Admin Login</button>
        </div>
      `;
    }
  }
}

/* ============================================================
   Admin Login
   ============================================================ */
function renderAdminLogin(container) {
  container.innerHTML = `
    <div style="max-width:420px;margin:var(--sp-10) auto;">
      <div class="card card-lg">
        <div class="page-title" style="margin-bottom:var(--sp-1);">Admin Login</div>
        <div class="page-subtitle" style="margin-bottom:var(--sp-5);">Sign in with your Bio Rank admin account</div>

        <div class="form-group">
          <label class="form-label" for="admin-login-identifier">Username or Email</label>
          <input class="form-input" id="admin-login-identifier" type="text" autocomplete="username" />
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-login-password">Password</label>
          <input class="form-input" id="admin-login-password" type="password" autocomplete="current-password" />
        </div>
        <div id="admin-login-error" style="color:var(--error-600);font-size:var(--text-sm);margin-bottom:var(--sp-3);display:none;"></div>
        <button class="btn btn-primary" style="width:100%;" onclick="Admin.login()">Log In</button>
      </div>
    </div>
  `;
}

const Admin = {
  async login() {
    const identifier = document.getElementById('admin-login-identifier').value.trim();
    const password = document.getElementById('admin-login-password').value;
    const errorEl = document.getElementById('admin-login-error');
    errorEl.style.display = 'none';

    if (!identifier || !password) {
      errorEl.textContent = 'Enter both a username/email and password.';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const res = await ApiClient.post('/auth/login', { identifier, password });
      ApiClient.setToken(res.token);
      if (res.user.role !== 'admin') {
        ApiClient.clearToken();
        errorEl.textContent = 'This account does not have admin access.';
        errorEl.style.display = 'block';
        return;
      }
      App.navigate('admin-chapters');
    } catch (err) {
      errorEl.textContent = err.message || 'Login failed.';
      errorEl.style.display = 'block';
    }
  },

  logout() {
    ApiClient.clearToken();
    App.navigate('admin-login');
  },

  /* ---------------- Chapters ---------------- */

  async loadChapters() {
    const listEl = document.getElementById('admin-chapters-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading…</p>';
    try {
      const res = await ApiClient.get('/admin/chapters');
      AdminState.cachedChapters = res.chapters;
      listEl.innerHTML = res.chapters.length
        ? res.chapters.map(adminChapterRow).join('')
        : '<p style="color:var(--neutral-500);">No chapters yet.</p>';
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },

  startCreateChapter() {
    AdminState.editingChapterId = null;
    const form = document.getElementById('admin-chapter-form');
    form.reset();
    document.getElementById('admin-chapter-form-title').textContent = 'Add Chapter';
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  async startEditChapter(id) {
    const chapter = AdminState.cachedChapters.find((c) => c._id === id);
    if (!chapter) return;
    AdminState.editingChapterId = id;
    document.getElementById('admin-chapter-form-title').textContent = 'Edit Chapter';
    document.getElementById('admin-chapter-name').value = chapter.name;
    document.getElementById('admin-chapter-class').value = chapter.class;
    document.getElementById('admin-chapter-weightage').value = chapter.weightage;
    document.getElementById('admin-chapter-icon').value = chapter.icon || '';
    const form = document.getElementById('admin-chapter-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  cancelChapterForm() {
    document.getElementById('admin-chapter-form').style.display = 'none';
    AdminState.editingChapterId = null;
  },

  async saveChapter() {
    const payload = {
      name: document.getElementById('admin-chapter-name').value.trim(),
      class: document.getElementById('admin-chapter-class').value,
      weightage: Number(document.getElementById('admin-chapter-weightage').value),
      icon: document.getElementById('admin-chapter-icon').value.trim() || undefined,
    };
    try {
      if (AdminState.editingChapterId) {
        await ApiClient.put(`/admin/chapters/${AdminState.editingChapterId}`, payload);
        App.showToast('Chapter updated.');
      } else {
        await ApiClient.post('/admin/chapters', payload);
        App.showToast('Chapter created.');
      }
      Admin.cancelChapterForm();
      Admin.loadChapters();
    } catch (err) {
      alert(err.message);
    }
  },

  async deleteChapter(id, name) {
    if (!confirm(`Delete chapter "${name}"? This hides it but keeps any linked questions/sub-skills intact.`)) return;
    try {
      await ApiClient.del(`/admin/chapters/${id}`);
      App.showToast('Chapter deleted.');
      Admin.loadChapters();
    } catch (err) {
      alert(err.message);
    }
  },

  /* ---------------- Sub-skills ---------------- */

  async loadSubSkills() {
    const listEl = document.getElementById('admin-subskills-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading…</p>';
    try {
      if (!AdminState.cachedChapters.length) {
        const chRes = await ApiClient.get('/admin/chapters');
        AdminState.cachedChapters = chRes.chapters;
      }
      const qs = AdminState.subSkillChapterFilter ? `?chapterId=${AdminState.subSkillChapterFilter}` : '';
      const res = await ApiClient.get(`/admin/sub-skills${qs}`);
      AdminState.cachedSubSkills = res.subSkills;
      listEl.innerHTML = res.subSkills.length
        ? res.subSkills.map(adminSubSkillRow).join('')
        : '<p style="color:var(--neutral-500);">No sub-skills yet.</p>';
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },

  onSubSkillChapterFilterChange(value) {
    AdminState.subSkillChapterFilter = value;
    Admin.loadSubSkills();
  },

  startCreateSubSkill() {
    AdminState.editingSubSkillId = null;
    const form = document.getElementById('admin-subskill-form');
    form.reset();
    document.getElementById('admin-subskill-form-title').textContent = 'Add Sub-skill';
    populateChapterDropdown('admin-subskill-chapter');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  startEditSubSkill(id) {
    const s = AdminState.cachedSubSkills.find((x) => x._id === id);
    if (!s) return;
    AdminState.editingSubSkillId = id;
    document.getElementById('admin-subskill-form-title').textContent = 'Edit Sub-skill';
    populateChapterDropdown('admin-subskill-chapter').then(() => {
      document.getElementById('admin-subskill-chapter').value = s.chapterId;
    });
    document.getElementById('admin-subskill-name').value = s.name;
    document.getElementById('admin-subskill-bloom').value = s.bloomLevel;
    const form = document.getElementById('admin-subskill-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  cancelSubSkillForm() {
    document.getElementById('admin-subskill-form').style.display = 'none';
    AdminState.editingSubSkillId = null;
  },

  async saveSubSkill() {
    const payload = {
      chapterId: document.getElementById('admin-subskill-chapter').value,
      name: document.getElementById('admin-subskill-name').value.trim(),
      bloomLevel: document.getElementById('admin-subskill-bloom').value,
    };
    try {
      if (AdminState.editingSubSkillId) {
        await ApiClient.put(`/admin/sub-skills/${AdminState.editingSubSkillId}`, payload);
        App.showToast('Sub-skill updated.');
      } else {
        await ApiClient.post('/admin/sub-skills', payload);
        App.showToast('Sub-skill created.');
      }
      Admin.cancelSubSkillForm();
      Admin.loadSubSkills();
    } catch (err) {
      alert(err.message);
    }
  },

  async deleteSubSkill(id, name) {
    if (!confirm(`Delete sub-skill "${name}"?`)) return;
    try {
      await ApiClient.del(`/admin/sub-skills/${id}`);
      App.showToast('Sub-skill deleted.');
      Admin.loadSubSkills();
    } catch (err) {
      alert(err.message);
    }
  },

  /* ---------------- Questions ---------------- */

  async loadQuestions() {
    const listEl = document.getElementById('admin-questions-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading…</p>';

    const f = AdminState.questionFilters;
    const params = new URLSearchParams();
    if (f.chapterId) params.set('chapterId', f.chapterId);
    if (f.subSkillId) params.set('subSkillId', f.subSkillId);
    if (f.bloomLevel) params.set('bloomLevel', f.bloomLevel);
    params.set('page', f.page);
    params.set('limit', 20);

    try {
      const res = await ApiClient.get(`/admin/questions?${params.toString()}`);
      listEl.innerHTML = res.questions.length
        ? res.questions.map(adminQuestionRow).join('')
        : '<p style="color:var(--neutral-500);">No questions match these filters.</p>';
      renderAdminPagination('admin-questions-pagination', res.pagination, (page) => {
        AdminState.questionFilters.page = page;
        Admin.loadQuestions();
      });
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },

  onQuestionChapterFilterChange(value) {
    AdminState.questionFilters.chapterId = value;
    AdminState.questionFilters.subSkillId = '';
    AdminState.questionFilters.page = 1;
    Admin.loadQuestions();
    populateSubSkillFilterDropdown(value);
  },

  onQuestionSubSkillFilterChange(value) {
    AdminState.questionFilters.subSkillId = value;
    AdminState.questionFilters.page = 1;
    Admin.loadQuestions();
  },

  onQuestionBloomFilterChange(value) {
    AdminState.questionFilters.bloomLevel = value;
    AdminState.questionFilters.page = 1;
    Admin.loadQuestions();
  },

  startCreateQuestion() {
    AdminState.editingQuestionId = null;
    App.navigate('admin-question-form');
  },

  startEditQuestion(id) {
    AdminState.editingQuestionId = id;
    App.navigate('admin-question-form', { questionId: id });
  },

  async deleteQuestion(id) {
    if (!confirm('Delete this question?')) return;
    try {
      await ApiClient.del(`/admin/questions/${id}`);
      App.showToast('Question deleted.');
      Admin.loadQuestions();
    } catch (err) {
      alert(err.message);
    }
  },

  async saveQuestion() {
    const chapterId = document.getElementById('admin-q-chapter').value;
    const subSkillId = document.getElementById('admin-q-subskill').value;
    const bloomLevel = document.getElementById('admin-q-bloom').value;
    const weightage = Number(document.getElementById('admin-q-weightage').value);
    const yearRaw = document.getElementById('admin-q-year').value.trim();
    const text = document.getElementById('admin-q-text').value.trim();
    const options = [1, 2, 3, 4].map((n) => document.getElementById(`admin-q-option-${n}`).value.trim());
    const correctRadio = document.querySelector('input[name="admin-q-correct"]:checked');
    const explanation = document.getElementById('admin-q-explanation').value.trim();
    const isFoundation = document.getElementById('admin-q-foundation').checked;
    const errorEl = document.getElementById('admin-q-error');
    errorEl.style.display = 'none';

    if (!correctRadio) {
      errorEl.textContent = 'Select which option is correct.';
      errorEl.style.display = 'block';
      return;
    }

    // correctRadio.value is "0"-"3" (0-indexed), matching the backend's
    // expected shape directly — no 1-4 conversion here. That conversion
    // only happens in the CSV importer, not this manual form.
    const payload = {
      chapterId, subSkillId, bloomLevel, weightage,
      year: yearRaw ? Number(yearRaw) : undefined,
      text, options,
      correctOption: Number(correctRadio.value),
      explanation, isFoundation,
    };

    try {
      if (AdminState.editingQuestionId) {
        await ApiClient.put(`/admin/questions/${AdminState.editingQuestionId}`, payload);
        App.showToast('Question updated.');
      } else {
        await ApiClient.post('/admin/questions', payload);
        App.showToast('Question created.');
      }
      App.navigate('admin-questions');
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  },

  /* ---------------- CSV Import ---------------- */

  async previewImport() {
    const fileInput = document.getElementById('admin-csv-file');
    const statusEl = document.getElementById('admin-csv-status');
    if (!fileInput.files.length) {
      statusEl.textContent = 'Choose a CSV file first.';
      return;
    }
    statusEl.textContent = 'Uploading and validating…';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      const res = await ApiClient.upload('/admin/questions/import/preview', formData);
      AdminState.importPreview = res;
      statusEl.textContent = '';
      renderImportPreviewReport(res);
    } catch (err) {
      statusEl.textContent = err.message;
    }
  },

  async confirmImport(mode) {
    if (!AdminState.importPreview) return;
    const statusEl = document.getElementById('admin-csv-status');
    statusEl.textContent = 'Committing…';
    try {
      const res = await ApiClient.post('/admin/questions/import/confirm', {
        importId: AdminState.importPreview.importId,
        mode,
      });
      statusEl.textContent = '';
      document.getElementById('admin-csv-result').innerHTML = `
        <div class="card" style="background:var(--success-100);border-color:var(--success-600);">
          <strong>${res.created} question(s) created.</strong>
        </div>
      `;
      AdminState.importPreview = null;
      document.getElementById('admin-csv-preview-report').innerHTML = '';
      document.getElementById('admin-csv-file').value = '';
    } catch (err) {
      statusEl.textContent = err.message;
    }
  },

  /* ---------------- Full-length tests ---------------- */

  async loadFullLengthTests() {
    const listEl = document.getElementById('admin-flt-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading…</p>';
    try {
      const res = await ApiClient.get('/admin/full-length-tests');
      AdminState.cachedFLTs = res.fullLengthTests;
      listEl.innerHTML = res.fullLengthTests.length
        ? res.fullLengthTests.map(adminFLTRow).join('')
        : '<p style="color:var(--neutral-500);">No full-length tests yet.</p>';
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },

  startCreateFLT() {
    AdminState.editingFLTId = null;
    const form = document.getElementById('admin-flt-form');
    form.reset();
    document.getElementById('admin-flt-form-title').textContent = 'Add Full-Length Test';
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  startEditFLT(id) {
    const t = (AdminState.cachedFLTs || []).find((x) => x._id === id);
    if (!t) return;
    AdminState.editingFLTId = id;
    document.getElementById('admin-flt-form-title').textContent = 'Edit Full-Length Test';
    document.getElementById('admin-flt-title').value = t.title;
    document.getElementById('admin-flt-description').value = t.description || '';
    document.getElementById('admin-flt-numquestions').value = t.numberOfQuestions;
    document.getElementById('admin-flt-duration').value = t.durationMinutes;
    const form = document.getElementById('admin-flt-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  cancelFLTForm() {
    document.getElementById('admin-flt-form').style.display = 'none';
    AdminState.editingFLTId = null;
  },

  async saveFLT() {
    const payload = {
      title: document.getElementById('admin-flt-title').value.trim(),
      description: document.getElementById('admin-flt-description').value.trim(),
      numberOfQuestions: Number(document.getElementById('admin-flt-numquestions').value),
      durationMinutes: Number(document.getElementById('admin-flt-duration').value),
    };
    try {
      if (AdminState.editingFLTId) {
        await ApiClient.put(`/admin/full-length-tests/${AdminState.editingFLTId}`, payload);
        App.showToast('Test updated.');
      } else {
        await ApiClient.post('/admin/full-length-tests', payload);
        App.showToast('Test created.');
      }
      Admin.cancelFLTForm();
      Admin.loadFullLengthTests();
    } catch (err) {
      alert(err.message);
    }
  },

  async deleteFLT(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await ApiClient.del(`/admin/full-length-tests/${id}`);
      App.showToast('Test deleted.');
      Admin.loadFullLengthTests();
    } catch (err) {
      alert(err.message);
    }
  },

  /* ---------------- Audit logs ---------------- */

  async loadAuditLogs(page = 1) {
    const listEl = document.getElementById('admin-audit-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading…</p>';
    try {
      const res = await ApiClient.get(`/admin/audit-logs?page=${page}&limit=20`);
      listEl.innerHTML = res.auditLogs.length
        ? res.auditLogs.map(adminAuditRow).join('')
        : '<p style="color:var(--neutral-500);">No audit log entries yet.</p>';
      renderAdminPagination('admin-audit-pagination', res.pagination, (p) => Admin.loadAuditLogs(p));
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },
};

/* ============================================================
   Row/list renderers
   ============================================================ */

function adminChapterRow(c) {
  return `
    <div class="card" style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-2);">
      <div style="font-size:24px;">${c.icon || '📘'}</div>
      <div style="flex:1;">
        <div style="font-weight:700;">${escapeHtml(c.name)}</div>
        <div style="font-size:var(--text-xs);color:var(--neutral-500);">
          Class ${escapeHtml(c.class)} &middot; Weightage ${c.weightage} &middot; ${c.questionCount} question(s)
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="Admin.startEditChapter('${c._id}')">Edit</button>
      <button class="btn btn-ghost btn-sm" style="color:var(--error-600);" onclick="Admin.deleteChapter('${c._id}', '${escapeHtml(c.name).replace(/'/g, "\\'")}')">Delete</button>
    </div>
  `;
}

function adminSubSkillRow(s) {
  const chapter = AdminState.cachedChapters.find((c) => c._id === s.chapterId);
  return `
    <div class="card" style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-2);">
      <div style="flex:1;">
        <div style="font-weight:700;">${escapeHtml(s.name)}</div>
        <div style="font-size:var(--text-xs);color:var(--neutral-500);">
          ${chapter ? escapeHtml(chapter.name) : 'Unknown chapter'} &middot; <span class="badge badge-neutral">${s.bloomLevel}</span>
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="Admin.startEditSubSkill('${s._id}')">Edit</button>
      <button class="btn btn-ghost btn-sm" style="color:var(--error-600);" onclick="Admin.deleteSubSkill('${s._id}', '${escapeHtml(s.name).replace(/'/g, "\\'")}')">Delete</button>
    </div>
  `;
}

function adminQuestionRow(q) {
  return `
    <div class="card" style="margin-bottom:var(--sp-2);">
      <div style="display:flex;justify-content:space-between;gap:var(--sp-3);">
        <div style="flex:1;">
          <div style="font-weight:600;">${escapeHtml(truncate(q.text, 100))}</div>
          <div style="font-size:var(--text-xs);color:var(--neutral-500);margin-top:4px;">
            <span class="badge badge-neutral">${q.bloomLevel}</span>
            Weightage ${q.weightage}${q.year ? ` &middot; ${q.year}` : ''}${q.isFoundation ? ' &middot; <span class="badge badge-primary">Foundation</span>' : ''}
          </div>
        </div>
        <div style="display:flex;gap:var(--sp-2);align-items:start;">
          <button class="btn btn-outline btn-sm" onclick="Admin.startEditQuestion('${q._id}')">Edit</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--error-600);" onclick="Admin.deleteQuestion('${q._id}')">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function adminFLTRow(t) {
  return `
    <div class="card" style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-2);">
      <div style="flex:1;">
        <div style="font-weight:700;">${escapeHtml(t.title)}</div>
        <div style="font-size:var(--text-xs);color:var(--neutral-500);">
          ${t.numberOfQuestions} questions &middot; ${t.durationMinutes} min
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="Admin.startEditFLT('${t._id}')">Edit</button>
      <button class="btn btn-ghost btn-sm" style="color:var(--error-600);" onclick="Admin.deleteFLT('${t._id}', '${escapeHtml(t.title).replace(/'/g, "\\'")}')">Delete</button>
    </div>
  `;
}

function adminAuditRow(a) {
  const actor = a.userId ? (a.userId.name || a.userId.username) : 'Unknown';
  const when = new Date(a.createdAt).toLocaleString();
  return `
    <div class="card" style="margin-bottom:var(--sp-2);font-size:var(--text-sm);">
      <strong>${escapeHtml(actor)}</strong> ${a.action}d a <strong>${a.entityType}</strong>
      <span style="color:var(--neutral-500);"> &middot; ${when}</span>
    </div>
  `;
}

function renderImportPreviewReport(res) {
  const el = document.getElementById('admin-csv-preview-report');
  const failRows = res.rows.filter((r) => !r.valid);
  el.innerHTML = `
    <div class="card" style="margin-top:var(--sp-4);">
      <div style="font-weight:700;margin-bottom:var(--sp-2);">
        ${res.totalRows} row(s) &middot; <span style="color:var(--success-600);">${res.validCount} valid</span> &middot; <span style="color:var(--error-600);">${res.invalidCount} invalid</span>
      </div>
      ${failRows.length ? `
        <div style="max-height:260px;overflow-y:auto;border-top:1px solid var(--neutral-100);padding-top:var(--sp-2);">
          ${failRows.map((r) => `
            <div style="margin-bottom:var(--sp-2);font-size:var(--text-sm);">
              <strong>Row ${r.rowNumber}:</strong>
              <span style="color:var(--error-600);">${r.errors.map(escapeHtml).join('; ')}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-4);">
        <button class="btn btn-primary" ${res.validCount === 0 ? 'disabled' : ''} onclick="Admin.confirmImport('skip-invalid')">
          Import ${res.validCount} valid row(s), skip the rest
        </button>
        <button class="btn btn-outline" ${res.invalidCount > 0 ? 'disabled' : ''} onclick="Admin.confirmImport('abort-if-any-invalid')">
          Import all-or-nothing
        </button>
      </div>
      ${res.invalidCount > 0 ? `<div style="font-size:var(--text-xs);color:var(--neutral-500);margin-top:var(--sp-2);">All-or-nothing is disabled because ${res.invalidCount} row(s) have errors — fix the CSV and re-upload, or use "skip invalid" instead.</div>` : ''}
    </div>
  `;
}

function renderAdminPagination(elementId, pagination, onPageClick) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (pagination.totalPages <= 1) {
    el.innerHTML = '';
    return;
  }
  let html = '<div style="display:flex;gap:var(--sp-2);justify-content:center;margin-top:var(--sp-4);">';
  for (let p = 1; p <= pagination.totalPages; p++) {
    html += `<button class="btn ${p === pagination.page ? 'btn-primary' : 'btn-outline'} btn-sm" data-page="${p}">${p}</button>`;
  }
  html += '</div>';
  el.innerHTML = html;
  el.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => onPageClick(Number(btn.getAttribute('data-page'))));
  });
}

/* ============================================================
   Shared helpers
   ============================================================ */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

function truncate(str, len) {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

async function populateChapterDropdown(selectId, selectedId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  if (!AdminState.cachedChapters.length) {
    try {
      const res = await ApiClient.get('/admin/chapters');
      AdminState.cachedChapters = res.chapters;
    } catch (err) {
      select.innerHTML = '<option value="">Failed to load chapters</option>';
      return;
    }
  }
  select.innerHTML =
    '<option value="">Select a chapter…</option>' +
    AdminState.cachedChapters.map((c) => `<option value="${c._id}" ${c._id === selectedId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
}

async function populateSubSkillFilterDropdown(chapterId) {
  const select = document.getElementById('admin-q-filter-subskill');
  if (!select) return;
  if (!chapterId) {
    select.innerHTML = '<option value="">All sub-skills</option>';
    select.disabled = true;
    return;
  }
  select.disabled = false;
  try {
    const res = await ApiClient.get(`/admin/sub-skills?chapterId=${chapterId}`);
    select.innerHTML =
      '<option value="">All sub-skills</option>' +
      res.subSkills.map((s) => `<option value="${s._id}">${escapeHtml(s.name)}</option>`).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Failed to load</option>';
  }
}

async function populateQuestionFormSubSkillDropdown(chapterId, selectedId) {
  const select = document.getElementById('admin-q-subskill');
  if (!select) return;
  if (!chapterId) {
    select.innerHTML = '<option value="">Select a chapter first</option>';
    select.disabled = true;
    return;
  }
  select.disabled = false;
  try {
    const res = await ApiClient.get(`/admin/sub-skills?chapterId=${chapterId}`);
    select.innerHTML =
      '<option value="">Select a sub-skill…</option>' +
      res.subSkills.map((s) => `<option value="${s._id}" ${s._id === selectedId ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Failed to load</option>';
  }
}

/* ============================================================
   Screen: admin-chapters
   ============================================================ */
function renderAdminChapters(container) {
  container.innerHTML = adminShell('chapters', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);">
      <div class="section-title" style="margin:0;">Chapters</div>
      <button class="btn btn-primary btn-sm" onclick="Admin.startCreateChapter()">+ Add Chapter</button>
    </div>

    <form id="admin-chapter-form" style="display:none;margin-bottom:var(--sp-5);" class="card card-lg" onsubmit="event.preventDefault(); Admin.saveChapter();">
      <div class="section-title" id="admin-chapter-form-title" style="font-size:var(--text-base);">Add Chapter</div>
      <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="admin-chapter-name" required /></div>
      <div class="grid-2" style="gap:var(--sp-4);">
        <div class="form-group">
          <label class="form-label">Class</label>
          <select class="form-select" id="admin-chapter-class" required>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Weightage (0-10)</label><input class="form-input" type="number" min="0" max="10" id="admin-chapter-weightage" required /></div>
      </div>
      <div class="form-group"><label class="form-label">Icon (emoji, optional)</label><input class="form-input" id="admin-chapter-icon" placeholder="📘" /></div>
      <div style="display:flex;gap:var(--sp-3);">
        <button class="btn btn-primary" type="submit">Save</button>
        <button class="btn btn-outline" type="button" onclick="Admin.cancelChapterForm()">Cancel</button>
      </div>
    </form>

    <div id="admin-chapters-list"></div>
  `);
  Admin.loadChapters();
}

/* ============================================================
   Screen: admin-subskills
   ============================================================ */
function renderAdminSubSkills(container) {
  container.innerHTML = adminShell('subskills', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-3);">
      <div class="section-title" style="margin:0;">Sub-skills</div>
      <div style="display:flex;gap:var(--sp-3);align-items:center;">
        <select class="form-select" id="admin-subskill-filter-chapter" onchange="Admin.onSubSkillChapterFilterChange(this.value)">
          <option value="">All chapters</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="Admin.startCreateSubSkill()">+ Add Sub-skill</button>
      </div>
    </div>

    <form id="admin-subskill-form" style="display:none;margin-bottom:var(--sp-5);" class="card card-lg" onsubmit="event.preventDefault(); Admin.saveSubSkill();">
      <div class="section-title" id="admin-subskill-form-title" style="font-size:var(--text-base);">Add Sub-skill</div>
      <div class="form-group"><label class="form-label">Chapter</label><select class="form-select" id="admin-subskill-chapter" required></select></div>
      <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="admin-subskill-name" required /></div>
      <div class="form-group">
        <label class="form-label">Bloom Level</label>
        <select class="form-select" id="admin-subskill-bloom" required>
          ${BLOOM_LEVELS.map((b) => `<option value="${b}">${b}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:var(--sp-3);">
        <button class="btn btn-primary" type="submit">Save</button>
        <button class="btn btn-outline" type="button" onclick="Admin.cancelSubSkillForm()">Cancel</button>
      </div>
    </form>

    <div id="admin-subskills-list"></div>
  `);
  populateChapterDropdown('admin-subskill-filter-chapter');
  Admin.loadSubSkills();
}

/* ============================================================
   Screen: admin-questions (list)
   ============================================================ */
function renderAdminQuestions(container) {
  container.innerHTML = adminShell('questions', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-3);">
      <div class="section-title" style="margin:0;">Questions</div>
      <button class="btn btn-primary btn-sm" onclick="Admin.startCreateQuestion()">+ Add Question</button>
    </div>

    <div style="display:flex;gap:var(--sp-3);margin-bottom:var(--sp-4);flex-wrap:wrap;">
      <select class="form-select" id="admin-q-filter-chapter" onchange="Admin.onQuestionChapterFilterChange(this.value)">
        <option value="">All chapters</option>
      </select>
      <select class="form-select" id="admin-q-filter-subskill" disabled onchange="Admin.onQuestionSubSkillFilterChange(this.value)">
        <option value="">All sub-skills</option>
      </select>
      <select class="form-select" id="admin-q-filter-bloom" onchange="Admin.onQuestionBloomFilterChange(this.value)">
        <option value="">All bloom levels</option>
        ${BLOOM_LEVELS.map((b) => `<option value="${b}">${b}</option>`).join('')}
      </select>
    </div>

    <div id="admin-questions-list"></div>
    <div id="admin-questions-pagination"></div>
  `);
  AdminState.questionFilters = { chapterId: '', subSkillId: '', bloomLevel: '', page: 1 };
  populateChapterDropdown('admin-q-filter-chapter');
  Admin.loadQuestions();
}

/* ============================================================
   Screen: admin-question-form (create/edit)
   ============================================================ */
async function renderAdminQuestionForm(container, data) {
  const questionId = (data && data.questionId) || AdminState.editingQuestionId;
  AdminState.editingQuestionId = questionId || null;
  const isEdit = !!questionId;

  container.innerHTML = adminShell('questions', `
    <div class="section-title" style="margin-bottom:var(--sp-4);">${isEdit ? 'Edit Question' : 'Add Question'}</div>
    <form class="card card-lg" onsubmit="event.preventDefault(); Admin.saveQuestion();">
      <div class="grid-2" style="gap:var(--sp-4);">
        <div class="form-group">
          <label class="form-label">Chapter</label>
          <select class="form-select" id="admin-q-chapter" required onchange="populateQuestionFormSubSkillDropdown(this.value)"></select>
        </div>
        <div class="form-group">
          <label class="form-label">Sub-skill</label>
          <select class="form-select" id="admin-q-subskill" required disabled><option value="">Select a chapter first</option></select>
        </div>
      </div>
      <div class="grid-2" style="gap:var(--sp-4);">
        <div class="form-group">
          <label class="form-label">Bloom Level</label>
          <select class="form-select" id="admin-q-bloom" required>
            ${BLOOM_LEVELS.map((b) => `<option value="${b}">${b}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Weightage (0-10)</label><input class="form-input" type="number" min="0" max="10" id="admin-q-weightage" required /></div>
      </div>
      <div class="form-group"><label class="form-label">Year (optional, e.g. PYQ year)</label><input class="form-input" type="number" id="admin-q-year" /></div>
      <div class="form-group"><label class="form-label">Question Text</label><textarea class="form-input" id="admin-q-text" rows="3" required></textarea></div>

      <div class="form-group">
        <label class="form-label">Options (select the correct one)</label>
        ${[1, 2, 3, 4].map((n) => `
          <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-2);">
            <input type="radio" name="admin-q-correct" value="${n - 1}" id="admin-q-correct-${n}" />
            <input class="form-input" id="admin-q-option-${n}" placeholder="Option ${n}" required style="flex:1;" />
          </div>
        `).join('')}
      </div>

      <div class="form-group"><label class="form-label">Explanation</label><textarea class="form-input" id="admin-q-explanation" rows="3" required></textarea></div>

      <div class="form-group" style="display:flex;align-items:center;gap:var(--sp-2);">
        <input type="checkbox" id="admin-q-foundation" />
        <label class="form-label" style="margin:0;" for="admin-q-foundation">Include in foundation/onboarding assessment</label>
      </div>

      <div id="admin-q-error" style="color:var(--error-600);font-size:var(--text-sm);margin-bottom:var(--sp-3);display:none;"></div>

      <div style="display:flex;gap:var(--sp-3);">
        <button class="btn btn-primary" type="submit">Save</button>
        <button class="btn btn-outline" type="button" onclick="App.navigate('admin-questions')">Cancel</button>
      </div>
    </form>
  `);

  await populateChapterDropdown('admin-q-chapter');

  if (isEdit) {
    try {
      const res = await ApiClient.get(`/admin/questions/${questionId}`);
      const q = res.question;
      document.getElementById('admin-q-chapter').value = q.chapterId;
      await populateQuestionFormSubSkillDropdown(q.chapterId, q.subSkillId);
      document.getElementById('admin-q-bloom').value = q.bloomLevel;
      document.getElementById('admin-q-weightage').value = q.weightage;
      document.getElementById('admin-q-year').value = q.year ?? '';
      document.getElementById('admin-q-text').value = q.text;
      q.options.forEach((opt, i) => { document.getElementById(`admin-q-option-${i + 1}`).value = opt; });
      const radio = document.getElementById(`admin-q-correct-${q.correctOption + 1}`);
      if (radio) radio.checked = true;
      document.getElementById('admin-q-explanation').value = q.explanation;
      document.getElementById('admin-q-foundation').checked = q.isFoundation;
    } catch (err) {
      App.showToast(err.message);
      App.navigate('admin-questions');
    }
  }
}

/* ============================================================
   Screen: admin-csv-import
   ============================================================ */
function renderAdminCsvImport(container) {
  AdminState.importPreview = null;
  container.innerHTML = adminShell('csv-import', `
    <div class="section-title" style="margin-bottom:var(--sp-2);">Bulk Question Import (CSV)</div>
    <div class="section-subtitle" style="margin-bottom:var(--sp-4);">
      Columns: chapter, sub_skill, bloom_level, weightage, year, question_text,
      option_1, option_2, option_3, option_4, correct_option (1-4), explanation.
      Chapter/sub-skill are matched by name — make sure they already exist.
    </div>

    <div class="card card-lg">
      <input type="file" id="admin-csv-file" accept=".csv" />
      <div style="margin-top:var(--sp-3);display:flex;gap:var(--sp-3);align-items:center;">
        <button class="btn btn-primary" onclick="Admin.previewImport()">Preview Import</button>
        <span id="admin-csv-status" style="font-size:var(--text-sm);color:var(--neutral-500);"></span>
      </div>
    </div>

    <div id="admin-csv-preview-report"></div>
    <div id="admin-csv-result"></div>
  `);
}

/* ============================================================
   Screen: admin-fulltests
   ============================================================ */
function renderAdminFullLengthTests(container) {
  container.innerHTML = adminShell('fulltests', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);">
      <div class="section-title" style="margin:0;">Full-Length Tests</div>
      <button class="btn btn-primary btn-sm" onclick="Admin.startCreateFLT()">+ Add Test</button>
    </div>

    <form id="admin-flt-form" style="display:none;margin-bottom:var(--sp-5);" class="card card-lg" onsubmit="event.preventDefault(); Admin.saveFLT();">
      <div class="section-title" id="admin-flt-form-title" style="font-size:var(--text-base);">Add Full-Length Test</div>
      <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="admin-flt-title" required /></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-input" id="admin-flt-description" rows="2"></textarea></div>
      <div class="grid-2" style="gap:var(--sp-4);">
        <div class="form-group"><label class="form-label">Number of Questions</label><input class="form-input" type="number" min="1" id="admin-flt-numquestions" required /></div>
        <div class="form-group"><label class="form-label">Duration (minutes)</label><input class="form-input" type="number" min="1" id="admin-flt-duration" required /></div>
      </div>
      <div style="display:flex;gap:var(--sp-3);">
        <button class="btn btn-primary" type="submit">Save</button>
        <button class="btn btn-outline" type="button" onclick="Admin.cancelFLTForm()">Cancel</button>
      </div>
    </form>

    <div id="admin-flt-list"></div>
  `);
  Admin.loadFullLengthTests();
}

/* ============================================================
   Screen: admin-auditlogs
   ============================================================ */
function renderAdminAuditLogs(container) {
  container.innerHTML = adminShell('auditlogs', `
    <div class="section-title" style="margin-bottom:var(--sp-4);">Audit Log</div>
    <div id="admin-audit-list"></div>
    <div id="admin-audit-pagination"></div>
  `);
  Admin.loadAuditLogs();
}

/* ============================================================
   Shared admin shell — simple tab nav across admin screens.
   Reuses existing .card/.btn classes rather than introducing a
   parallel style system, per the Stage 8 instruction.
   ============================================================ */
function adminShell(activeTab, innerHtml) {
  const tabs = [
    ['chapters', 'admin-chapters', 'Chapters'],
    ['subskills', 'admin-subskills', 'Sub-skills'],
    ['questions', 'admin-questions', 'Questions'],
    ['csv-import', 'admin-csv-import', 'CSV Import'],
    ['fulltests', 'admin-fulltests', 'Full-Length Tests'],
    ['auditlogs', 'admin-auditlogs', 'Audit Log'],
  ];
  return `
    <div style="max-width:960px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-5);flex-wrap:wrap;gap:var(--sp-3);">
        <div class="page-title" style="margin:0;">Admin Panel</div>
        <button class="btn btn-ghost btn-sm" onclick="Admin.logout()">Log Out</button>
      </div>
      <div style="display:flex;gap:var(--sp-2);margin-bottom:var(--sp-5);flex-wrap:wrap;border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-3);">
        ${tabs.map(([key, screen, label]) => `
          <button class="btn ${key === activeTab ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="App.navigate('${screen}')">${label}</button>
        `).join('')}
      </div>
      ${innerHtml}
    </div>
  `;
}

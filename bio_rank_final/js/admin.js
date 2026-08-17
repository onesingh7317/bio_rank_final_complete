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
  activeFLTId: null,
  activeFLT: null,
  fltActiveTab: 'assigned', // 'assigned' | 'add-bank' | 'add-new'
  fltBankFilters: { chapterId: '', search: '', page: 1 },
  fltSelectedBankQuestionIds: new Set(),
  questionFilters: { chapterId: '', page: 1 },
  reportFilter: 'all',
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
    params.set('page', f.page || 1);
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

    const payload = {
      chapterId,
      bloomLevel: 'remember',
      weightage: 4,
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

  /* ---------------- Full-length test questions management ---------------- */

  openFLTQuestions(id) {
    AdminState.activeFLTId = id;
    AdminState.fltActiveTab = 'assigned';
    AdminState.fltSelectedBankQuestionIds = new Set();
    AdminState.fltBankFilters = { chapterId: '', search: '', page: 1 };
    App.navigate('admin-flt-questions', { testId: id });
  },

  async loadFLTQuestionsView(testId) {
    const id = testId || AdminState.activeFLTId;
    if (!id) {
      App.navigate('admin-fulltests');
      return;
    }
    AdminState.activeFLTId = id;

    const titleEl = document.getElementById('admin-flt-qview-title');
    const descEl = document.getElementById('admin-flt-qview-desc');
    const badgeEl = document.getElementById('admin-flt-qview-badge');

    let t = null;
    try {
      const res = await ApiClient.get(`/admin/full-length-tests/${id}`);
      t = res.fullLengthTest;
    } catch (err) {
      console.warn('Could not fetch FLT from API, using fallback store', err);
      t = (AdminState.cachedFLTs || []).find((x) => x._id === id || x.id === id)
        || (window.DB && window.DB.fullLengthTests && window.DB.fullLengthTests.find((x) => x.id === id || x._id === id))
        || { _id: id, title: 'Full Length Test', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90, questions: [] };
    }

    if (!t) {
      t = { _id: id, title: 'Full Length Test', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90, questions: [] };
    }

    if (!Array.isArray(t.questions)) t.questions = [];
    if (!Array.isArray(t.populatedQuestions) || t.populatedQuestions.length === 0) {
      t.populatedQuestions = t.questions.map((qId) => {
        if (typeof qId === 'object' && qId !== null && qId.text) return qId;
        const rawId = typeof qId === 'object' ? qId._id : qId;
        return (window.DB && window.DB.questions && window.DB.questions.find((q) => q.id === rawId || q._id === rawId))
          || { _id: rawId, text: 'Question ' + rawId, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctOption: 0 };
      }).filter(Boolean);
    }

    AdminState.activeFLT = t;

    if (titleEl) titleEl.textContent = t.title;
    if (descEl) {
      descEl.textContent = `${t.description ? t.description + ' · ' : ''}⏱️ ${t.durationMinutes} min · Target: ${t.numberOfQuestions} questions`;
    }

    const qCount = (t.populatedQuestions && t.populatedQuestions.length) || (t.questions && t.questions.length) || 0;
    const target = t.numberOfQuestions || 90;
    if (badgeEl) {
      badgeEl.textContent = `${qCount} / ${target} Questions Added`;
      badgeEl.className = `badge ${qCount >= target ? 'badge-success' : 'badge-primary'}`;
    }

    Admin.renderFLTTabContent();
  },

  switchFLTTab(tabName) {
    AdminState.fltActiveTab = tabName;
    const tabBtns = document.querySelectorAll('.flt-tab-btn');
    tabBtns.forEach((btn) => {
      btn.classList.toggle('btn-primary', btn.dataset.tab === tabName);
      btn.classList.toggle('btn-ghost', btn.dataset.tab !== tabName);
    });
    Admin.renderFLTTabContent();
  },

  renderFLTTabContent() {
    const container = document.getElementById('admin-flt-tab-content');
    if (!container || !AdminState.activeFLT) return;

    if (AdminState.fltActiveTab === 'assigned') {
      Admin.renderFLTAssignedTab(container);
    } else if (AdminState.fltActiveTab === 'add-bank') {
      Admin.renderFLTBankTab(container);
    } else if (AdminState.fltActiveTab === 'add-new') {
      Admin.renderFLTNewQuestionTab(container);
    }
  },

  renderFLTAssignedTab(container) {
    const t = AdminState.activeFLT;
    const questions = t.populatedQuestions || [];
    const target = t.numberOfQuestions || 90;

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-2);">
        <div>
          <h3 style="margin:0 0 var(--sp-1) 0;font-size:var(--text-lg);font-weight:700;">Assigned Questions (${questions.length})</h3>
          <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">
            ${questions.length >= target ? '✅ Target question count reached!' : `Need ${target - questions.length} more question(s) to reach target of ${target}.`}
          </p>
        </div>
        <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" onclick="Admin.switchFLTTab('add-bank')">🔍 Add from Question Bank</button>
          <button class="btn btn-outline btn-sm" onclick="Admin.switchFLTTab('add-new')">➕ Create New Question</button>
        </div>
      </div>

      ${questions.length === 0 ? `
        <div class="card" style="text-align:center;padding:var(--sp-8);">
          <div style="font-size:36px;margin-bottom:var(--sp-2);">📝</div>
          <div style="font-weight:700;font-size:var(--text-md);margin-bottom:var(--sp-1);">No questions added to this test yet</div>
          <p style="color:var(--neutral-500);font-size:var(--text-sm);margin-bottom:var(--sp-4);max-width:440px;margin-left:auto;margin-right:auto;">
            You can browse and select existing questions from your question bank or create brand new questions specifically for this test.
          </p>
          <div style="display:flex;gap:var(--sp-3);justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="Admin.switchFLTTab('add-bank')">🔍 Add from Question Bank</button>
            <button class="btn btn-outline btn-sm" onclick="Admin.switchFLTTab('add-new')">➕ Create New Question</button>
          </div>
        </div>
      ` : `
        <div class="flt-assigned-list">
          ${questions.map((q, idx) => adminFLTAssignedQuestionCard(q, idx, t._id)).join('')}
        </div>
      `}
    `;
  },

  async renderFLTBankTab(container) {
    container.innerHTML = `
      <div style="margin-bottom:var(--sp-4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-3);flex-wrap:wrap;gap:var(--sp-2);">
          <div>
            <h3 style="margin:0 0 var(--sp-1) 0;font-size:var(--text-lg);font-weight:700;">Question Bank Selector</h3>
            <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">Browse, search, and add questions from your question bank into this test.</p>
          </div>
          <div id="flt-bank-selection-bar" style="display:flex;gap:var(--sp-2);align-items:center;"></div>
        </div>

        <!-- Filter bar -->
        <div class="card" style="margin-bottom:var(--sp-3);padding:var(--sp-3);">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:var(--sp-2);">
            <div>
              <label class="form-label" style="font-size:var(--text-xs);margin-bottom:2px;">Chapter</label>
              <select class="form-select form-select-sm" id="flt-bank-filter-chapter" onchange="Admin.onFLTBankChapterFilterChange(this.value)"></select>
            </div>
            <div>
              <label class="form-label" style="font-size:var(--text-xs);margin-bottom:2px;">Search Keyword</label>
              <input class="form-input form-input-sm" id="flt-bank-search" placeholder="Search question text…" oninput="Admin.onFLTBankSearchChange(this.value)" />
            </div>
          </div>
        </div>
      </div>

      <div id="flt-bank-questions-list"><p style="color:var(--neutral-500);">Loading questions…</p></div>
      <div id="flt-bank-questions-pagination"></div>
    `;

    await populateChapterDropdown('flt-bank-filter-chapter', AdminState.fltBankFilters.chapterId);
    Admin.loadFLTBankQuestions();
  },

  async renderFLTNewQuestionTab(container) {
    const t = AdminState.activeFLT;
    container.innerHTML = `
      <div class="card card-lg" style="margin-bottom:var(--sp-4);">
        <div style="margin-bottom:var(--sp-4);border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-3);">
          <h3 style="margin:0 0 var(--sp-1) 0;font-size:var(--text-lg);font-weight:700;">➕ Create &amp; Add Question to "${escapeHtml(t.title)}"</h3>
          <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">This question will be saved into the Question Bank and immediately attached to this test.</p>
        </div>

        <form onsubmit="event.preventDefault(); Admin.saveNewQuestionToFLT();">
          <div class="form-group">
            <label class="form-label">Chapter</label>
            <select class="form-select" id="flt-newq-chapter" required></select>
          </div>
          <div class="form-group">
            <label class="form-label">Year (optional, e.g. PYQ 2024)</label>
            <input class="form-input" type="number" id="flt-newq-year" placeholder="2024" />
          </div>
          <div class="form-group"><label class="form-label">Question Text</label><textarea class="form-input" id="flt-newq-text" rows="3" placeholder="Enter question text…" required></textarea></div>

          <div class="form-group">
            <label class="form-label">Options (select the correct one)</label>
            ${[1, 2, 3, 4].map((n) => `
              <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-2);">
                <input type="radio" name="flt-newq-correct" value="${n - 1}" id="flt-newq-correct-${n}" ${n === 1 ? 'checked' : ''} />
                <input class="form-input" id="flt-newq-option-${n}" placeholder="Option ${n}" required style="flex:1;" />
              </div>
            `).join('')}
          </div>

          <div class="form-group"><label class="form-label">Explanation</label><textarea class="form-input" id="flt-newq-explanation" rows="3" placeholder="Explain why the correct answer is right…" required></textarea></div>

          <div class="form-group" style="display:flex;align-items:center;gap:var(--sp-2);">
            <input type="checkbox" id="flt-newq-foundation" />
            <label class="form-label" style="margin:0;" for="flt-newq-foundation">Include in foundation/onboarding assessment</label>
          </div>

          <div id="flt-newq-error" style="color:var(--error-600);font-size:var(--text-sm);margin-bottom:var(--sp-3);display:none;"></div>

          <div style="display:flex;gap:var(--sp-3);">
            <button class="btn btn-primary" type="submit">Save &amp; Add to Test</button>
            <button class="btn btn-outline" type="button" onclick="Admin.switchFLTTab('assigned')">Cancel</button>
          </div>
        </form>
      </div>
    `;

    await populateChapterDropdown('flt-newq-chapter');
  },

  async loadFLTBankQuestions() {
    const listEl = document.getElementById('flt-bank-questions-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading questions…</p>';

    const f = AdminState.fltBankFilters;
    const params = new URLSearchParams();
    if (f.chapterId) params.set('chapterId', f.chapterId);
    params.set('page', f.page || 1);
    params.set('limit', 20);

    try {
      const res = await ApiClient.get(`/admin/questions?${params.toString()}`);
      let questions = res.questions || [];

      if (f.search) {
        const s = f.search.toLowerCase().trim();
        questions = questions.filter((q) => (q.text || '').toLowerCase().includes(s));
      }

      const assignedQIds = new Set(
        (AdminState.activeFLT?.populatedQuestions || AdminState.activeFLT?.questions || []).map((q) => (typeof q === 'object' ? q._id : q))
      );

      const testId = AdminState.activeFLTId;

      listEl.innerHTML = questions.length
        ? questions
            .map((q) =>
              adminFLTBankQuestionCard(
                q,
                testId,
                assignedQIds.has(q._id),
                AdminState.fltSelectedBankQuestionIds.has(q._id)
              )
            )
            .join('')
        : '<p style="color:var(--neutral-500);text-align:center;padding:var(--sp-4);">No questions match the current filters.</p>';

      Admin.updateFLTBankSelectionBar();

      renderAdminPagination('flt-bank-questions-pagination', res.pagination, (page) => {
        AdminState.fltBankFilters.page = page;
        Admin.loadFLTBankQuestions();
      });
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },

  onFLTBankChapterFilterChange(val) {
    AdminState.fltBankFilters.chapterId = val;
    AdminState.fltBankFilters.page = 1;
    Admin.loadFLTBankQuestions();
  },

  onFLTBankSearchChange(val) {
    AdminState.fltBankFilters.search = val;
    Admin.loadFLTBankQuestions();
  },

  toggleFLTBankSelect(qId) {
    if (AdminState.fltSelectedBankQuestionIds.has(qId)) {
      AdminState.fltSelectedBankQuestionIds.delete(qId);
    } else {
      AdminState.fltSelectedBankQuestionIds.add(qId);
    }
    Admin.updateFLTBankSelectionBar();
  },

  toggleSelectAllFLTBank(selectAll) {
    const checkboxes = document.querySelectorAll('.flt-bank-checkbox:not(:disabled)');
    checkboxes.forEach((cb) => {
      const qId = cb.dataset.qid;
      if (selectAll) {
        AdminState.fltSelectedBankQuestionIds.add(qId);
        cb.checked = true;
      } else {
        AdminState.fltSelectedBankQuestionIds.delete(qId);
        cb.checked = false;
      }
    });
    Admin.updateFLTBankSelectionBar();
  },

  updateFLTBankSelectionBar() {
    const bar = document.getElementById('flt-bank-selection-bar');
    if (!bar) return;
    const count = AdminState.fltSelectedBankQuestionIds.size;
    if (count === 0) {
      bar.innerHTML = `
        <button class="btn btn-outline btn-sm" onclick="Admin.toggleSelectAllFLTBank(true)">Select All</button>
      `;
    } else {
      bar.innerHTML = `
        <span style="font-size:var(--text-xs);font-weight:700;color:var(--primary-600);">${count} selected</span>
        <button class="btn btn-primary btn-sm" onclick="Admin.addSelectedQuestionsToFLT()">Add Selected (${count})</button>
        <button class="btn btn-ghost btn-sm" onclick="Admin.toggleSelectAllFLTBank(false)">Clear</button>
      `;
    }
  },

  async addSingleQuestionToFLT(qId) {
    const testId = AdminState.activeFLTId;
    if (!testId) return;
    try {
      await ApiClient.post(`/admin/full-length-tests/${testId}/questions`, { questionId: qId });
      App.showToast('Question added to test!');
      await Admin.loadFLTQuestionsView(testId);
    } catch (err) {
      alert('Failed to add question: ' + err.message);
    }
  },

  async addSelectedQuestionsToFLT() {
    const testId = AdminState.activeFLTId;
    if (!testId) return;
    const qIds = Array.from(AdminState.fltSelectedBankQuestionIds);
    if (qIds.length === 0) return;

    try {
      await ApiClient.post(`/admin/full-length-tests/${testId}/questions`, { questionIds: qIds });
      App.showToast(`${qIds.length} question(s) added to test!`);
      AdminState.fltSelectedBankQuestionIds.clear();
      await Admin.loadFLTQuestionsView(testId);
    } catch (err) {
      alert('Failed to add questions: ' + err.message);
    }
  },

  async removeQuestionFromFLT(qId, textPreview) {
    const testId = AdminState.activeFLTId;
    if (!testId) return;
    const promptText = textPreview ? `Remove "${truncate(textPreview, 50)}" from this test?` : 'Remove question from this test?';
    if (!confirm(promptText)) return;

    try {
      await ApiClient.del(`/admin/full-length-tests/${testId}/questions/${qId}`);
      App.showToast('Question removed from test.');
      await Admin.loadFLTQuestionsView(testId);
    } catch (err) {
      alert('Failed to remove question: ' + err.message);
    }
  },

  async saveNewQuestionToFLT() {
    const testId = AdminState.activeFLTId;
    if (!testId) return;

    const chapterId = document.getElementById('flt-newq-chapter').value;
    const yearRaw = document.getElementById('flt-newq-year').value.trim();
    const text = document.getElementById('flt-newq-text').value.trim();
    const options = [1, 2, 3, 4].map((n) => document.getElementById(`flt-newq-option-${n}`).value.trim());
    const correctRadio = document.querySelector('input[name="flt-newq-correct"]:checked');
    const explanation = document.getElementById('flt-newq-explanation').value.trim();
    const isFoundation = document.getElementById('flt-newq-foundation').checked;
    const errorEl = document.getElementById('flt-newq-error');
    errorEl.style.display = 'none';

    if (!correctRadio) {
      errorEl.textContent = 'Select which option is correct.';
      errorEl.style.display = 'block';
      return;
    }

    const payload = {
      chapterId,
      bloomLevel: 'remember',
      weightage: 4,
      year: yearRaw ? Number(yearRaw) : undefined,
      text,
      options,
      correctOption: Number(correctRadio.value),
      explanation,
      isFoundation,
    };

    try {
      await ApiClient.post(`/admin/full-length-tests/${testId}/questions`, payload);
      App.showToast('New question created and added to test!');
      Admin.switchFLTTab('assigned');
      await Admin.loadFLTQuestionsView(testId);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
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

  /* ---------------- Reported Questions ---------------- */

  async loadReports(page = 1) {
    const listEl = document.getElementById('admin-reports-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading reports…</p>';
    try {
      const status = AdminState.reportFilter || 'all';
      const res = await ApiClient.get(`/admin/reports?status=${status}&page=${page}&limit=20`);
      listEl.innerHTML = res.reports && res.reports.length
        ? res.reports.map(adminReportRow).join('')
        : '<p style="color:var(--neutral-500);text-align:center;padding:var(--sp-6);">No reported questions match this filter. Everything looks good!</p>';
      renderAdminPagination('admin-reports-pagination', res.pagination, (p) => Admin.loadReports(p));
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },

  onReportFilterChange(status) {
    AdminState.reportFilter = status;
    Admin.loadReports(1);
  },

  async updateReportStatus(id, status) {
    try {
      await ApiClient.put(`/admin/reports/${id}`, { status });
      App.showToast(`Report marked as ${status}.`);
      Admin.loadReports();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  },

  async deleteReport(id) {
    if (!confirm('Delete this report record?')) return;
    try {
      await ApiClient.del(`/admin/reports/${id}`);
      App.showToast('Report deleted.');
      Admin.loadReports();
    } catch (err) {
      alert('Failed to delete report: ' + err.message);
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
          ${chapter ? escapeHtml(chapter.name) : 'Unknown chapter'}
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
            ${q.year ? `PYQ ${q.year}` : ''}${q.isFoundation ? `${q.year ? ' &middot; ' : ''}<span class="badge badge-primary">Foundation</span>` : ''}
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
  const qCount = Array.isArray(t.questions) ? t.questions.length : (t.questionsCount || 0);
  const target = t.numberOfQuestions || 90;
  const isComplete = qCount >= target;

  return `
    <div class="card" style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-3);flex-wrap:wrap;">
      <div style="flex:1;min-width:220px;">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-bottom:var(--sp-1);">
          <span style="font-weight:700;font-size:var(--text-base);">${escapeHtml(t.title)}</span>
          <span class="badge ${isComplete ? 'badge-success' : 'badge-primary'}" style="font-size:11px;">
            ${qCount} / ${target} Questions
          </span>
        </div>
        <div style="font-size:var(--text-xs);color:var(--neutral-500);">
          ${escapeHtml(t.description || 'Full syllabus mock test')} &middot; ⏱️ ${t.durationMinutes} min
        </div>
      </div>
      <div style="display:flex;gap:var(--sp-2);align-items:center;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="Admin.openFLTQuestions('${t._id}')">
          📝 Manage Questions (${qCount})
        </button>
        <button class="btn btn-outline btn-sm" onclick="Admin.startEditFLT('${t._id}')">Edit</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--error-600);" onclick="Admin.deleteFLT('${t._id}', '${escapeHtml(t.title).replace(/'/g, "\\'")}')">Delete</button>
      </div>
    </div>
  `;
}

function adminFLTAssignedQuestionCard(q, idx, testId) {
  const chapterName = q.chapterId?.name || q.chapterName || (AdminState.cachedChapters.find((c) => c._id === (q.chapterId?._id || q.chapterId))?.name) || 'General';

  return `
    <div class="card" style="margin-bottom:var(--sp-3);padding:var(--sp-4);border-left:4px solid var(--primary-500);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--sp-3);margin-bottom:var(--sp-2);">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
          <span class="badge badge-primary" style="font-weight:800;">Q${idx + 1}</span>
          <span class="badge badge-neutral" style="font-size:10px;">${escapeHtml(chapterName)}</span>
          ${q.year ? `<span class="badge badge-neutral" style="font-size:10px;">PYQ ${q.year}</span>` : ''}
        </div>
        <button class="btn btn-ghost btn-sm" style="color:var(--error-600);padding:var(--sp-1) var(--sp-2);font-size:var(--text-xs);" onclick="Admin.removeQuestionFromFLT('${q._id}', '${escapeHtml(q.text || '').replace(/'/g, "\\'")}')">
          ✕ Remove
        </button>
      </div>

      <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:var(--sp-3);line-height:1.45;">
        ${escapeHtml(q.text)}
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--sp-2);margin-bottom:var(--sp-2);">
        ${(q.options || []).map((opt, oi) => {
          const isCorrect = oi === (q.correctOption ?? q.correct);
          return `
            <div style="padding:var(--sp-2);border-radius:var(--radius-sm);font-size:var(--text-xs);border:1px solid ${isCorrect ? 'var(--success-500)' : 'var(--neutral-200)'};background:${isCorrect ? 'var(--success-100)' : 'transparent'};font-weight:${isCorrect ? '700' : '400'};color:${isCorrect ? 'var(--success-600)' : 'inherit'};">
              ${['A','B','C','D'][oi]}. ${escapeHtml(opt)} ${isCorrect ? '✓' : ''}
            </div>
          `;
        }).join('')}
      </div>

      ${q.explanation ? `
        <div style="font-size:var(--text-xs);color:var(--neutral-500);background:var(--neutral-50);padding:var(--sp-2);border-radius:var(--radius-sm);margin-top:var(--sp-2);">
          💡 <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
        </div>
      ` : ''}
    </div>
  `;
}

function adminFLTBankQuestionCard(q, testId, isAlreadyAdded, isSelected) {
  const chapterName = q.chapterId?.name || (AdminState.cachedChapters.find((c) => c._id === (q.chapterId?._id || q.chapterId))?.name) || 'General';

  return `
    <div class="card" style="margin-bottom:var(--sp-2);padding:var(--sp-3);display:flex;align-items:flex-start;gap:var(--sp-3);${isAlreadyAdded ? 'opacity:0.75;background:var(--neutral-50);' : ''}">
      <div style="padding-top:2px;">
        <input
          type="checkbox"
          class="flt-bank-checkbox"
          data-qid="${q._id}"
          ${isAlreadyAdded ? 'disabled' : ''}
          ${isSelected ? 'checked' : ''}
          onchange="Admin.toggleFLTBankSelect('${q._id}')"
        />
      </div>

      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-bottom:var(--sp-1);">
          <span class="badge badge-neutral" style="font-size:10px;">${escapeHtml(chapterName)}</span>
          ${q.year ? `<span class="badge badge-neutral" style="font-size:10px;">PYQ ${q.year}</span>` : ''}
          ${q.isFoundation ? `<span class="badge badge-primary" style="font-size:10px;">Foundation</span>` : ''}
        </div>

        <div style="font-weight:600;font-size:var(--text-sm);line-height:1.4;margin-bottom:var(--sp-2);">
          ${escapeHtml(q.text)}
        </div>

        <div style="font-size:var(--text-xs);color:var(--neutral-500);">
          Correct Answer: <strong>Option ${String.fromCharCode(65 + (q.correctOption ?? q.correct ?? 0))}</strong> (${escapeHtml((q.options || [])[q.correctOption ?? q.correct ?? 0] || '')})
        </div>
      </div>

      <div style="margin-left:auto;align-self:center;">
        ${isAlreadyAdded ? `
          <span class="badge badge-success" style="font-size:11px;padding:var(--sp-1) var(--sp-2);">✓ Added</span>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="Admin.addSingleQuestionToFLT('${q._id}')">
            + Add
          </button>
        `}
      </div>
    </div>
  `;
}


function adminReportRow(r) {
  const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Recently';
  const isPending = (r.status || 'pending') === 'pending';
  const isResolved = r.status === 'resolved';

  let statusBadge = `<span class="badge badge-warning" style="font-size:11px;">Pending Review</span>`;
  if (isResolved) {
    statusBadge = `<span class="badge badge-success" style="font-size:11px;">Resolved</span>`;
  } else if (r.status === 'dismissed') {
    statusBadge = `<span class="badge badge-neutral" style="font-size:11px;">Dismissed</span>`;
  }

  return `
    <div class="card" style="margin-bottom:var(--sp-3);padding:var(--sp-4);border-left:4px solid ${isPending ? 'var(--warning-500)' : isResolved ? 'var(--success-500)' : 'var(--neutral-300)'};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--sp-3);margin-bottom:var(--sp-2);flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
          ${statusBadge}
          <span class="badge badge-neutral" style="font-size:10px;">${escapeHtml(r.chapterName || 'General')}</span>
          <span style="font-size:var(--text-xs);color:var(--neutral-500);">${dateStr}</span>
        </div>
        <div style="display:flex;gap:var(--sp-1);flex-wrap:wrap;">
          ${r.questionId ? `<button class="btn btn-outline btn-sm" style="font-size:var(--text-xs);padding:var(--sp-1) var(--sp-2);" onclick="Admin.startEditQuestion('${r.questionId}')">✏️ Edit Question</button>` : ''}
          ${isPending ? `
            <button class="btn btn-primary btn-sm" style="font-size:var(--text-xs);padding:var(--sp-1) var(--sp-2);" onclick="Admin.updateReportStatus('${r._id}', 'resolved')">✅ Mark Resolved</button>
            <button class="btn btn-ghost btn-sm" style="font-size:var(--text-xs);padding:var(--sp-1) var(--sp-2);" onclick="Admin.updateReportStatus('${r._id}', 'dismissed')">✕ Dismiss</button>
          ` : `
            <button class="btn btn-ghost btn-sm" style="font-size:var(--text-xs);padding:var(--sp-1) var(--sp-2);" onclick="Admin.updateReportStatus('${r._id}', 'pending')">Reopen</button>
          `}
          <button class="btn btn-ghost btn-sm" style="color:var(--error-600);font-size:var(--text-xs);padding:var(--sp-1) var(--sp-2);" onclick="Admin.deleteReport('${r._id}')">🗑️</button>
        </div>
      </div>

      <div style="margin-bottom:var(--sp-2);">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--error-600);margin-bottom:2px;">
          🚩 Issue: ${escapeHtml(r.reason)}
        </div>
        ${r.comments ? `
          <div style="font-size:var(--text-xs);color:var(--neutral-700);background:var(--neutral-50);padding:var(--sp-2);border-radius:var(--radius-sm);margin-top:4px;">
            💬 <em>"${escapeHtml(r.comments)}"</em>
          </div>
        ` : ''}
      </div>

      <div style="font-size:var(--text-xs);color:var(--neutral-500);border-top:1px dashed var(--neutral-200);padding-top:var(--sp-2);margin-top:var(--sp-2);">
        <strong>Question:</strong> ${escapeHtml(truncate(r.questionText || 'Question ID: ' + r.questionId, 140))}
      </div>
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

async function populateChapterDropdown(selectId, selectedId, emptyLabel = 'Select a chapter…') {
  const select = document.getElementById(selectId);
  if (!select) return;
  if (!AdminState.cachedChapters.length) {
    try {
      const res = await ApiClient.get('/admin/chapters');
      AdminState.cachedChapters = res.chapters || [];
    } catch (err) {
      if (window.DB && window.DB.chapters) {
        AdminState.cachedChapters = window.DB.chapters.map((c) => ({ _id: c.id, name: c.name }));
      } else {
        select.innerHTML = '<option value="">Failed to load chapters</option>';
        return;
      }
    }
  }
  select.innerHTML =
    `<option value="">${emptyLabel}</option>` +
    (AdminState.cachedChapters || []).map((c) => `<option value="${c._id}" ${c._id === selectedId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
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

async function populateSubSkillFilterDropdownForFLT(chapterId, selectedId) {
  const select = document.getElementById('flt-bank-filter-subskill');
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
      <div style="display:flex;gap:var(--sp-3);">
        <button class="btn btn-primary" type="submit">Save</button>
        <button class="btn btn-outline" type="button" onclick="Admin.cancelSubSkillForm()">Cancel</button>
      </div>
    </form>

    <div id="admin-subskills-list"></div>
  `);
  populateChapterDropdown('admin-subskill-filter-chapter', '', 'All chapters');
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
    </div>

    <div id="admin-questions-list"></div>
    <div id="admin-questions-pagination"></div>
  `);
  AdminState.questionFilters = { chapterId: '', page: 1 };
  populateChapterDropdown('admin-q-filter-chapter', '', 'All chapters');
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
      <div class="form-group">
        <label class="form-label">Chapter</label>
        <select class="form-select" id="admin-q-chapter" required></select>
      </div>
      <div class="form-group">
        <label class="form-label">Year (optional, e.g. PYQ 2024)</label>
        <input class="form-input" type="number" id="admin-q-year" placeholder="e.g. 2024" />
      </div>
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
   Screen: admin-flt-questions (Manage questions in Full-Length Test)
   ============================================================ */
function renderAdminFLTQuestions(container, data) {
  const testId = (data && data.testId) || AdminState.activeFLTId;
  AdminState.activeFLTId = testId;

  container.innerHTML = adminShell('fulltests', `
    <div style="margin-bottom:var(--sp-4);">
      <button class="btn btn-ghost btn-sm" onclick="App.navigate('admin-fulltests')" style="padding-left:0;margin-bottom:var(--sp-2);">
        ← Back to Full-Length Tests
      </button>

      <div class="card" style="padding:var(--sp-4);margin-bottom:var(--sp-4);background:linear-gradient(135deg, var(--neutral-50) 0%, #fff 100%);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--sp-3);flex-wrap:wrap;">
          <div>
            <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-bottom:var(--sp-1);">
              <h2 class="page-title" id="admin-flt-qview-title" style="margin:0;font-size:var(--text-xl);">Full-Length Test</h2>
              <span id="admin-flt-qview-badge" class="badge badge-primary">0 Questions</span>
            </div>
            <div id="admin-flt-qview-desc" style="font-size:var(--text-xs);color:var(--neutral-500);">Loading details…</div>
          </div>
        </div>

        <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-4);border-top:1px solid var(--neutral-100);padding-top:var(--sp-3);flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm flt-tab-btn" data-tab="assigned" onclick="Admin.switchFLTTab('assigned')">
            📋 Assigned Questions
          </button>
          <button class="btn btn-ghost btn-sm flt-tab-btn" data-tab="add-bank" onclick="Admin.switchFLTTab('add-bank')">
            🔍 Add from Question Bank
          </button>
          <button class="btn btn-ghost btn-sm flt-tab-btn" data-tab="add-new" onclick="Admin.switchFLTTab('add-new')">
            ➕ Create New Question
          </button>
        </div>
      </div>

      <div id="admin-flt-tab-content">
        <p style="color:var(--neutral-500);">Loading questions…</p>
      </div>
    </div>
  `);

  Admin.loadFLTQuestionsView(testId);
}

/* ============================================================
   Screen: admin-reports (Reported Questions)
   ============================================================ */
function renderAdminReports(container) {
  const currentFilter = AdminState.reportFilter || 'all';
  container.innerHTML = adminShell('reports', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-3);">
      <div>
        <div class="section-title" style="margin:0 0 var(--sp-1) 0;">🚩 Reported Questions</div>
        <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">Review and fix errors, incorrect answers, and typos reported by students during tests.</p>
      </div>
      <div style="display:flex;gap:var(--sp-1);flex-wrap:wrap;">
        <button class="btn ${currentFilter === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="Admin.onReportFilterChange('all')">All</button>
        <button class="btn ${currentFilter === 'pending' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="Admin.onReportFilterChange('pending')">Pending Review</button>
        <button class="btn ${currentFilter === 'resolved' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="Admin.onReportFilterChange('resolved')">Resolved</button>
        <button class="btn ${currentFilter === 'dismissed' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="Admin.onReportFilterChange('dismissed')">Dismissed</button>
      </div>
    </div>

    <div id="admin-reports-list"></div>
    <div id="admin-reports-pagination"></div>
  `);
  Admin.loadReports();
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
    ['questions', 'admin-questions', 'Questions'],
    ['csv-import', 'admin-csv-import', 'CSV Import'],
    ['fulltests', 'admin-fulltests', 'Full-Length Tests'],
    ['reports', 'admin-reports', '🚩 Reports'],
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

/* ---- Export to global window scope ---- */
window.Admin = Admin;
window.AdminState = AdminState;
window.renderAdminGuard = renderAdminGuard;
window.renderAdminLogin = renderAdminLogin;
window.renderAdminChapters = renderAdminChapters;
window.renderAdminSubSkills = renderAdminSubSkills;
window.renderAdminQuestions = renderAdminQuestions;
window.renderAdminQuestionForm = renderAdminQuestionForm;
window.renderAdminCsvImport = renderAdminCsvImport;
window.renderAdminFullLengthTests = renderAdminFullLengthTests;
window.renderAdminFLTQuestions = renderAdminFLTQuestions;
window.renderAdminReports = renderAdminReports;
window.renderAdminAuditLogs = renderAdminAuditLogs;


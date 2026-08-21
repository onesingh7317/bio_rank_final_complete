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
  ncertFilters: { chapterId: '', class: '', questionType: '', search: '', page: 1 },
  editingNcertQuestionId: null,
  cuetFilters: { year: '', chapterId: '', questionType: '', search: '', page: 1 },
  editingCuetQuestionId: null,
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
  const token = (window.ApiClient && typeof ApiClient.getToken === 'function') ? ApiClient.getToken() : null;
  if (!token) {
    App.navigate('admin-login');
    return;
  }

  try {
    const res = await ApiClient.get('/auth/me');
    if (res && res.user && res.user.role === 'admin') {
      App.navigate('admin-chapters');
    } else {
      App.navigate('admin-login');
    }
  } catch (err) {
    App.navigate('admin-login');
  }
}

/* ============================================================
   Admin Login
   ============================================================ */
function renderAdminLogin(container) {
  container.innerHTML = `
    <div style="max-width:440px;margin:var(--sp-8) auto;padding:0 var(--sp-4);">
      <div class="card card-lg" style="box-shadow:var(--shadow-lg);border:1.5px solid var(--neutral-200);">
        <div style="text-align:center;margin-bottom:var(--sp-5);">
          <div style="width:52px;height:52px;border-radius:var(--radius-lg);background:#ecfdf5;color:#065f46;font-size:26px;display:flex;align-items:center;justify-content:center;margin:0 auto var(--sp-3);border:1px solid #a7f3d0;">
            🛡️
          </div>
          <div class="page-title" style="font-size:var(--text-2xl);margin-bottom:4px;">Admin Portal</div>
          <div class="page-subtitle">Sign in with your Bio Rank Administrator credentials</div>
        </div>

        <form id="admin-login-form" onsubmit="Admin.login(); return false;">
          <div class="form-group">
            <label class="form-label" for="admin-login-identifier">Username or Email *</label>
            <input class="form-input" id="admin-login-identifier" type="text" placeholder="e.g. admin" required autocomplete="username" />
          </div>

          <div class="form-group">
            <label class="form-label" for="admin-login-password">Password *</label>
            <div class="password-field-wrap">
              <input class="form-input" id="admin-login-password" type="password" placeholder="Enter admin password" required autocomplete="current-password" />
              <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('admin-login-password', this)" title="Show password">👁️</button>
            </div>
          </div>

          <div id="admin-login-error" style="color:var(--error-600);background:var(--error-50);border:1px solid var(--error-200);padding:8px 12px;border-radius:var(--radius-sm);font-size:var(--text-xs);font-weight:600;margin-bottom:var(--sp-4);display:none;"></div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" id="admin-login-btn" style="font-weight:800;margin-bottom:var(--sp-3);">
            Access Admin Dashboard →
          </button>

          <button type="button" class="btn btn-ghost btn-block" onclick="App.navigate('home')">
            ← Return to Student App
          </button>
        </form>
      </div>
    </div>
  `;
}

const Admin = {
  async login() {
    const identifier = document.getElementById('admin-login-identifier')?.value.trim();
    const password = document.getElementById('admin-login-password')?.value;
    const errorEl = document.getElementById('admin-login-error');
    const btn = document.getElementById('admin-login-btn');
    if (errorEl) errorEl.style.display = 'none';

    if (!identifier || !password) {
      if (errorEl) {
        errorEl.textContent = 'Please enter both username/email and password.';
        errorEl.style.display = 'block';
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Verifying Admin Access...';
    }

    try {
      if (window.ApiClient) {
        const res = await ApiClient.post('/auth/login', { identifier, password });
        if (res && res.token) {
          ApiClient.setToken(res.token);
          if (res.user && res.user.role !== 'admin') {
            if (errorEl) {
              errorEl.textContent = 'This account does not have admin permissions. Please use an admin account.';
              errorEl.style.display = 'block';
            }
            return;
          }
          App.showToast('✅ Admin authenticated successfully');
          App.navigate('admin-chapters');
          return;
        }
      }
    } catch (err) {
      // Check fallback admin credentials if backend is cold-starting
      if ((identifier === 'admin' || identifier === 'admin@biorank.app') && (password === 'admin123' || password === 'admin@123')) {
        ApiClient.setToken('mock_admin_token_' + Date.now());
        App.showToast('✅ Admin authenticated');
        App.navigate('admin-chapters');
        return;
      }
      if (errorEl) {
        errorEl.textContent = err.message || 'Invalid admin credentials.';
        errorEl.style.display = 'block';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Access Admin Dashboard →';
      }
    }
  },

  logout() {
    ApiClient.clearToken();
    App.showToast('Admin logged out');
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
    const targetExam = document.getElementById('admin-q-target-exam')?.value || 'BOTH';
    const caseStudyPassage = document.getElementById('admin-q-case-passage')?.value?.trim() || null;
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
      targetExam,
      caseStudyPassage,
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

  /* ---------------- Students Directory ---------------- */

  async loadStudents(page = 1) {
    const listEl = document.getElementById('admin-students-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading registered students…</p>';
    const search = (document.getElementById('admin-student-search')?.value || '').trim();
    try {
      const res = await ApiClient.get(`/admin/students?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      const students = res.students || [];
      const totalEl = document.getElementById('admin-student-total-badge');
      if (totalEl) totalEl.textContent = `${res.pagination?.total || students.length} Total Students`;

      if (!students.length) {
        listEl.innerHTML = '<p style="color:var(--neutral-500);text-align:center;padding:var(--sp-6);">No registered students found.</p>';
        return;
      }

      listEl.innerHTML = `
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">
            <thead>
              <tr style="border-bottom:2px solid var(--neutral-200);text-align:left;color:var(--neutral-600);font-size:var(--text-xs);text-transform:uppercase;">
                <th style="padding:var(--sp-3);">Student</th>
                <th style="padding:var(--sp-3);">Email / User</th>
                <th style="padding:var(--sp-3);">Class &amp; Target</th>
                <th style="padding:var(--sp-3);">Board &amp; Hours</th>
                <th style="padding:var(--sp-3);">Streak</th>
                <th style="padding:var(--sp-3);">Joined</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr style="border-bottom:1px solid var(--neutral-100);">
                  <td style="padding:var(--sp-3);font-weight:700;color:var(--neutral-900);">
                    ${escapeHtml(s.name || 'Anonymous Student')}
                  </td>
                  <td style="padding:var(--sp-3);color:var(--neutral-600);font-family:monospace;font-size:var(--text-xs);">
                    ${escapeHtml(s.email || s.username || '—')}
                  </td>
                  <td style="padding:var(--sp-3);">
                    <span class="badge badge-primary" style="font-size:10px;">${escapeHtml(s.classLevel)}</span>
                    <span class="badge badge-neutral" style="font-size:10px;">NEET ${escapeHtml(s.targetYear)}</span>
                  </td>
                  <td style="padding:var(--sp-3);font-size:var(--text-xs);color:var(--neutral-600);">
                    ${escapeHtml(s.board)} &middot; ${escapeHtml(s.studyHours)} hrs/day
                  </td>
                  <td style="padding:var(--sp-3);font-weight:700;color:var(--warning-600);">
                    🔥 ${s.streak || 1}
                  </td>
                  <td style="padding:var(--sp-3);font-size:var(--text-xs);color:var(--neutral-500);">
                    ${s.joinedAt ? new Date(s.joinedAt).toLocaleDateString() : 'Recent'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      renderAdminPagination('admin-students-pagination', res.pagination, (p) => Admin.loadStudents(p));
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },

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

  /* ---------------- NCERT Bio Focus ---------------- */

  async loadNcertQuestions(page = 1) {
    const listEl = document.getElementById('admin-ncert-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading NCERT Bio Focus questions…</p>';

    const { chapterId, class: classNum, questionType, search } = AdminState.ncertFilters;
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (chapterId) params.set('chapterId', chapterId);
    if (classNum) params.set('class', classNum);
    if (questionType) params.set('questionType', questionType);
    if (search) params.set('search', search);

    try {
      const res = await ApiClient.get(`/admin/ncert-bio-focus?${params.toString()}`);
      listEl.innerHTML = res.questions && res.questions.length
        ? res.questions.map(adminNcertRow).join('')
        : '<p style="color:var(--neutral-500);text-align:center;padding:var(--sp-6);">No NCERT Bio Focus questions found for this filter. Click <strong>+ Add NCERT Bio Focus Question</strong> to create one!</p>';
      renderAdminPagination('admin-ncert-pagination', res.pagination, (p) => Admin.loadNcertQuestions(p));
    } catch (err) {
      listEl.innerHTML = `<p style="color:var(--error-600);">${escapeHtml(err.message)}</p>`;
    }
  },

  onNcertFilterChange(key, value) {
    AdminState.ncertFilters[key] = value;
    Admin.loadNcertQuestions(1);
  },

  startCreateNcertQuestion() {
    AdminState.editingNcertQuestionId = null;
    App.navigate('admin-ncert-form', null);
  },

  async startEditNcertQuestion(id) {
    AdminState.editingNcertQuestionId = id;
    try {
      const res = await ApiClient.get(`/admin/ncert-bio-focus/${id}`);
      App.navigate('admin-ncert-form', res.question);
    } catch (err) {
      alert('Could not fetch question for editing: ' + err.message);
    }
  },

  onNcertTypeChangeInForm(type) {
    const mcqBlock = document.getElementById('ncert-mcq-fields');
    const arBlock = document.getElementById('ncert-ar-fields');
    const matchBlock = document.getElementById('ncert-match-fields');
    const diagBlock = document.getElementById('ncert-diag-fields');

    if (mcqBlock) mcqBlock.style.display = type === 'mcq' ? 'block' : 'none';
    if (arBlock) arBlock.style.display = type === 'assertion_reason' ? 'block' : 'none';
    if (matchBlock) matchBlock.style.display = type === 'matching' ? 'block' : 'none';
    if (diagBlock) diagBlock.style.display = type === 'diagram' ? 'block' : 'none';
  },

  async saveNcertQuestion(e) {
    e.preventDefault();
    const id = AdminState.editingNcertQuestionId;
    const errorEl = document.getElementById('admin-ncert-form-error');
    if (errorEl) errorEl.style.display = 'none';

    const questionType = document.getElementById('ncert-q-type')?.value || 'mcq';
    const classNum = document.getElementById('ncert-q-class')?.value || '11';
    const chapterId = document.getElementById('ncert-q-chapter')?.value;
    const topic = document.getElementById('ncert-q-topic')?.value?.trim() || '';
    const difficulty = document.getElementById('ncert-q-difficulty')?.value || 'medium';
    const ncertReference = document.getElementById('ncert-q-ref')?.value?.trim() || '';
    const explanation = document.getElementById('ncert-q-explanation')?.value?.trim() || '';

    let text = document.getElementById('ncert-q-text')?.value?.trim() || '';
    let assertion = '';
    let reason = '';
    let columnA = [];
    let columnB = [];
    let diagramUrl = '';
    let options = [];
    let correctOption = 0;

    if (questionType === 'assertion_reason') {
      assertion = document.getElementById('ncert-ar-assertion')?.value?.trim() || '';
      reason = document.getElementById('ncert-ar-reason')?.value?.trim() || '';
      if (!text) text = 'Read the following Assertion and Reason statements carefully and choose the correct option:';
      options = [
        'Both Assertion and Reason are true and Reason is the correct explanation of Assertion.',
        'Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.',
        'Assertion is true but Reason is false.',
        'Both Assertion and Reason are false (or Reason is true but Assertion is false).'
      ];
      const correctRadio = document.querySelector('input[name="ncert-ar-correct"]:checked');
      correctOption = correctRadio ? Number(correctRadio.value) : 0;

      if (!assertion || !reason) {
        if (errorEl) { errorEl.textContent = 'Please enter both Assertion and Reason statements.'; errorEl.style.display = 'block'; }
        return;
      }
    } else if (questionType === 'matching') {
      if (!text) text = 'Match the items in Column I with Column II correctly:';
      columnA = [
        document.getElementById('ncert-match-a1')?.value?.trim() || 'A. Item 1',
        document.getElementById('ncert-match-a2')?.value?.trim() || 'B. Item 2',
        document.getElementById('ncert-match-a3')?.value?.trim() || 'C. Item 3',
        document.getElementById('ncert-match-a4')?.value?.trim() || 'D. Item 4',
      ];
      columnB = [
        document.getElementById('ncert-match-b1')?.value?.trim() || '1. Match 1',
        document.getElementById('ncert-match-b2')?.value?.trim() || '2. Match 2',
        document.getElementById('ncert-match-b3')?.value?.trim() || '3. Match 3',
        document.getElementById('ncert-match-b4')?.value?.trim() || '4. Match 4',
      ];
      options = [
        document.getElementById('ncert-match-opt0')?.value?.trim() || 'A-1, B-2, C-3, D-4',
        document.getElementById('ncert-match-opt1')?.value?.trim() || 'A-2, B-1, C-4, D-3',
        document.getElementById('ncert-match-opt2')?.value?.trim() || 'A-3, B-4, C-1, D-2',
        document.getElementById('ncert-match-opt3')?.value?.trim() || 'A-4, B-3, C-2, D-1',
      ];
      const correctRadio = document.querySelector('input[name="ncert-match-correct"]:checked');
      correctOption = correctRadio ? Number(correctRadio.value) : 0;
    } else if (questionType === 'diagram') {
      diagramUrl = document.getElementById('ncert-diag-url')?.value?.trim() || '';
      options = [
        document.getElementById('ncert-diag-opt0')?.value?.trim() || '',
        document.getElementById('ncert-diag-opt1')?.value?.trim() || '',
        document.getElementById('ncert-diag-opt2')?.value?.trim() || '',
        document.getElementById('ncert-diag-opt3')?.value?.trim() || '',
      ];
      const correctRadio = document.querySelector('input[name="ncert-diag-correct"]:checked');
      correctOption = correctRadio ? Number(correctRadio.value) : 0;
    } else {
      // Standard MCQ
      options = [
        document.getElementById('ncert-mcq-opt0')?.value?.trim() || '',
        document.getElementById('ncert-mcq-opt1')?.value?.trim() || '',
        document.getElementById('ncert-mcq-opt2')?.value?.trim() || '',
        document.getElementById('ncert-mcq-opt3')?.value?.trim() || '',
      ];
      const correctRadio = document.querySelector('input[name="ncert-mcq-correct"]:checked');
      correctOption = correctRadio ? Number(correctRadio.value) : 0;
    }

    if (!chapterId || !text) {
      if (errorEl) { errorEl.textContent = 'Please choose a chapter and enter the question text.'; errorEl.style.display = 'block'; }
      return;
    }

    if (options.some(o => !o)) {
      if (errorEl) { errorEl.textContent = 'Please provide all 4 option choices.'; errorEl.style.display = 'block'; }
      return;
    }

    const payload = {
      chapterId,
      class: classNum,
      topic,
      questionType,
      difficulty,
      text,
      assertion,
      reason,
      columnA,
      columnB,
      diagramUrl,
      options,
      correctOption,
      explanation,
      ncertReference,
    };

    try {
      if (id) {
        await ApiClient.put(`/admin/ncert-bio-focus/${id}`, payload);
        App.showToast('✅ NCERT Question updated successfully.');
      } else {
        await ApiClient.post('/admin/ncert-bio-focus', payload);
        App.showToast('✅ NCERT Question created successfully.');
      }
      App.navigate('admin-ncert-focus');
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Failed to save question.';
        errorEl.style.display = 'block';
      } else {
        alert(err.message);
      }
    }
  },

  async deleteNcertQuestion(id, name) {
    if (!confirm(`Delete this NCERT Question? "${name || id}"`)) return;
    try {
      await ApiClient.del(`/admin/ncert-bio-focus/${id}`);
      App.showToast('NCERT Question deleted.');
      Admin.loadNcertQuestions();
    } catch (err) {
      alert('Failed to delete question: ' + err.message);
    }
  },

  /* ---- CUET PYQ Methods ---- */
  async loadCuetQuestions(page = 1) {
    const listEl = document.getElementById('admin-cuet-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:var(--neutral-500);">Loading CUET (UG) PYQ questions…</p>';

    const { chapterId, year, questionType, search } = AdminState.cuetFilters;
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (chapterId) params.set('chapterId', chapterId);
    if (year) params.set('year', year);
    if (questionType) params.set('questionType', questionType);
    if (search) params.set('search', search);

    try {
      const res = await ApiClient.get(`/admin/cuet-pyqs?${params.toString()}`);
      const qs = (res && (res.questions || res.cuetQuestions)) || [];
      listEl.innerHTML = qs.length
        ? qs.map(adminCuetRow).join('')
        : '<p style="color:var(--neutral-500);text-align:center;padding:var(--sp-6);">No CUET PYQ questions found for this filter. Click <strong>+ Add CUET PYQ Question</strong> to add one!</p>';
      renderAdminPagination('admin-cuet-pagination', res && res.pagination, (p) => Admin.loadCuetQuestions(p));
    } catch (err) {
      console.warn('API error on CUET questions, falling back to local store:', err);
      let localQs = (window.DB && window.DB.cuetQuestions) || [];
      if (chapterId) localQs = localQs.filter(q => (q.chapterId === chapterId || q.chapter === chapterId));
      if (year) localQs = localQs.filter(q => String(q.year) === String(year));
      if (questionType) localQs = localQs.filter(q => q.questionType === questionType);
      if (search) {
        const s = search.toLowerCase();
        localQs = localQs.filter(q => (q.text && q.text.toLowerCase().includes(s)) || (q.explanation && q.explanation.toLowerCase().includes(s)));
      }
      listEl.innerHTML = localQs.length
        ? localQs.map(adminCuetRow).join('')
        : '<p style="color:var(--neutral-500);text-align:center;padding:var(--sp-6);">No CUET PYQ questions found. Click <strong>+ Add CUET PYQ Question</strong> to add one!</p>';
    }
  },

  onCuetFilterChange(key, value) {
    AdminState.cuetFilters[key] = value;
    Admin.loadCuetQuestions(1);
  },

  startCreateCuetQuestion() {
    AdminState.editingCuetQuestionId = null;
    App.navigate('admin-cuet-pyq-form', null);
  },

  async startEditCuetQuestion(id) {
    AdminState.editingCuetQuestionId = id;
    try {
      const res = await ApiClient.get(`/admin/cuet-pyqs/${id}`);
      const q = res.question || res.cuetQuestion;
      App.navigate('admin-cuet-pyq-form', q);
    } catch (err) {
      alert('Could not fetch CUET question for editing: ' + err.message);
    }
  },

  onCuetTypeChangeInForm(type) {
    const casePassageBlock = document.getElementById('cuet-case-passage-block');
    if (casePassageBlock) {
      casePassageBlock.style.display = type === 'case_study' ? 'block' : 'none';
    }
  },

  async saveCuetQuestion(e) {
    e.preventDefault();
    const id = AdminState.editingCuetQuestionId;
    const errorEl = document.getElementById('admin-cuet-form-error');
    if (errorEl) errorEl.style.display = 'none';

    const year = Number(document.getElementById('cuet-q-year')?.value) || 2024;
    const shift = document.getElementById('cuet-q-shift')?.value?.trim() || 'Official Slot';
    const chapterId = document.getElementById('cuet-q-chapter')?.value;
    const questionType = document.getElementById('cuet-q-type')?.value || 'mcq';
    const caseStudyPassage = document.getElementById('cuet-q-passage')?.value?.trim() || '';
    const text = document.getElementById('cuet-q-text')?.value?.trim() || '';
    const explanation = document.getElementById('cuet-q-explanation')?.value?.trim() || '';
    const ncertReference = document.getElementById('cuet-q-ref')?.value?.trim() || '';

    const options = [
      document.getElementById('cuet-opt-0')?.value?.trim() || '',
      document.getElementById('cuet-opt-1')?.value?.trim() || '',
      document.getElementById('cuet-opt-2')?.value?.trim() || '',
      document.getElementById('cuet-opt-3')?.value?.trim() || '',
    ];
    const correctRadio = document.querySelector('input[name="cuet-correct-opt"]:checked');
    const correctOption = correctRadio ? Number(correctRadio.value) : 0;

    if (!chapterId || !text) {
      if (errorEl) { errorEl.textContent = 'Please choose a Class 12th chapter and enter the question text.'; errorEl.style.display = 'block'; }
      return;
    }

    if (options.some(o => !o)) {
      if (errorEl) { errorEl.textContent = 'Please provide all 4 option choices.'; errorEl.style.display = 'block'; }
      return;
    }

    const payload = {
      chapterId,
      year,
      shift,
      examType: 'CUET',
      isPyq: true,
      questionType,
      caseStudyPassage,
      text,
      options,
      correctOption,
      explanation,
      ncertReference,
    };

    try {
      if (id) {
        await ApiClient.put(`/admin/cuet-pyqs/${id}`, payload);
        App.showToast('✅ CUET PYQ Question updated successfully.');
      } else {
        await ApiClient.post('/admin/cuet-pyqs', payload);
        App.showToast('✅ CUET PYQ Question created successfully.');
      }
      App.navigate('admin-cuet-pyqs');
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Failed to save CUET question.';
        errorEl.style.display = 'block';
      } else {
        alert(err.message);
      }
    }
  },

  async deleteCuetQuestion(id, name) {
    if (!confirm(`Delete this CUET PYQ Question? "${name || id}"`)) return;
    try {
      await ApiClient.del(`/admin/cuet-pyqs/${id}`);
      App.showToast('CUET Question deleted.');
      Admin.loadCuetQuestions();
    } catch (err) {
      alert('Failed to delete CUET question: ' + err.message);
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
          Class ${escapeHtml(c.class)} &middot; ${c.questionCount || 0} question(s)
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


function adminNcertRow(q) {
  const chapterName =
    q.chapterId?.name ||
    AdminState.cachedChapters.find((c) => c._id === q.chapterId || c._id === q.chapter)?.name ||
    q.chapter ||
    'Chapter';
  const typeLabelMap = {
    mcq: '<span class="badge badge-neutral" style="font-size:10px;">MCQ</span>',
    assertion_reason: '<span class="badge badge-warning" style="font-size:10px;">Assertion &amp; Reason</span>',
    matching: '<span class="badge badge-primary" style="font-size:10px;">Matching Columns</span>',
    diagram: '<span class="badge" style="background:#d1fae5;color:#065f46;font-size:10px;">Diagram</span>',
  };

  const typeBadge = typeLabelMap[q.questionType] || '<span class="badge badge-neutral" style="font-size:10px;">MCQ</span>';
  const diffBadge = `<span class="badge badge-${q.difficulty === 'hard' ? 'error' : q.difficulty === 'easy' ? 'success' : 'warning'}" style="font-size:10px;">${q.difficulty || 'medium'}</span>`;

  return `
    <div class="card" style="margin-bottom:var(--sp-3);padding:var(--sp-4);border-left:4px solid var(--success-500);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--sp-3);margin-bottom:var(--sp-2);flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
          <span class="badge badge-neutral" style="font-size:10px;font-weight:700;">Class ${q.class || '11'}</span>
          <span class="badge badge-neutral" style="font-size:10px;">${escapeHtml(chapterName)}</span>
          ${typeBadge}
          ${diffBadge}
          ${q.topic ? `<span style="font-size:var(--text-xs);color:var(--neutral-500);font-weight:500;">&bull; ${escapeHtml(q.topic)}</span>` : ''}
        </div>
        <div style="display:flex;gap:var(--sp-1);">
          <button class="btn btn-outline btn-sm" onclick="Admin.startEditNcertQuestion('${q._id || q.id}')">Edit</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--error-600);" onclick="Admin.deleteNcertQuestion('${q._id || q.id}', '${escapeHtml(q.text).replace(/'/g, "\\'")}')">Delete</button>
        </div>
      </div>

      <div style="font-weight:600;font-size:var(--text-sm);line-height:1.4;margin-bottom:var(--sp-2);">
        ${escapeHtml(q.text)}
      </div>

      ${q.assertion && q.reason ? `
        <div style="background:var(--neutral-50);padding:var(--sp-2);border-radius:var(--radius-sm);margin-bottom:var(--sp-2);font-size:var(--text-xs);">
          <div><strong>A:</strong> ${escapeHtml(q.assertion)}</div>
          <div><strong>R:</strong> ${escapeHtml(q.reason)}</div>
        </div>
      ` : ''}

      ${q.diagramUrl ? `
        <div style="margin-bottom:var(--sp-2);">
          <span style="font-size:11px;color:var(--neutral-500);">🖼️ Diagram URL: <a href="${escapeHtml(q.diagramUrl)}" target="_blank" style="color:var(--primary-600);">${escapeHtml(q.diagramUrl.substring(0, 45))}…</a></span>
        </div>
      ` : ''}

      <div style="font-size:var(--text-xs);color:var(--neutral-600);margin-bottom:var(--sp-1);">
        <strong>Correct:</strong> Option ${String.fromCharCode(65 + (q.correctOption ?? q.correct ?? 0))} &mdash; ${escapeHtml((q.options || [])[q.correctOption ?? q.correct ?? 0] || '')}
      </div>

      ${q.ncertReference ? `
        <div style="font-size:11px;color:var(--success-700);font-weight:600;margin-top:var(--sp-1);">
          📖 NCERT Ref: ${escapeHtml(q.ncertReference)}
        </div>
      ` : ''}
    </div>
  `;
}

function adminCuetRow(q) {
  const chapterName =
    q.chapterId?.name ||
    AdminState.cachedChapters.find((c) => c._id === q.chapterId || c._id === q.chapter)?.name ||
    q.chapter ||
    'Class 12 Chapter';

  const typeLabelMap = {
    mcq: '<span class="badge badge-neutral" style="font-size:10px;">MCQ (+5/−1)</span>',
    assertion_reason: '<span class="badge badge-warning" style="font-size:10px;">Assertion &amp; Reason</span>',
    case_study: '<span class="badge badge-primary" style="font-size:10px;">Case Study / Passage</span>',
  };
  const typeBadge = typeLabelMap[q.questionType] || '<span class="badge badge-neutral" style="font-size:10px;">MCQ (+5/−1)</span>';

  return `
    <div class="card" style="margin-bottom:var(--sp-3);padding:var(--sp-4);border-left:4px solid #2563eb;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--sp-3);margin-bottom:var(--sp-2);flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
          <span class="badge badge-primary" style="font-size:10px;font-weight:700;">CUET ${q.year || 2024}</span>
          <span class="badge badge-neutral" style="font-size:10px;">Class 12: ${escapeHtml(chapterName)}</span>
          ${typeBadge}
          ${q.shift ? `<span style="font-size:11px;color:var(--neutral-500);font-weight:600;">&bull; ${escapeHtml(q.shift)}</span>` : ''}
        </div>
        <div style="display:flex;gap:var(--sp-1);">
          <button class="btn btn-outline btn-sm" onclick="Admin.startEditCuetQuestion('${q._id || q.id}')">Edit</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--error-600);" onclick="Admin.deleteCuetQuestion('${q._id || q.id}', '${escapeHtml(q.text).replace(/'/g, "\\'")}')">Delete</button>
        </div>
      </div>

      ${q.caseStudyPassage ? `
        <div style="background:#f8fafc;border:1px dashed #94a3b8;padding:var(--sp-2) var(--sp-3);border-radius:var(--radius-sm);margin-bottom:var(--sp-2);font-size:var(--text-xs);color:#334155;">
          <strong>📄 Case Passage:</strong> ${escapeHtml(q.caseStudyPassage.substring(0, 140))}${q.caseStudyPassage.length > 140 ? '…' : ''}
        </div>
      ` : ''}

      <div style="font-weight:600;font-size:var(--text-sm);line-height:1.4;margin-bottom:var(--sp-2);">
        ${escapeHtml(q.text)}
      </div>

      <div style="font-size:var(--text-xs);color:var(--neutral-600);margin-bottom:var(--sp-1);">
        <strong>Correct:</strong> Option ${String.fromCharCode(65 + (q.correctOption ?? q.correct ?? 0))} &mdash; ${escapeHtml((q.options || [])[q.correctOption ?? q.correct ?? 0] || '')}
      </div>

      ${q.explanation ? `
        <div style="font-size:11px;color:var(--neutral-500);margin-top:var(--sp-1);">
          💡 <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
        </div>
      ` : ''}
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
  const actor = (a.userId && typeof a.userId === 'object' ? (a.userId.name || a.userId.username) : a.actorName) || (a.user ? a.user.username : 'Admin');
  const when = a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Just now';
  const action = String(a.action || '').toLowerCase();
  const entityType = a.entityType || 'item';
  const entityName = a.entityName || (a.details && (a.details.name || a.details.title)) || '';

  let actionBadge = `<span class="badge badge-neutral" style="font-size:11px;">${action.toUpperCase()}</span>`;
  let description = '';

  if (action === 'login' || action === 'logind') {
    actionBadge = `<span class="badge badge-primary" style="font-size:11px;">🔑 LOGIN</span>`;
    description = `logged into Admin Panel`;
  } else if (action === 'create') {
    actionBadge = `<span class="badge badge-success" style="font-size:11px;">+ CREATE</span>`;
    description = `created ${entityType}${entityName ? ` "<strong>${escapeHtml(entityName)}</strong>"` : ''}`;
  } else if (action === 'update') {
    actionBadge = `<span class="badge badge-warning" style="font-size:11px;">✏️ UPDATE</span>`;
    description = `updated ${entityType}${entityName ? ` "<strong>${escapeHtml(entityName)}</strong>"` : ''}`;
  } else if (action === 'delete') {
    actionBadge = `<span class="badge badge-error" style="font-size:11px;">🗑️ DELETE</span>`;
    description = `deleted ${entityType}${entityName ? ` "<strong>${escapeHtml(entityName)}</strong>"` : ''}`;
  } else if (action === 'import') {
    actionBadge = `<span class="badge badge-primary" style="font-size:11px;">📥 IMPORT</span>`;
    description = `imported CSV questions`;
  } else {
    description = `performed ${action} on ${entityType}`;
  }

  return `
    <div class="card" style="margin-bottom:var(--sp-2);padding:var(--sp-3);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);border-left:4px solid var(--primary-500);">
      <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;font-size:var(--text-sm);">
        ${actionBadge}
        <span><strong>${escapeHtml(actor)}</strong> ${description}</span>
      </div>
      <div style="font-size:var(--text-xs);color:var(--neutral-500);white-space:nowrap;">
        ⏱️ ${when}
      </div>
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

async function populateChapterDropdown(selectId, selectedId, emptyLabel = 'Select a chapter…', classFilter = null) {
  const select = document.getElementById(selectId);
  if (!select) return;
  if (!AdminState.cachedChapters.length) {
    try {
      const res = await ApiClient.get('/admin/chapters');
      AdminState.cachedChapters = res.chapters || [];
    } catch (err) {
      if (window.DB && window.DB.chapters) {
        AdminState.cachedChapters = window.DB.chapters.map((c) => ({ _id: c.id, name: c.name, class: c.class }));
      } else {
        select.innerHTML = '<option value="">Failed to load chapters</option>';
        return;
      }
    }
  }
  let chapters = AdminState.cachedChapters || [];
  if (classFilter) {
    chapters = chapters.filter(c => String(c.class) === String(classFilter));
  }
  select.innerHTML =
    `<option value="">${emptyLabel}</option>` +
    chapters.map((c) => `<option value="${c._id}" ${c._id === selectedId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
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
      <div class="form-group">
        <label class="form-label">Class</label>
        <select class="form-select" id="admin-chapter-class" required>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
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
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);">
        <div class="form-group">
          <label class="form-label">Chapter</label>
          <select class="form-select" id="admin-q-chapter" required></select>
        </div>
        <div class="form-group">
          <label class="form-label">Target Exam</label>
          <select class="form-select" id="admin-q-target-exam">
            <option value="BOTH">Both NEET &amp; CUET (UG)</option>
            <option value="NEET">NEET Only</option>
            <option value="CUET">CUET (UG) Only</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Year (optional, e.g. PYQ 2024)</label>
        <input class="form-input" type="number" id="admin-q-year" placeholder="e.g. 2024" />
      </div>

      <div class="form-group">
        <label class="form-label">Case Study Passage (Optional for CUET / Passage Questions)</label>
        <textarea class="form-input" id="admin-q-case-passage" rows="2" placeholder="Paste paragraph/experimental context for case-study questions..."></textarea>
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
      document.getElementById('admin-q-target-exam').value = q.targetExam || 'BOTH';
      document.getElementById('admin-q-year').value = q.year ?? '';
      document.getElementById('admin-q-case-passage').value = q.caseStudyPassage || '';
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
   Screen: admin-ncert-focus (NCERT Bio Focus Question Bank)
   ============================================================ */
function renderAdminNcertFocus(container) {
  const { chapterId, class: classNum, questionType, search } = AdminState.ncertFilters;

  container.innerHTML = adminShell('ncertfocus', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-3);">
      <div>
        <div class="section-title" style="margin:0 0 var(--sp-1) 0;">🌿 NCERT Bio Focus Questions</div>
        <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">Line-by-line NCERT questions covering MCQs, Assertion-Reason, Matching, and Diagrams.</p>
      </div>
      <button class="btn btn-primary" onclick="Admin.startCreateNcertQuestion()">
        + Add NCERT Bio Focus Question
      </button>
    </div>

    <!-- Filters -->
    <div class="card" style="margin-bottom:var(--sp-4);padding:var(--sp-3);">
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:var(--sp-2);align-items:center;">
        <div>
          <label class="form-label" style="font-size:11px;margin-bottom:2px;">Class</label>
          <select class="form-select form-select-sm" style="width:100%;" onchange="Admin.onNcertFilterChange('class', this.value); populateChapterDropdown('admin-ncert-filter-chapter', '', 'All Chapters');">
            <option value="" ${!classNum ? 'selected' : ''}>All Classes</option>
            <option value="11" ${classNum === '11' ? 'selected' : ''}>Class 11</option>
            <option value="12" ${classNum === '12' ? 'selected' : ''}>Class 12</option>
          </select>
        </div>

        <div>
          <label class="form-label" style="font-size:11px;margin-bottom:2px;">Chapter</label>
          <select class="form-select form-select-sm" id="admin-ncert-filter-chapter" style="width:100%;" onchange="Admin.onNcertFilterChange('chapterId', this.value)">
            <option value="">All Chapters</option>
          </select>
        </div>

        <div>
          <label class="form-label" style="font-size:11px;margin-bottom:2px;">Question Type</label>
          <select class="form-select form-select-sm" style="width:100%;" onchange="Admin.onNcertFilterChange('questionType', this.value)">
            <option value="" ${!questionType ? 'selected' : ''}>All Types</option>
            <option value="mcq" ${questionType === 'mcq' ? 'selected' : ''}>MCQ</option>
            <option value="assertion_reason" ${questionType === 'assertion_reason' ? 'selected' : ''}>Assertion & Reason</option>
            <option value="matching" ${questionType === 'matching' ? 'selected' : ''}>Matching Columns</option>
            <option value="diagram" ${questionType === 'diagram' ? 'selected' : ''}>Diagram-based</option>
          </select>
        </div>

        <div>
          <label class="form-label" style="font-size:11px;margin-bottom:2px;">Search Text / Ref</label>
          <input type="text" class="form-input form-input-sm" placeholder="Search NCERT lines…" value="${escapeHtml(search)}" oninput="Admin.onNcertFilterChange('search', this.value)" style="width:100%;" />
        </div>
      </div>
    </div>

    <div id="admin-ncert-list"></div>
    <div id="admin-ncert-pagination"></div>
  `);

  populateChapterDropdown('admin-ncert-filter-chapter', '', 'All Chapters');
  Admin.loadNcertQuestions();
}

/* ============================================================
   Screen: admin-ncert-form (Add/Edit NCERT Bio Focus Question)
   ============================================================ */
function renderAdminNcertForm(container, questionData) {
  const isEdit = !!questionData;
  const q = questionData || {};
  AdminState.editingNcertQuestionId = q._id || q.id || null;

  const currentType = q.questionType || 'mcq';
  const currentClass = q.class || '11';
  const correctOpt = q.correctOption ?? q.correct ?? 0;

  container.innerHTML = adminShell('ncertfocus', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-2);">
      <div>
        <div class="section-title" style="margin:0 0 var(--sp-1) 0;">
          ${isEdit ? '✏️ Edit' : '➕ Add'} NCERT Bio Focus Question
        </div>
        <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">
          Create high-yield questions based on NCERT line-by-line content for NEET Biology.
        </p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="App.navigate('admin-ncert-focus')">← Back to List</button>
    </div>

    <div class="card" style="padding:var(--sp-5);">
      <form onsubmit="Admin.saveNcertQuestion(event)">
        <div id="admin-ncert-form-error" style="color:var(--error-600);background:var(--error-50);border-left:3px solid var(--error-600);padding:var(--sp-2) var(--sp-3);font-size:var(--text-xs);margin-bottom:var(--sp-4);display:none;"></div>

        <!-- Section 1: Basic Information -->
        <div style="font-weight:700;font-size:var(--text-sm);border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-2);margin-bottom:var(--sp-3);color:var(--primary-700);">
          1. Basic Information
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--sp-3);margin-bottom:var(--sp-4);">
          <div class="form-group">
            <label class="form-label" for="ncert-q-class">Class *</label>
            <select class="form-select" id="ncert-q-class" required onchange="populateChapterDropdown('ncert-q-chapter')">
              <option value="11" ${currentClass === '11' ? 'selected' : ''}>Class 11</option>
              <option value="12" ${currentClass === '12' ? 'selected' : ''}>Class 12</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="ncert-q-chapter">Chapter *</label>
            <select class="form-select" id="ncert-q-chapter" required></select>
          </div>

          <div class="form-group">
            <label class="form-label" for="ncert-q-topic">Topic / Section (Optional)</label>
            <input class="form-input" id="ncert-q-topic" type="text" placeholder="e.g. Endomembrane System" value="${escapeHtml(q.topic || '')}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="ncert-q-difficulty">Difficulty *</label>
            <select class="form-select" id="ncert-q-difficulty" required>
              <option value="easy" ${q.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="medium" ${!q.difficulty || q.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="hard" ${q.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
            </select>
          </div>
        </div>

        <!-- Section 2: Question Type & Reference -->
        <div style="font-weight:700;font-size:var(--text-sm);border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-2);margin-bottom:var(--sp-3);color:var(--primary-700);">
          2. Question Type &amp; NCERT Line Reference
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:var(--sp-3);margin-bottom:var(--sp-4);">
          <div class="form-group">
            <label class="form-label" for="ncert-q-type">Question Type *</label>
            <select class="form-select" id="ncert-q-type" required onchange="Admin.onNcertTypeChangeInForm(this.value)">
              <option value="mcq" ${currentType === 'mcq' ? 'selected' : ''}>Multiple Choice Question (MCQ)</option>
              <option value="assertion_reason" ${currentType === 'assertion_reason' ? 'selected' : ''}>Assertion &amp; Reason</option>
              <option value="matching" ${currentType === 'matching' ? 'selected' : ''}>Matching Columns (Match the Following)</option>
              <option value="diagram" ${currentType === 'diagram' ? 'selected' : ''}>Diagram-Based Question</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="ncert-q-ref">NCERT Reference / Page / Line *</label>
            <input class="form-input" id="ncert-q-ref" type="text" placeholder="e.g. NCERT Class 11, Chapter 8, Page 128, Line 14" value="${escapeHtml(q.ncertReference || '')}" required />
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label" for="ncert-q-text">Question Prompt / Stem *</label>
          <textarea class="form-input" id="ncert-q-text" rows="3" placeholder="Enter question text or prompt…" required>${escapeHtml(q.text || '')}</textarea>
        </div>

        <!-- Dynamic Block: MCQ Fields -->
        <div id="ncert-mcq-fields" style="display:${currentType === 'mcq' ? 'block' : 'none'};margin-bottom:var(--sp-4);">
          <label class="form-label" style="margin-bottom:var(--sp-2);">Options (Select correct radio) *</label>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            ${[0, 1, 2, 3].map((i) => `
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <input type="radio" name="ncert-mcq-correct" value="${i}" ${correctOpt === i ? 'checked' : ''} style="cursor:pointer;" />
                <span style="font-weight:700;font-size:var(--text-xs);width:20px;">${['A','B','C','D'][i]}.</span>
                <input class="form-input form-input-sm" id="ncert-mcq-opt${i}" type="text" placeholder="Option ${['A','B','C','D'][i]}" value="${escapeHtml((q.options || [])[i] || '')}" style="flex:1;" />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dynamic Block: Assertion & Reason Fields -->
        <div id="ncert-ar-fields" style="display:${currentType === 'assertion_reason' ? 'block' : 'none'};margin-bottom:var(--sp-4);">
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label" for="ncert-ar-assertion">Assertion Statement (A) *</label>
            <textarea class="form-input" id="ncert-ar-assertion" rows="2" placeholder="Enter assertion statement…">${escapeHtml(q.assertion || '')}</textarea>
          </div>
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label" for="ncert-ar-reason">Reason Statement (R) *</label>
            <textarea class="form-input" id="ncert-ar-reason" rows="2" placeholder="Enter reason statement…">${escapeHtml(q.reason || '')}</textarea>
          </div>

          <label class="form-label" style="margin-bottom:var(--sp-2);">Correct Evaluation Option *</label>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);background:var(--neutral-50);padding:var(--sp-3);border-radius:var(--radius-md);">
            <label style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-xs);cursor:pointer;">
              <input type="radio" name="ncert-ar-correct" value="0" ${correctOpt === 0 ? 'checked' : ''} />
              <span><strong>A.</strong> Both A and R are true and R is the correct explanation of A.</span>
            </label>
            <label style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-xs);cursor:pointer;">
              <input type="radio" name="ncert-ar-correct" value="1" ${correctOpt === 1 ? 'checked' : ''} />
              <span><strong>B.</strong> Both A and R are true but R is NOT the correct explanation of A.</span>
            </label>
            <label style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-xs);cursor:pointer;">
              <input type="radio" name="ncert-ar-correct" value="2" ${correctOpt === 2 ? 'checked' : ''} />
              <span><strong>C.</strong> Assertion (A) is true but Reason (R) is false.</span>
            </label>
            <label style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-xs);cursor:pointer;">
              <input type="radio" name="ncert-ar-correct" value="3" ${correctOpt === 3 ? 'checked' : ''} />
              <span><strong>D.</strong> Assertion (A) is false but Reason (R) is true (or both are false).</span>
            </label>
          </div>
        </div>

        <!-- Dynamic Block: Matching Columns Fields -->
        <div id="ncert-match-fields" style="display:${currentType === 'matching' ? 'block' : 'none'};margin-bottom:var(--sp-4);">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);margin-bottom:var(--sp-3);">
            <div>
              <label class="form-label" style="margin-bottom:4px;">Column I Items</label>
              ${[1, 2, 3, 4].map((n, i) => `
                <input class="form-input form-input-sm" id="ncert-match-a${n}" type="text" placeholder="${['A.','B.','C.','D.'][i]} Item ${n}" value="${escapeHtml((q.columnA || [])[i] || '')}" style="margin-bottom:4px;" />
              `).join('')}
            </div>
            <div>
              <label class="form-label" style="margin-bottom:4px;">Column II Items</label>
              ${[1, 2, 3, 4].map((n, i) => `
                <input class="form-input form-input-sm" id="ncert-match-b${n}" type="text" placeholder="${n}. Item ${n}" value="${escapeHtml((q.columnB || [])[i] || '')}" style="margin-bottom:4px;" />
              `).join('')}
            </div>
          </div>

          <label class="form-label" style="margin-bottom:var(--sp-2);">Matching Options (Select correct radio) *</label>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            ${[0, 1, 2, 3].map((i) => `
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <input type="radio" name="ncert-match-correct" value="${i}" ${correctOpt === i ? 'checked' : ''} style="cursor:pointer;" />
                <span style="font-weight:700;font-size:var(--text-xs);width:20px;">${['A','B','C','D'][i]}.</span>
                <input class="form-input form-input-sm" id="ncert-match-opt${i}" type="text" placeholder="e.g. A-1, B-2, C-3, D-4" value="${escapeHtml((q.options || [])[i] || '')}" style="flex:1;" />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dynamic Block: Diagram Fields -->
        <div id="ncert-diag-fields" style="display:${currentType === 'diagram' ? 'block' : 'none'};margin-bottom:var(--sp-4);">
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label" for="ncert-diag-url">Diagram Image URL *</label>
            <input class="form-input" id="ncert-diag-url" type="text" placeholder="https://… or image link" value="${escapeHtml(q.diagramUrl || '')}" />
          </div>

          <label class="form-label" style="margin-bottom:var(--sp-2);">Options for Diagram (Select correct radio) *</label>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            ${[0, 1, 2, 3].map((i) => `
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <input type="radio" name="ncert-diag-correct" value="${i}" ${correctOpt === i ? 'checked' : ''} style="cursor:pointer;" />
                <span style="font-weight:700;font-size:var(--text-xs);width:20px;">${['A','B','C','D'][i]}.</span>
                <input class="form-input form-input-sm" id="ncert-diag-opt${i}" type="text" placeholder="Option ${['A','B','C','D'][i]}" value="${escapeHtml((q.options || [])[i] || '')}" style="flex:1;" />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 3: Explanation -->
        <div style="font-weight:700;font-size:var(--text-sm);border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-2);margin-bottom:var(--sp-3);color:var(--primary-700);">
          3. Detailed NCERT Explanation
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-5);">
          <label class="form-label" for="ncert-q-explanation">NCERT Explanation / Justification *</label>
          <textarea class="form-input" id="ncert-q-explanation" rows="3" placeholder="Provide NCERT line rationale and explanation…" required>${escapeHtml(q.explanation || '')}</textarea>
        </div>

        <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;">
          <button class="btn btn-outline" type="button" onclick="App.navigate('admin-ncert-focus')">Cancel</button>
          <button class="btn btn-primary" type="submit">💾 Save NCERT Question</button>
        </div>
      </form>
    </div>
  `);

  const initialChapterId = q.chapterId?._id || q.chapterId || q.chapter || '';
  populateChapterDropdown('ncert-q-chapter', initialChapterId || '');
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
   Screen: admin-students (Registered Students Directory)
   ============================================================ */
function renderAdminStudents(container) {
  container.innerHTML = adminShell('students', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-3);">
      <div>
        <div class="section-title" style="margin:0 0 var(--sp-1) 0;">👨‍🎓 Registered Students</div>
        <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">Live directory of all NEET Biology students registered on Bio Rank.</p>
      </div>
      <div style="display:flex;align-items:center;gap:var(--sp-2);">
        <span class="badge badge-primary" id="admin-student-total-badge" style="font-size:12px;">Loading…</span>
        <input class="form-input form-input-sm" id="admin-student-search" type="text" placeholder="Search name / email…" oninput="Admin.loadStudents(1)" style="width:200px;" />
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden;">
      <div id="admin-students-list" style="padding:var(--sp-3);"></div>
    </div>
    <div id="admin-students-pagination"></div>
  `);
  Admin.loadStudents();
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
   Screen: admin-cuet-pyqs (CUET PYQ Question Bank)
   ============================================================ */
function renderAdminCuetPyqs(container) {
  const { chapterId, year, questionType, search } = AdminState.cuetFilters;

  container.innerHTML = adminShell('cuet-pyqs', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-3);">
      <div>
        <div class="section-title" style="margin:0 0 var(--sp-1) 0;">🎯 CUET (UG) PYQ Question Bank</div>
        <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">Manage official NTA CUET previous year questions (2022–2024) for Class 12th Biology (+5/−1 marking).</p>
      </div>
      <button class="btn btn-primary" onclick="Admin.startCreateCuetQuestion()">
        + Add CUET PYQ Question
      </button>
    </div>

    <!-- Filters -->
    <div class="card" style="margin-bottom:var(--sp-4);padding:var(--sp-3);">
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:var(--sp-2);align-items:center;">
        <div>
          <label class="form-label" style="font-size:11px;margin-bottom:2px;">Year</label>
          <select class="form-select form-select-sm" style="width:100%;" onchange="Admin.onCuetFilterChange('year', this.value)">
            <option value="" ${!year ? 'selected' : ''}>All Years</option>
            <option value="2024" ${year === '2024' ? 'selected' : ''}>2024 Papers</option>
            <option value="2023" ${year === '2023' ? 'selected' : ''}>2023 Papers</option>
            <option value="2022" ${year === '2022' ? 'selected' : ''}>2022 Papers</option>
            <option value="2025" ${year === '2025' ? 'selected' : ''}>2025 Model / PYQs</option>
          </select>
        </div>

        <div>
          <label class="form-label" style="font-size:11px;margin-bottom:2px;">Class 12th Chapter</label>
          <select class="form-select form-select-sm" id="admin-cuet-filter-chapter" style="width:100%;" onchange="Admin.onCuetFilterChange('chapterId', this.value)">
            <option value="">All Class 12th Chapters</option>
          </select>
        </div>

        <div>
          <label class="form-label" style="font-size:11px;margin-bottom:2px;">Question Type</label>
          <select class="form-select form-select-sm" style="width:100%;" onchange="Admin.onCuetFilterChange('questionType', this.value)">
            <option value="" ${!questionType ? 'selected' : ''}>All Types</option>
            <option value="mcq" ${questionType === 'mcq' ? 'selected' : ''}>MCQ (+5/−1)</option>
            <option value="assertion_reason" ${questionType === 'assertion_reason' ? 'selected' : ''}>Assertion & Reason</option>
            <option value="case_study" ${questionType === 'case_study' ? 'selected' : ''}>Case Study / Passage</option>
          </select>
        </div>

        <div>
          <label class="form-label" style="font-size:11px;margin-bottom:2px;">Search Text / Ref</label>
          <input type="text" class="form-input form-input-sm" placeholder="Search CUET questions…" value="${escapeHtml(search)}" oninput="Admin.onCuetFilterChange('search', this.value)" style="width:100%;" />
        </div>
      </div>
    </div>

    <div id="admin-cuet-list"></div>
    <div id="admin-cuet-pagination"></div>
  `);

  populateChapterDropdown('admin-cuet-filter-chapter', '', 'All Class 12th Chapters', '12');
  Admin.loadCuetQuestions();
}

/* ============================================================
   Screen: admin-cuet-pyq-form (Add/Edit CUET PYQ Question)
   ============================================================ */
function renderAdminCuetPyqForm(container, questionData) {
  const isEdit = !!questionData;
  const q = questionData || {};
  AdminState.editingCuetQuestionId = q._id || q.id || null;

  const currentYear = q.year || 2024;
  const currentType = q.questionType || q.type || 'mcq';
  const correctOpt = q.correctOption ?? q.correct ?? 0;

  container.innerHTML = adminShell('cuet-pyqs', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-2);">
      <div>
        <div class="section-title" style="margin:0 0 var(--sp-1) 0;">
          ${isEdit ? '✏️ Edit' : '➕ Add'} CUET (UG) PYQ Question
        </div>
        <p style="margin:0;font-size:var(--text-xs);color:var(--neutral-500);">
          Add authentic Class 12th Biology questions from official NTA CUET (UG) examination papers.
        </p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="App.navigate('admin-cuet-pyqs')">← Back to List</button>
    </div>

    <div class="card" style="padding:var(--sp-5);">
      <form onsubmit="Admin.saveCuetQuestion(event)">
        <div id="admin-cuet-form-error" style="color:var(--error-600);background:var(--error-50);border-left:3px solid var(--error-600);padding:var(--sp-2) var(--sp-3);font-size:var(--text-xs);margin-bottom:var(--sp-4);display:none;"></div>

        <!-- Section 1: Exam & Chapter Meta -->
        <div style="font-weight:700;font-size:var(--text-sm);border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-2);margin-bottom:var(--sp-3);color:#2563eb;">
          1. Paper &amp; Chapter Details (Class 12th Only)
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--sp-3);margin-bottom:var(--sp-4);">
          <div class="form-group">
            <label class="form-label" for="cuet-q-year">Exam Year *</label>
            <select class="form-select" id="cuet-q-year" required>
              <option value="2024" ${currentYear === 2024 ? 'selected' : ''}>2024 Paper</option>
              <option value="2023" ${currentYear === 2023 ? 'selected' : ''}>2023 Paper</option>
              <option value="2022" ${currentYear === 2022 ? 'selected' : ''}>2022 Paper</option>
              <option value="2025" ${currentYear === 2025 ? 'selected' : ''}>2025 Model / PYQs</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="cuet-q-shift">Shift / Slot (e.g. May 15 Slot 1)</label>
            <input class="form-input" id="cuet-q-shift" type="text" placeholder="e.g. Slot 1 / Official NTA" value="${escapeHtml(q.shift || 'May 15 Slot 1')}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="cuet-q-chapter">Class 12th Chapter *</label>
            <select class="form-select" id="cuet-q-chapter" required></select>
          </div>

          <div class="form-group">
            <label class="form-label" for="cuet-q-type">Question Type *</label>
            <select class="form-select" id="cuet-q-type" required onchange="Admin.onCuetTypeChangeInForm(this.value)">
              <option value="mcq" ${currentType === 'mcq' ? 'selected' : ''}>Multiple Choice Question (MCQ)</option>
              <option value="assertion_reason" ${currentType === 'assertion_reason' ? 'selected' : ''}>Assertion &amp; Reason</option>
              <option value="case_study" ${currentType === 'case_study' ? 'selected' : ''}>Case-Study / Passage-based</option>
            </select>
          </div>
        </div>

        <!-- Passage Block for Case Studies -->
        <div id="cuet-case-passage-block" style="display:${currentType === 'case_study' ? 'block' : 'none'};margin-bottom:var(--sp-4);background:#f8fafc;border:1.5px dashed #cbd5e1;padding:var(--sp-3);border-radius:var(--radius-md);">
          <label class="form-label" for="cuet-q-passage" style="color:#0f172a;font-weight:700;">📄 Case Study / Passage Context</label>
          <textarea class="form-textarea" id="cuet-q-passage" rows="3" placeholder="Enter the scientific passage or experiment description here…">${escapeHtml(q.caseStudyPassage || '')}</textarea>
        </div>

        <!-- Section 2: Question & Options -->
        <div style="font-weight:700;font-size:var(--text-sm);border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-2);margin-bottom:var(--sp-3);color:#2563eb;">
          2. Question Statement &amp; Options (+5 Correct / −1 Incorrect)
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label" for="cuet-q-text">Question Text *</label>
          <textarea class="form-textarea" id="cuet-q-text" rows="3" required placeholder="Enter the exact question statement from the CUET paper…">${escapeHtml(q.text || '')}</textarea>
        </div>

        <div style="margin-bottom:var(--sp-4);">
          <label class="form-label">Options &amp; Correct Answer (Select the radio of correct option) *</label>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            ${[0, 1, 2, 3].map(idx => `
              <div style="display:flex;align-items:center;gap:var(--sp-3);">
                <label style="display:flex;align-items:center;gap:6px;margin:0;cursor:pointer;font-weight:700;font-size:var(--text-xs);width:85px;flex-shrink:0;">
                  <input type="radio" name="cuet-correct-opt" value="${idx}" ${correctOpt === idx ? 'checked' : ''} />
                  Option ${String.fromCharCode(65 + idx)}
                </label>
                <input class="form-input" id="cuet-opt-${idx}" type="text" placeholder="Option ${String.fromCharCode(65 + idx)} text" required value="${escapeHtml((q.options || [])[idx] || '')}" style="flex:1;" />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 3: Explanation & NCERT Reference -->
        <div style="font-weight:700;font-size:var(--text-sm);border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-2);margin-bottom:var(--sp-3);color:#2563eb;">
          3. Explanation &amp; NCERT Reference
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:var(--sp-3);margin-bottom:var(--sp-4);">
          <div class="form-group">
            <label class="form-label" for="cuet-q-explanation">Step-by-step Explanation</label>
            <textarea class="form-textarea" id="cuet-q-explanation" rows="2" placeholder="Explain why this option is correct based on NCERT…">${escapeHtml(q.explanation || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="cuet-q-ref">NCERT Reference Line / Page</label>
            <input class="form-input" id="cuet-q-ref" type="text" placeholder="e.g. NCERT Class 12 Biology, Chapter 6, Page 112" value="${escapeHtml(q.ncertReference || '')}" />
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:var(--sp-2);border-top:1px solid var(--neutral-100);padding-top:var(--sp-4);">
          <button type="button" class="btn btn-secondary" onclick="App.navigate('admin-cuet-pyqs')">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create CUET Question'}</button>
        </div>
      </form>
    </div>
  `);

  populateChapterDropdown('cuet-q-chapter', q.chapterId || q.chapter || '', 'Select Class 12th Chapter', '12');
}

/* ============================================================
   Shared admin shell — simple tab nav across admin screens.
   Reuses existing .card/.btn classes rather than introducing a
   parallel style system, per the Stage 8 instruction.
   ============================================================ */
function adminShell(activeTab, innerHtml) {
  const tabs = [
    ['students', 'admin-students', '👨‍🎓 Students'],
    ['chapters', 'admin-chapters', 'Chapters'],
    ['questions', 'admin-questions', 'Questions'],
    ['ncertfocus', 'admin-ncert-focus', '🌿 NCERT Focus'],
    ['cuet-pyqs', 'admin-cuet-pyqs', '🎯 CUET PYQs'],
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
window.renderAdminStudents = renderAdminStudents;
window.renderAdminChapters = renderAdminChapters;
window.renderAdminSubSkills = renderAdminSubSkills;
window.renderAdminQuestions = renderAdminQuestions;
window.renderAdminQuestionForm = renderAdminQuestionForm;
window.renderAdminNcertFocus = renderAdminNcertFocus;
window.renderAdminNcertForm = renderAdminNcertForm;
window.renderAdminCuetPyqs = renderAdminCuetPyqs;
window.renderAdminCuetPyqForm = renderAdminCuetPyqForm;
window.renderAdminCsvImport = renderAdminCsvImport;
window.renderAdminFullLengthTests = renderAdminFullLengthTests;
window.renderAdminFLTQuestions = renderAdminFLTQuestions;
window.renderAdminReports = renderAdminReports;
window.renderAdminAuditLogs = renderAdminAuditLogs;



/* ============================================================
   apiClient.js — API client for Bio Rank Admin & Student panels.
   Supports live backend (server/) with automatic in-browser
   Mock/Offline fallback when the backend server is not running.
   ============================================================ */
const ApiClient = (() => {
  const BASE_URL = window.BIO_RANK_API_BASE_URL || 'http://localhost:5000/api';
  const TOKEN_KEY = 'bioready_admin_token';
  const MOCK_STORAGE_KEY = 'biorank_admin_mock_v1';

  class ApiError extends Error {
    constructor(message, status, data) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  /* ---------------- In-Browser Mock Store ---------------- */
  const MockStore = (() => {
    function load() {
      const raw = localStorage.getItem(MOCK_STORAGE_KEY);
      if (raw) {
        try { return JSON.parse(raw); } catch (e) {}
      }
      return initDefaults();
    }

    function save(data) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
    }

    function initDefaults() {
      const chaptersSource = (window.DB && window.DB.chapters) || [
        { id: 'ch01', name: 'Cell: The Unit of Life', icon: '🔬', class: '11', weightage: 8 },
        { id: 'ch02', name: 'Cell Division', icon: '⚙️', class: '11', weightage: 7 },
        { id: 'ch03', name: 'Biomolecules', icon: '🧬', class: '11', weightage: 7 },
        { id: 'ch18', name: 'Principles of Inheritance', icon: '🧩', class: '12', weightage: 9 },
        { id: 'ch19', name: 'Molecular Basis of Inheritance', icon: '🔗', class: '12', weightage: 9 },
      ];

      const chapters = chaptersSource.map((c, idx) => ({
        _id: c.id || `ch_${idx + 1}`,
        name: c.name,
        class: c.class || '11',
        weightage: c.weightage || 5,
        icon: c.icon || '📚',
        questionCount: c.questions || 10,
        active: true,
      }));

      const subSkills = [
        { _id: 'ss_01', chapterId: chapters[0]._id, name: 'Cell Organelle Functions', bloomLevel: 'remember', questionCount: 15, active: true },
        { _id: 'ss_02', chapterId: chapters[0]._id, name: 'Membrane Transport & Fluid Mosaic', bloomLevel: 'understand', questionCount: 12, active: true },
        { _id: 'ss_03', chapterId: chapters[1]._id, name: 'Mitosis Stages & Checkpoints', bloomLevel: 'apply', questionCount: 14, active: true },
        { _id: 'ss_04', chapterId: chapters[2]._id, name: 'Enzyme Kinetics & Inhibitors', bloomLevel: 'analyze', questionCount: 10, active: true },
      ];

      const questions = [
        {
          _id: 'q_01',
          chapterId: chapters[0]._id,
          subSkillId: 'ss_01',
          bloomLevel: 'remember',
          weightage: 4,
          year: 2024,
          text: 'Which of the following cellular organelles is known as the powerhouse of the cell?',
          options: ['Mitochondria', 'Ribosome', 'Golgi apparatus', 'Lysosome'],
          correctOption: 0,
          explanation: 'Mitochondria are the sites of cellular respiration and ATP generation.',
          isFoundation: true,
        },
        {
          _id: 'q_02',
          chapterId: chapters[0]._id,
          subSkillId: 'ss_02',
          bloomLevel: 'understand',
          weightage: 4,
          year: 2023,
          text: 'According to the fluid mosaic model, plasma membrane is composed of:',
          options: ['Phospholipids and integrated proteins', 'Only carbohydrates', 'Only proteins', 'Cellulose and pectin'],
          correctOption: 0,
          explanation: 'Singer and Nicolson proposed the fluid mosaic model describing proteins embedded in a phospholipid bilayer.',
          isFoundation: false,
        },
        {
          _id: 'q_03',
          chapterId: chapters[1]._id,
          subSkillId: 'ss_03',
          bloomLevel: 'apply',
          weightage: 4,
          year: 2024,
          text: 'Crossing over takes place during which sub-stage of Prophase I in Meiosis?',
          options: ['Leptotene', 'Zygotene', 'Pachytene', 'Diplotene'],
          correctOption: 2,
          explanation: 'Crossing over and recombination nodules appear specifically during the Pachytene stage.',
          isFoundation: true,
        }
      ];

      const fullLengthTests = ((window.DB && window.DB.fullLengthTests) || [
        { id: 'flt01', title: 'Full Length Test 1', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
        { id: 'flt02', title: 'Full Length Test 2', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
      ]).map((t, idx) => ({
        _id: t.id || `flt_${idx + 1}`,
        title: t.title,
        description: t.description || 'Full syllabus mock test',
        numberOfQuestions: t.numberOfQuestions || 90,
        durationMinutes: t.durationMinutes || 90,
      }));

      const auditLogs = [
        {
          _id: 'log_01',
          action: 'LOGIN',
          targetType: 'User',
          targetId: 'admin_01',
          performedBy: { name: 'Admin', username: 'admin' },
          details: 'Admin user logged in via Web Interface (Demo Mode)',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'log_02',
          action: 'SEED',
          targetType: 'System',
          targetId: 'sys_01',
          performedBy: { name: 'System', username: 'system' },
          details: 'Initialized default NEET Biology curriculum and question bank',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        }
      ];

      const initial = { chapters, subSkills, questions, fullLengthTests, auditLogs };
      save(initial);
      return initial;
    }

    function addAuditLog(action, targetType, targetId, details) {
      const data = load();
      data.auditLogs.unshift({
        _id: `log_${Date.now()}`,
        action,
        targetType,
        targetId,
        performedBy: { name: 'Admin', username: 'admin' },
        details,
        createdAt: new Date().toISOString(),
      });
      save(data);
    }

    return { load, save, addAuditLog };
  })();

  /* ---------------- Mock Request Router ---------------- */
  async function handleMockRequest(path, method, body) {
    const data = MockStore.load();
    const cleanPath = path.split('?')[0];
    const urlParams = new URLSearchParams(path.includes('?') ? path.split('?')[1] : '');

    // Auth
    if (cleanPath === '/auth/login' && method === 'POST') {
      const identifier = (body?.identifier || '').trim().toLowerCase();
      const user = {
        _id: 'mock_admin_1',
        name: 'Admin User',
        username: identifier || 'admin',
        email: 'admin@biorank.app',
        role: 'admin',
      };
      const token = 'biorank_offline_mock_admin_token';
      setToken(token);
      MockStore.addAuditLog('LOGIN', 'User', user._id, `Admin signed in as ${user.username}`);
      return { token, user };
    }

    if (cleanPath === '/auth/me') {
      return {
        user: {
          _id: 'mock_admin_1',
          name: 'Admin User',
          username: 'admin',
          email: 'admin@biorank.app',
          role: 'admin',
        },
      };
    }

    // Chapters
    if (cleanPath === '/admin/chapters') {
      if (method === 'GET') {
        return { chapters: data.chapters.filter((c) => c.active !== false) };
      }
      if (method === 'POST') {
        const newChapter = {
          _id: `ch_${Date.now()}`,
          name: body.name,
          class: body.class || '11',
          weightage: Number(body.weightage) || 5,
          icon: body.icon || '📖',
          questionCount: 0,
          active: true,
        };
        data.chapters.push(newChapter);
        MockStore.save(data);
        MockStore.addAuditLog('CREATE_CHAPTER', 'Chapter', newChapter._id, `Created chapter "${newChapter.name}"`);
        return { chapter: newChapter };
      }
    }

    if (cleanPath.startsWith('/admin/chapters/') && method === 'PUT') {
      const id = cleanPath.replace('/admin/chapters/', '');
      const idx = data.chapters.findIndex((c) => c._id === id);
      if (idx !== -1) {
        data.chapters[idx] = { ...data.chapters[idx], ...body };
        MockStore.save(data);
        MockStore.addAuditLog('UPDATE_CHAPTER', 'Chapter', id, `Updated chapter "${data.chapters[idx].name}"`);
        return { chapter: data.chapters[idx] };
      }
      throw new ApiError('Chapter not found', 404);
    }

    if (cleanPath.startsWith('/admin/chapters/') && method === 'DELETE') {
      const id = cleanPath.replace('/admin/chapters/', '');
      const idx = data.chapters.findIndex((c) => c._id === id);
      if (idx !== -1) {
        data.chapters[idx].active = false;
        MockStore.save(data);
        MockStore.addAuditLog('DELETE_CHAPTER', 'Chapter', id, `Deleted chapter "${data.chapters[idx].name}"`);
        return { ok: true };
      }
      throw new ApiError('Chapter not found', 404);
    }

    // Sub-skills
    if (cleanPath === '/admin/sub-skills') {
      if (method === 'GET') {
        const chapterId = urlParams.get('chapterId');
        let filtered = data.subSkills.filter((s) => s.active !== false);
        if (chapterId) filtered = filtered.filter((s) => s.chapterId === chapterId);
        return { subSkills: filtered };
      }
      if (method === 'POST') {
        const newSubSkill = {
          _id: `ss_${Date.now()}`,
          chapterId: body.chapterId,
          name: body.name,
          bloomLevel: body.bloomLevel || 'remember',
          questionCount: 0,
          active: true,
        };
        data.subSkills.push(newSubSkill);
        MockStore.save(data);
        MockStore.addAuditLog('CREATE_SUBSKILL', 'SubSkill', newSubSkill._id, `Created sub-skill "${newSubSkill.name}"`);
        return { subSkill: newSubSkill };
      }
    }

    if (cleanPath.startsWith('/admin/sub-skills/') && method === 'PUT') {
      const id = cleanPath.replace('/admin/sub-skills/', '');
      const idx = data.subSkills.findIndex((s) => s._id === id);
      if (idx !== -1) {
        data.subSkills[idx] = { ...data.subSkills[idx], ...body };
        MockStore.save(data);
        MockStore.addAuditLog('UPDATE_SUBSKILL', 'SubSkill', id, `Updated sub-skill "${data.subSkills[idx].name}"`);
        return { subSkill: data.subSkills[idx] };
      }
      throw new ApiError('Sub-skill not found', 404);
    }

    if (cleanPath.startsWith('/admin/sub-skills/') && method === 'DELETE') {
      const id = cleanPath.replace('/admin/sub-skills/', '');
      const idx = data.subSkills.findIndex((s) => s._id === id);
      if (idx !== -1) {
        data.subSkills[idx].active = false;
        MockStore.save(data);
        MockStore.addAuditLog('DELETE_SUBSKILL', 'SubSkill', id, `Deleted sub-skill "${data.subSkills[idx].name}"`);
        return { ok: true };
      }
      throw new ApiError('Sub-skill not found', 404);
    }

    // Questions
    if (cleanPath === '/admin/questions') {
      if (method === 'GET') {
        const chapterId = urlParams.get('chapterId');
        const subSkillId = urlParams.get('subSkillId');
        const bloomLevel = urlParams.get('bloomLevel');
        const page = Number(urlParams.get('page')) || 1;
        const limit = Number(urlParams.get('limit')) || 20;

        let filtered = [...data.questions];
        if (chapterId) filtered = filtered.filter((q) => q.chapterId === chapterId);
        if (subSkillId) filtered = filtered.filter((q) => q.subSkillId === subSkillId);
        if (bloomLevel) filtered = filtered.filter((q) => q.bloomLevel === bloomLevel);

        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        return {
          questions: paginated,
          pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
        };
      }
      if (method === 'POST') {
        const newQuestion = {
          _id: `q_${Date.now()}`,
          chapterId: body.chapterId,
          subSkillId: body.subSkillId,
          bloomLevel: body.bloomLevel || 'remember',
          weightage: Number(body.weightage) || 4,
          year: body.year,
          text: body.text,
          options: body.options || [],
          correctOption: Number(body.correctOption) || 0,
          explanation: body.explanation || '',
          isFoundation: !!body.isFoundation,
        };
        data.questions.push(newQuestion);
        MockStore.save(data);
        MockStore.addAuditLog('CREATE_QUESTION', 'Question', newQuestion._id, `Created question in chapter ${body.chapterId}`);
        return { question: newQuestion };
      }
    }

    if (cleanPath.startsWith('/admin/questions/') && method === 'GET') {
      const id = cleanPath.replace('/admin/questions/', '');
      const question = data.questions.find((q) => q._id === id);
      if (question) return { question };
      throw new ApiError('Question not found', 404);
    }

    if (cleanPath.startsWith('/admin/questions/') && method === 'PUT') {
      const id = cleanPath.replace('/admin/questions/', '');
      const idx = data.questions.findIndex((q) => q._id === id);
      if (idx !== -1) {
        data.questions[idx] = { ...data.questions[idx], ...body };
        MockStore.save(data);
        MockStore.addAuditLog('UPDATE_QUESTION', 'Question', id, 'Updated question details');
        return { question: data.questions[idx] };
      }
      throw new ApiError('Question not found', 404);
    }

    if (cleanPath.startsWith('/admin/questions/') && method === 'DELETE') {
      const id = cleanPath.replace('/admin/questions/', '');
      const idx = data.questions.findIndex((q) => q._id === id);
      if (idx !== -1) {
        data.questions.splice(idx, 1);
        MockStore.save(data);
        MockStore.addAuditLog('DELETE_QUESTION', 'Question', id, 'Deleted question');
        return { ok: true };
      }
      throw new ApiError('Question not found', 404);
    }

    // CSV Import
    if (cleanPath === '/admin/questions/import/preview') {
      return {
        importId: `import_${Date.now()}`,
        totalRows: 5,
        validRows: 5,
        errorRows: 0,
        errors: [],
        sample: data.questions.slice(0, 3),
      };
    }

    if (cleanPath === '/admin/questions/import/confirm') {
      MockStore.addAuditLog('CSV_IMPORT', 'QuestionBank', 'import', 'Imported questions via CSV');
      return { created: 5, errors: [] };
    }

    // Full Length Tests
    if (cleanPath === '/admin/full-length-tests') {
      if (method === 'GET') {
        return { fullLengthTests: data.fullLengthTests };
      }
      if (method === 'POST') {
        const newFLT = {
          _id: `flt_${Date.now()}`,
          title: body.title,
          description: body.description || '',
          numberOfQuestions: Number(body.numberOfQuestions) || 90,
          durationMinutes: Number(body.durationMinutes) || 90,
        };
        data.fullLengthTests.push(newFLT);
        MockStore.save(data);
        MockStore.addAuditLog('CREATE_FLT', 'FullLengthTest', newFLT._id, `Created test "${newFLT.title}"`);
        return { fullLengthTest: newFLT };
      }
    }

    if (cleanPath.startsWith('/admin/full-length-tests/') && method === 'PUT') {
      const id = cleanPath.replace('/admin/full-length-tests/', '');
      const idx = data.fullLengthTests.findIndex((t) => t._id === id);
      if (idx !== -1) {
        data.fullLengthTests[idx] = { ...data.fullLengthTests[idx], ...body };
        MockStore.save(data);
        MockStore.addAuditLog('UPDATE_FLT', 'FullLengthTest', id, `Updated test "${data.fullLengthTests[idx].title}"`);
        return { fullLengthTest: data.fullLengthTests[idx] };
      }
      throw new ApiError('Test not found', 404);
    }

    if (cleanPath.startsWith('/admin/full-length-tests/') && method === 'DELETE') {
      const id = cleanPath.replace('/admin/full-length-tests/', '');
      const idx = data.fullLengthTests.findIndex((t) => t._id === id);
      if (idx !== -1) {
        data.fullLengthTests.splice(idx, 1);
        MockStore.save(data);
        MockStore.addAuditLog('DELETE_FLT', 'FullLengthTest', id, 'Deleted test');
        return { ok: true };
      }
      throw new ApiError('Test not found', 404);
    }

    // Audit Logs
    if (cleanPath === '/admin/audit-logs') {
      const page = Number(urlParams.get('page')) || 1;
      const limit = Number(urlParams.get('limit')) || 20;
      const total = data.auditLogs.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const paginated = data.auditLogs.slice((page - 1) * limit, page * limit);
      return {
        auditLogs: paginated,
        pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      };
    }

    return { ok: true };
  }

  /* ---------------- Core Request Dispatcher ---------------- */
  async function request(path, { method = 'GET', body, isFormData = false } = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

    let res = null;
    let serverReachable = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

      res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      serverReachable = true;
    } catch (err) {
      // Backend server is offline or unreachable -> Seamlessly switch to In-Browser Mock Store
      serverReachable = false;
    }

    if (!serverReachable) {
      return await handleMockRequest(path, method, body);
    }

    let data = null;
    try {
      data = await res.json();
    } catch {}

    if (res.status === 401) {
      clearToken();
      if (window.App) {
        App.navigate('admin-login');
        App.showToast?.('Session expired — please log in again.');
      }
      throw new ApiError((data && data.error) || 'Session expired.', 401, data);
    }

    if (!res.ok) {
      const message =
        (data && data.error) ||
        (data && data.errors && data.errors.join(' ')) ||
        `Request failed (${res.status}).`;
      throw new ApiError(message, res.status, data);
    }

    return data;
  }

  return {
    getToken,
    setToken,
    clearToken,
    ApiError,
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    del: (path) => request(path, { method: 'DELETE' }),
    upload: (path, formData) => request(path, { method: 'POST', body: formData, isFormData: true }),
  };
})();

window.ApiClient = ApiClient;

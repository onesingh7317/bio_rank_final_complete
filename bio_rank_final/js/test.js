/* ============================================================
   test.js — Shared Test Engine for Bio Rank
   Handles all test modes: PYQ, Chapter, Improvement, Micro-retest, Spaced
   ============================================================ */

const TestEngine = (() => {

  const SESSION_KEY = 'biorank_active_test_session';

  let state = {
    questions: [],
    current: 0,
    answers: {},       // { questionIndex: optionIndex }
    flagged: new Set(),
    startTime: null,
    timerInterval: null,
    secondsElapsed: 0,
    mode: 'chapter',   // 'pyq' | 'chapter' | 'micro' | 'spaced' | 'foundation' | 'fulllength' | 'custom' | 'ncert-focus'
    meta: {},          // { year, shift, chapterId, subSkillId, ... }
    onComplete: null,
  };

  /* ---- Session Storage Persistence ---- */
  function saveSession() {
    try {
      if (!state.questions || state.questions.length === 0) return;
      const snapshot = {
        questions: state.questions,
        current: state.current,
        answers: state.answers,
        flagged: Array.from(state.flagged || []),
        startTime: state.startTime,
        secondsElapsed: state.secondsElapsed,
        mode: state.mode,
        meta: state.meta,
        lastSaved: Date.now(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Could not save test session to sessionStorage:', e);
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  function hasActiveSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!(parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0);
    } catch {
      return false;
    }
  }

  function getActiveSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getDefaultOnComplete(mode, meta) {
    return (results) => {
      if (mode === 'fulllength') {
        if (meta && meta.testId && typeof recordFLTAttempt === 'function') {
          recordFLTAttempt(meta.testId, results);
        }
        App.navigate('flt-result', results);
      } else if (mode === 'foundation') {
        App.navigate('analyzing', results);
      } else {
        App.navigate('result', results);
      }
    };
  }

  /* ---- Start a test ---- */
  function start({ questions, mode = 'chapter', meta = {}, onComplete }) {
    clearInterval(state.timerInterval);
    state = {
      questions,
      current: 0,
      answers: {},
      flagged: new Set(),
      startTime: Date.now(),
      timerInterval: null,
      secondsElapsed: 0,
      mode,
      meta,
      onComplete,
    };
    saveSession();
    render();
    startTimer();
  }

  /* ---- Resume an active test after reload ---- */
  function resume(sessionData, customOnComplete = null) {
    const session = sessionData || getActiveSession();
    if (!session || !Array.isArray(session.questions) || session.questions.length === 0) {
      return false;
    }
    clearInterval(state.timerInterval);

    let elapsed = Number(session.secondsElapsed) || 0;
    if (session.startTime) {
      const wallClockElapsed = Math.floor((Date.now() - session.startTime) / 1000);
      if (wallClockElapsed >= elapsed && wallClockElapsed - elapsed < 86400) {
        elapsed = wallClockElapsed;
      }
    }

    state = {
      questions: session.questions,
      current: Math.min(Math.max(0, session.current || 0), session.questions.length - 1),
      answers: session.answers || {},
      flagged: new Set(session.flagged || []),
      startTime: session.startTime || (Date.now() - elapsed * 1000),
      timerInterval: null,
      secondsElapsed: elapsed,
      mode: session.mode || 'chapter',
      meta: session.meta || {},
      onComplete: customOnComplete || getDefaultOnComplete(session.mode, session.meta),
    };

    saveSession();
    render();
    startTimer();
    return true;
  }

  /* ---- Timer ---- */
  function startTimer() {
    state.timerInterval = setInterval(() => {
      state.secondsElapsed++;
      updateTimer();
      // Periodically sync elapsed time to sessionStorage
      if (state.secondsElapsed % 5 === 0) {
        saveSession();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateTimer() {
    const el = document.getElementById('test-timer');
    if (!el) return;

    // Tests with a configured duration (e.g. Full Length Tests) count down
    // from that duration and auto-submit at zero. Other modes keep the
    // original count-up display with the ~72s/question warning heuristic.
    const hasDuration = state.meta && state.meta.durationSeconds;
    const totalAllotted = hasDuration ? state.meta.durationSeconds : state.questions.length * 72;
    const remaining = totalAllotted - state.secondsElapsed;

    el.textContent = formatTime(hasDuration ? Math.max(0, remaining) : state.secondsElapsed);

    if (remaining < 60) {
      el.parentElement.classList.add('danger');
    } else if (remaining < 180) {
      el.parentElement.classList.add('warning');
    }

    if (hasDuration && remaining <= 0) {
      autoSubmit();
    }
  }

  function autoSubmit() {
    if (!state.timerInterval) return; // already stopped/submitted
    if (window.App && App.showToast) App.showToast("Time's up! Auto-submitting your test.");
    submit();
  }

  /* ---- Render test interface ---- */
  function render() {
    const container = document.getElementById('screen-container');
    if (!container) return;

    const q = state.questions[state.current];
    const totalQ = state.questions.length;
    const answeredCount = Object.keys(state.answers).length;
    const progress = Math.round((answeredCount / totalQ) * 100);

    const modeLabel = {
      foundation: 'Foundation Assessment',
      pyq: `PYQ — ${state.meta.chapterName || state.meta.title || ''}`,
      chapter: `Chapter Test — ${state.meta.chapterName || ''}`,
      custom: `Your Custom Test${state.meta.title ? ' — ' + state.meta.title : ''}`,
      fulllength: `${state.meta.title || 'Full Length Test'}`,
      spacedq: `Spaced Re-Test${state.meta.reviewStage ? ' — ' + state.meta.reviewStage.toUpperCase() : ''}`,
      micro: `Micro-Retest — ${state.meta.subSkillName || ''}`,
      spaced: `Spaced Re-Test (Day ${state.meta.day || ''}) — ${state.meta.subSkillName || ''}`,
    }[state.mode] || 'Test';

    container.innerHTML = `
      <div class="test-screen">
        <!-- Header -->
        <div class="assessment-header">
          <div>
            <div style="font-size:var(--text-xs);color:var(--neutral-500);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${modeLabel}</div>
            <div class="progress-bar" style="width:200px;max-width:100%;">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            <div style="font-size:var(--text-xs);color:var(--neutral-500);margin-top:4px;">${answeredCount}/${totalQ} answered</div>
          </div>
          <div class="assessment-meta">
            <span class="question-count">Q ${state.current + 1} / ${totalQ}</span>
            <div class="timer-display">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span id="test-timer">00:00</span>
            </div>
          </div>
        </div>

        <!-- Layout -->
        <div class="test-layout">
          <!-- Question -->
          <div>
            <div class="question-card">
              <div class="question-number" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--sp-2);">
                <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
                  <span class="q-chip">Q${state.current + 1}</span>
                  <span style="color:var(--neutral-400);font-weight:500;">
                    ${q.chapter ? getChapterName(q.chapter) : ''}
                  </span>
                  ${q.ncertReference ? `
                    <span class="badge" style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;font-size:11px;font-weight:600;">
                      📖 ${escapeHtml(q.ncertReference)}
                    </span>
                  ` : ''}
                  ${q.questionType === 'assertion_reason' ? `<span class="badge badge-warning" style="font-size:10px;">Assertion &amp; Reason</span>` : ''}
                  ${q.questionType === 'matching' ? `<span class="badge badge-primary" style="font-size:10px;">Match the Following</span>` : ''}
                  ${q.questionType === 'diagram' || q.diagramUrl ? `<span class="badge badge-neutral" style="font-size:10px;">Diagram Based</span>` : ''}
                </div>
                <button class="btn btn-ghost btn-sm" style="font-size:11px;color:var(--neutral-400);padding:2px 8px;height:auto;" onclick="TestEngine.openReportModal()" title="Report an error or issue with this question">
                  ⚠️ Report Issue
                </button>
              </div>

              ${q.diagramUrl ? `
                <div style="text-align:center;margin:var(--sp-3) 0 var(--sp-4) 0;background:var(--neutral-50);padding:var(--sp-3);border-radius:var(--radius-md);border:1px solid var(--neutral-100);">
                  <img src="${q.diagramUrl}" alt="Biology Diagram" style="max-height:260px;max-width:100%;object-fit:contain;border-radius:var(--radius-sm);" />
                </div>
              ` : ''}

              ${q.caseStudyPassage ? `
                <div style="background:var(--primary-50);border-left:4px solid var(--primary-600);padding:var(--sp-3) var(--sp-4);border-radius:var(--radius-md);margin-bottom:var(--sp-4);font-size:var(--text-sm);color:var(--neutral-800);line-height:1.5;">
                  <strong style="color:var(--primary-800);display:block;margin-bottom:var(--sp-1);font-size:var(--text-xs);text-transform:uppercase;letter-spacing:0.5px;">📖 CUET / NCERT Case Study Passage:</strong>
                  ${escapeHtml(q.caseStudyPassage)}
                </div>
              ` : ''}

              <div class="question-text" style="line-height:1.5;margin-bottom:var(--sp-3);">${q.text}</div>

              ${q.assertion && q.reason ? `
                <div style="background:var(--neutral-50);border-radius:var(--radius-md);padding:var(--sp-3);margin-bottom:var(--sp-4);font-size:var(--text-sm);border:1px solid var(--neutral-100);">
                  <div style="margin-bottom:var(--sp-2);line-height:1.4;">
                    <strong style="color:var(--primary-700);">Assertion (A):</strong> ${escapeHtml(q.assertion)}
                  </div>
                  <div style="line-height:1.4;">
                    <strong style="color:var(--primary-700);">Reason (R):</strong> ${escapeHtml(q.reason)}
                  </div>
                </div>
              ` : ''}

              ${q.columnA && q.columnA.length && q.columnB && q.columnB.length ? `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);background:var(--neutral-50);border-radius:var(--radius-md);padding:var(--sp-3);margin-bottom:var(--sp-4);font-size:var(--text-xs);border:1px solid var(--neutral-100);">
                  <div>
                    <div style="font-weight:700;margin-bottom:var(--sp-2);color:var(--neutral-700);border-bottom:1px solid var(--neutral-200);padding-bottom:4px;">Column I</div>
                    ${q.columnA.map(item => `<div style="margin-bottom:4px;line-height:1.3;">${escapeHtml(item)}</div>`).join('')}
                  </div>
                  <div>
                    <div style="font-weight:700;margin-bottom:var(--sp-2);color:var(--neutral-700);border-bottom:1px solid var(--neutral-200);padding-bottom:4px;">Column II</div>
                    ${q.columnB.map(item => `<div style="margin-bottom:4px;line-height:1.3;">${escapeHtml(item)}</div>`).join('')}
                  </div>
                </div>
              ` : ''}

              <div class="options-list" id="options-list">
                ${q.options.map((opt, i) => `
                  <button class="option-item ${state.answers[state.current] === i ? 'selected' : ''}"
                    onclick="TestEngine.selectAnswer(${i})"
                    aria-label="Option ${['A','B','C','D'][i]}: ${opt}"
                    role="radio"
                    aria-checked="${state.answers[state.current] === i}">
                    <span class="option-label">${['A','B','C','D'][i]}</span>
                    <span class="option-text">${opt}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Nav buttons -->
            <div class="test-nav">
              <div style="display:flex;gap:var(--sp-2);">
                <button class="btn btn-secondary btn-sm" onclick="TestEngine.prevQ()" ${state.current === 0 ? 'disabled' : ''}>
                  ← Prev
                </button>
                <button class="btn btn-secondary btn-sm" onclick="TestEngine.nextQ()" ${state.current === totalQ - 1 ? 'disabled' : ''}>
                  Next →
                </button>
              </div>
              <div style="display:flex;gap:var(--sp-2);">
                <button class="btn btn-ghost btn-sm" onclick="TestEngine.toggleFlag()">
                  ${state.flagged.has(state.current) ? '🚩 Flagged' : '⚑ Flag'}
                </button>
                <button class="btn btn-primary" onclick="TestEngine.confirmSubmit()">
                  Submit Test
                </button>
              </div>
            </div>
          </div>

          <!-- Palette -->
          <div>
            <div class="question-palette">
              <div class="palette-title">Question Palette</div>
              <div class="palette-grid">
                ${state.questions.map((_, i) => {
                  let cls = '';
                  if (i === state.current) cls = 'current';
                  else if (state.flagged.has(i)) cls = 'flagged';
                  else if (state.answers[i] !== undefined) cls = 'answered';
                  return `<button class="palette-btn ${cls}" onclick="TestEngine.goTo(${i})" aria-label="Go to question ${i+1}">${i + 1}</button>`;
                }).join('')}
              </div>
              <div class="palette-legend">
                <div class="legend-item"><div class="legend-dot answered"></div> Answered (${Object.keys(state.answers).length})</div>
                <div class="legend-item"><div class="legend-dot unanswered"></div> Unanswered</div>
                <div class="legend-item"><div class="legend-dot current"></div> Current</div>
              </div>
            </div>

            ${((state.meta && state.meta.examType === 'CUET') || (window.State && State.getExamMode() === 'CUET') || state.mode === 'cuet') ? `
              <div style="margin-top:var(--sp-3);padding:var(--sp-3) var(--sp-4);background:var(--primary-50);border-radius:var(--radius-md);font-size:var(--text-xs);color:var(--primary-700);border:1px solid var(--primary-200);">
                <strong>🎯 CUET (UG) Marking Scheme:</strong><br>
                Correct: +5 &nbsp;&middot;&nbsp; Incorrect: −1 &nbsp;&middot;&nbsp; Max: 200<br>
                <span style="font-size:11px;color:var(--primary-800);margin-top:4px;display:block;">NTA Rule: 50 Questions (Attempt any 40).</span>
              </div>
            ` : `
              <div style="margin-top:var(--sp-3);padding:var(--sp-3) var(--sp-4);background:var(--primary-50);border-radius:var(--radius-md);font-size:var(--text-xs);color:var(--primary-700);">
                <strong>🎯 NEET Marking Scheme:</strong><br>
                Correct: +4 &nbsp;&middot;&nbsp; Incorrect: −1 &nbsp;&middot;&nbsp; Skipped: 0
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    updateTimer();
  }

  /* ---- Navigation ---- */
  function goTo(index) {
    const idx = Number(index);
    if (!isNaN(idx) && idx >= 0 && idx < state.questions.length) {
      state.current = idx;
      saveSession();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function nextQ() {
    if (state.current < state.questions.length - 1) {
      goTo(state.current + 1);
    }
  }

  function prevQ() {
    if (state.current > 0) {
      goTo(state.current - 1);
    }
  }

  function selectAnswer(optionIndex) {
    state.answers[state.current] = Number(optionIndex);
    saveSession();
    render();
  }

  function toggleFlag() {
    if (state.flagged.has(state.current)) {
      state.flagged.delete(state.current);
    } else {
      state.flagged.add(state.current);
    }
    saveSession();
    render();
  }

  /* ---- Submission ---- */
  function confirmSubmit() {
    const total = state.questions.length;
    const answered = Object.keys(state.answers).length;
    const unattempted = total - answered;

    if (unattempted > 0) {
      if (!confirm(`You have ${unattempted} unattempted question${unattempted > 1 ? 's' : ''}. Submit anyway?`)) return;
    }
    submit();
  }

  async function submit() {
    stopTimer();
    clearSession();

    const results = buildResults();

    // Submit attempt to live backend API (guest or authenticated)
    if (window.ApiClient) {
      try {
        const answersMap = {};
        state.questions.forEach((q, i) => {
          const qId = q._id || q.id;
          if (qId) {
            answersMap[qId] = state.answers[i] !== undefined ? state.answers[i] : null;
          }
        });

        const testTitle = (state.meta && (state.meta.chapterName || state.meta.title)) || `${(state.mode || 'Practice').toUpperCase()} Biology Test`;

        const submitPayload = {
          mode: state.mode || 'chapter',
          testTitle,
          timeTakenSeconds: state.secondsElapsed || 0,
          meta: state.meta || {},
          answers: answersMap,
          score: results.neetScore,
          total: results.totalQuestions,
          accuracy: results.accuracy,
          questions: results.questionResults,
        };

        const resp = await ApiClient.post('/tests/submit', submitPayload);
        if (resp && resp.attemptId) {
          results.attemptId = resp.attemptId;
        }
      } catch (err) {
        console.warn('Could not sync test attempt to backend (running in offline mode):', err);
      }
    }

    if (state.onComplete) {
      state.onComplete(results);
    } else {
      App.navigate('result', results);
    }
  }

  function buildResults() {
    const qs = state.questions;
    const isCuet = (state.meta && state.meta.examType === 'CUET') || (window.State && State.getExamMode() === 'CUET') || state.mode === 'cuet';
    let correct = 0, incorrect = 0, unattempted = 0;
    let finalScore = 0;
    const questionResults = [];

    qs.forEach((q, i) => {
      const selected = state.answers[i];
      const correctOpt = q.correct !== undefined ? q.correct : (q.correctOption !== undefined ? q.correctOption : 0);
      let status;
      if (selected === undefined || selected === null) {
        status = 'skipped';
        unattempted++;
      } else if (Number(selected) === Number(correctOpt)) {
        status = 'correct';
        correct++;
        finalScore += isCuet ? 5 : 4;
      } else {
        status = 'incorrect';
        incorrect++;
        finalScore -= 1;
      }
      questionResults.push({
        questionId: q.id || q._id,
        question: q,
        selected,
        status,
        errorType: null, // to be tagged by student
      });
    });

    const accuracy = qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0;
    const maxScore = isCuet ? 200 : (qs.length * 4);

    // Track NCERT Bio Focus progress
    if (state.mode === 'ncert-focus' && state.meta && state.meta.chapterId && window.State) {
      try {
        const appState = State.get();
        if (!appState.ncertProgress) appState.ncertProgress = {};
        const chId = state.meta.chapterId;
        const prev = appState.ncertProgress[chId] || { attempts: 0, bestScore: 0, totalQuestions: qs.length };
        const newProgress = {
          attempts: (prev.attempts || 0) + 1,
          bestScore: Math.max(prev.bestScore || 0, correct),
          totalQuestions: qs.length,
          lastAttemptDate: Date.now(),
          accuracy,
        };
        appState.ncertProgress[chId] = newProgress;
        State.save(appState);

        // Sync with live backend
        if (window.ApiClient && ApiClient.getToken()) {
          ApiClient.post('/user/ncert-progress', {
            chapterId: chId,
            ...newProgress,
          }).catch(e => console.warn('NCERT progress background sync:', e));
        }
      } catch (e) {
        console.warn('Could not record ncert progress:', e);
      }
    }

    return {
      mode: state.mode,
      examType: isCuet ? 'CUET' : 'NEET',
      meta: state.meta,
      totalQuestions: qs.length,
      correct,
      incorrect,
      unattempted,
      score: finalScore,
      maxScore,
      neetScore: finalScore,
      accuracy,
      timeSpent: state.secondsElapsed,
      questionResults,
    };
  }

  /* ---- Helper ---- */
  function getChapterName(chapterId) {
    const ch = DB.chapters.find(c => c.id === chapterId);
    return ch ? ch.name : chapterId;
  }

  /* ---- Question Issue Reporting ---- */
  function openReportModal() {
    const q = state.questions[state.current];
    if (!q) return;

    let modal = document.getElementById('test-report-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'test-report-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:var(--sp-4);" onclick="if(event.target===this) TestEngine.closeReportModal();">
        <div style="max-width:500px;width:100%;background:#ffffff;color:#0f172a;box-shadow:0 25px 50px -12px rgba(0,0,0,0.45);border:1px solid var(--neutral-200);border-radius:var(--radius-xl);padding:var(--sp-6);animation:modalPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);border-bottom:1px solid var(--neutral-100);padding-bottom:var(--sp-3);">
            <div style="font-weight:800;font-size:var(--text-lg);color:#0f172a;display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;">🚩</span>
              <span>Report Issue with Question #${state.current + 1}</span>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="TestEngine.closeReportModal()" style="font-size:18px;line-height:1;padding:4px 8px;border-radius:50%;color:var(--neutral-500);">✕</button>
          </div>

          <div style="font-size:var(--text-xs);color:#334155;margin-bottom:var(--sp-4);line-height:1.5;background:#f8fafc;padding:var(--sp-3);border-radius:var(--radius-md);border:1px solid #e2e8f0;border-left:4px solid var(--primary-600);">
            <strong style="color:var(--primary-800);display:block;margin-bottom:2px;">Question:</strong>
            "${escapeHtml(q.text.length > 130 ? q.text.substring(0, 130) + '…' : q.text)}"
          </div>

          <form onsubmit="event.preventDefault(); TestEngine.submitReport();">
            <div class="form-group" style="margin-bottom:var(--sp-4);">
              <label class="form-label" style="font-size:var(--text-xs);font-weight:700;color:#1e293b;margin-bottom:6px;">Select Issue Type *</label>
              <select class="form-select form-select-sm" id="test-report-reason" required style="width:100%;background:#ffffff;border:1.5px solid #cbd5e1;color:#0f172a;font-size:var(--text-sm);padding:8px 12px;border-radius:var(--radius-md);">
                <option value="Incorrect Answer / Wrong Correct Option">Incorrect Answer / Wrong Correct Option</option>
                <option value="Question Formulation / Typo Error">Question Formulation / Typo Error</option>
                <option value="Incorrect / Incomplete Options">Incorrect / Incomplete Options</option>
                <option value="Wrong or Misleading Explanation">Wrong or Misleading Explanation</option>
                <option value="Other">Other Issue</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom:var(--sp-5);">
              <label class="form-label" style="font-size:var(--text-xs);font-weight:700;color:#1e293b;margin-bottom:6px;">Additional Details (optional):</label>
              <textarea class="form-input form-input-sm" id="test-report-comments" rows="3" placeholder="Briefly describe what looks wrong so the admin team can verify and fix it…" style="width:100%;font-size:var(--text-xs);background:#ffffff;border:1.5px solid #cbd5e1;color:#0f172a;border-radius:var(--radius-md);line-height:1.4;padding:8px 12px;"></textarea>
            </div>

            <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;border-top:1px solid var(--neutral-100);padding-top:var(--sp-4);">
              <button class="btn btn-secondary btn-sm" type="button" onclick="TestEngine.closeReportModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" type="submit" id="test-report-submit-btn">Submit Report</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function closeReportModal() {
    const modal = document.getElementById('test-report-modal');
    if (modal) modal.remove();
  }

  async function submitReport() {
    const q = state.questions[state.current];
    if (!q) return;

    const reason = document.getElementById('test-report-reason')?.value || 'General Issue';
    const comments = document.getElementById('test-report-comments')?.value.trim() || '';
    const btn = document.getElementById('test-report-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

    try {
      if (window.ApiClient) {
        await ApiClient.post('/reports', {
          questionId: q.id || q._id,
          questionText: q.text,
          chapterName: getChapterName(q.chapter),
          reason,
          comments,
        });
      }
      closeReportModal();
      if (window.App && App.showToast) {
        App.showToast('✅ Question reported for admin review. Thank you!');
      } else {
        alert('Thank you! Question reported for admin review.');
      }
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Report'; }
      alert('Could not submit report: ' + err.message);
    }
  }

  /* ---- Public API ---- */
  return { 
    start, 
    resume, 
    hasActiveSession, 
    getActiveSession, 
    clearSession, 
    goTo, 
    nextQ, 
    prevQ, 
    selectAnswer, 
    toggleFlag, 
    confirmSubmit, 
    openReportModal, 
    closeReportModal, 
    submitReport 
  };

})();

// Export globally on window object
window.TestEngine = TestEngine;
window.testNextQ = () => TestEngine.nextQ();
window.testPrevQ = () => TestEngine.prevQ();
window.testSelectAnswer = (i) => TestEngine.selectAnswer(i);
window.testGoTo = (i) => TestEngine.goTo(i);

// Keyboard Navigation support (Arrow Right -> Next, Arrow Left -> Prev)
document.addEventListener('keydown', (e) => {
  if (!document.querySelector('.test-screen')) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

  if (e.key === 'ArrowRight') {
    TestEngine.nextQ();
  } else if (e.key === 'ArrowLeft') {
    TestEngine.prevQ();
  }
});


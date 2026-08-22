/* ============================================================
   fulltest.js — Full Length Test feature for Bio Rank
   Frontend-only: mock test data (DB.fullLengthTests), attempts and
   best scores are tracked in State (localStorage). No backend/API.
   ============================================================ */

const FLT = {
  filter: 'all', // 'all' | 'attempted' | 'not-attempted'
  examFilter: 'all', // 'all' | 'NEET' | 'CUET'
};

/* ---- Full Length Test list page ---- */
function renderFullLengthTest(container) {
  if (typeof DB.syncFromAdminStore === 'function') {
    DB.syncFromAdminStore();
  }
  const tests = DB.fullLengthTests || [];
  const currentExam = (window.State && typeof State.getExamMode === 'function' && State.getExamMode()) || 'all';
  if (!FLT.examFilterInitialized) {
    FLT.examFilter = currentExam === 'CUET' ? 'CUET' : (currentExam === 'NEET' ? 'NEET' : 'all');
    FLT.examFilterInitialized = true;
  }

  const withProgress = tests.map(t => ({ test: t, progress: getFLTProgress(t.id || t._id) }));
  const filtered = withProgress.filter(({ test, progress }) => {
    const isCuet = test.examType === 'CUET' || (test.title && test.title.toLowerCase().includes('cuet'));
    // Exam type filter
    if (FLT.examFilter === 'NEET' && isCuet) return false;
    if (FLT.examFilter === 'CUET' && !isCuet) return false;

    // Attempted filter
    if (FLT.filter === 'attempted') return progress.attempts > 0;
    if (FLT.filter === 'not-attempted') return progress.attempts === 0;
    return true;
  });

  container.innerHTML = `
    <div class="flt-layout">
      <div class="flt-main-col">
        <div style="margin-bottom:var(--sp-4);">
          <div class="page-title">Full Length Mock Tests</div>
          <div class="page-subtitle">Official pattern timed mock tests for NEET (360 Marks) and CUET UG (250 Marks).</div>
        </div>

        <!-- Exam Filter Selector -->
        <div style="display:flex;gap:var(--sp-2);margin-bottom:var(--sp-4);flex-wrap:wrap;">
          <button class="btn ${FLT.examFilter === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="setFLTExamFilter('all')">All Exams</button>
          <button class="btn ${FLT.examFilter === 'NEET' ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="setFLTExamFilter('NEET')">🟢 NEET Mocks (90 Qs &middot; +4/-1)</button>
          <button class="btn ${FLT.examFilter === 'CUET' ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="setFLTExamFilter('CUET')">🔵 CUET UG Mocks (50 Qs &middot; +5/-1)</button>
        </div>

        <div class="flt-filter-tabs">
          <button class="flt-filter-tab ${FLT.filter === 'all' ? 'active' : ''}" onclick="setFLTFilter('all')">All Status</button>
          <button class="flt-filter-tab ${FLT.filter === 'attempted' ? 'active' : ''}" onclick="setFLTFilter('attempted')">Attempted</button>
          <button class="flt-filter-tab ${FLT.filter === 'not-attempted' ? 'active' : ''}" onclick="setFLTFilter('not-attempted')">Not Attempted</button>
        </div>

        ${filtered.length === 0 ? `
          <div class="card" style="text-align:center;padding:var(--sp-10);">
            <p style="color:var(--neutral-500);">No tests found in this category.</p>
          </div>
        ` : `
          <div class="flt-grid">
            ${filtered.map(({ test, progress }) => fltCardHtml(test, progress)).join('')}
          </div>
        `}
      </div>

      <aside class="flt-ad-sidebar">
        <div class="ad-header">High Yield Resource</div>
        <div class="card" style="padding:var(--sp-4);margin-bottom:var(--sp-3);background:linear-gradient(135deg, var(--primary-50), #fff);border:1px solid var(--primary-200);">
          <div style="font-size:24px;margin-bottom:var(--sp-2);">🎯</div>
          <div style="font-weight:700;font-size:var(--text-sm);margin-bottom:var(--sp-1);color:var(--primary-900);">NTA Exam Simulation</div>
          <p style="font-size:var(--text-xs);color:var(--neutral-600);margin:0;line-height:1.4;">Real-time timers, automatic score calculation, and negative marking analysis.</p>
        </div>
        <div class="card" style="padding:var(--sp-4);background:linear-gradient(135deg, #f0fdf4, #fff);border:1px solid var(--success-200);">
          <div style="font-size:24px;margin-bottom:var(--sp-2);">🌿</div>
          <div style="font-weight:700;font-size:var(--text-sm);margin-bottom:var(--sp-1);color:var(--success-900);">NCERT Line-by-Line</div>
          <p style="font-size:var(--text-xs);color:var(--neutral-600);margin:0;line-height:1.4;">Direct citations to NCERT Class 11th &amp; 12th pages for every single question.</p>
        </div>
      </aside>
    </div>
  `;
}

function setFLTExamFilter(exam) {
  FLT.examFilter = exam;
  FLT.examFilterInitialized = true;
  const container = document.getElementById('screen-container');
  if (container) {
    renderFullLengthTest(container);
  } else if (window.App && typeof App.navigate === 'function') {
    App.navigate('full-length-test');
  }
}
window.setFLTExamFilter = setFLTExamFilter;
window.renderFullLengthTest = renderFullLengthTest;

function fltCardHtml(test, progress) {
  const attempted = progress.attempts > 0;
  const isCuet = test.examType === 'CUET' || (test.title && test.title.toLowerCase().includes('cuet'));
  const maxScore = isCuet ? 250 : 360;
  const recentHistory = progress.attemptHistory.slice(-5);
  const testId = test.id || test._id;

  return `
    <div class="flt-card">
      <div class="flt-card-top">
        <div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span class="badge ${isCuet ? 'badge-primary' : 'badge-neutral'}" style="font-size:10px;font-weight:700;">
              ${isCuet ? '🔵 CUET (UG)' : '🟢 NEET'}
            </span>
            <span class="badge badge-neutral" style="font-size:10px;">${isCuet ? '250 Marks' : '360 Marks'}</span>
          </div>
          <div class="flt-card-title">${test.title}</div>
          <div class="flt-card-desc">${test.description}</div>
        </div>
        ${attempted ? `<span class="badge badge-success">Attempted</span>` : `<span class="badge badge-neutral">New</span>`}
      </div>

      <div class="flt-card-meta">
        <span>📝 ${test.numberOfQuestions} Questions</span>
        <span>⏱️ ${test.durationMinutes} Minutes</span>
        <span>⚖️ ${isCuet ? '+5 / -1' : '+4 / -1'}</span>
      </div>

      ${attempted ? `
        <div class="flt-card-progress">
          <div class="flt-card-progress-item">
            <div class="flt-card-progress-num">${progress.attempts}</div>
            <div class="flt-card-progress-label">Attempts</div>
          </div>
          <div class="flt-card-progress-item">
            <div class="flt-card-progress-num">${progress.bestScore}/${progress.bestTotal || maxScore}</div>
            <div class="flt-card-progress-label">Best Score</div>
          </div>
        </div>
        ${recentHistory.length > 0 ? `
          <div class="flt-card-history">
            ${recentHistory.map(h => `<span class="flt-history-chip">A${h.attempt}: ${h.score}/${h.total}</span>`).join('')}
          </div>
        ` : ''}
      ` : `
        <div style="font-size:var(--text-xs);color:var(--neutral-400);font-weight:600;">Not attempted yet</div>
      `}

      <div class="flt-card-actions">
        <button class="btn btn-primary btn-block" onclick="startFullLengthTest('${testId}')">
          ${attempted ? 'Retake Test →' : 'Start Test →'}
        </button>
      </div>
    </div>
  `;
}

window.setFLTFilter = function (filter) {
  FLT.filter = filter;
  const container = document.getElementById('screen-container');
  if (container) {
    renderFullLengthTest(container);
  } else if (window.App && typeof App.navigate === 'function') {
    App.navigate('full-length-test');
  }
};

/* ---- Start / attempt a Full Length Test ---- */
window.startFullLengthTest = function (testId) {
  let test = (DB.fullLengthTests || []).find(t => t.id === testId || t._id === testId);
  if (!test && window.DB && window.DB.rawBaseFullLengthTests) {
    test = window.DB.rawBaseFullLengthTests.find(t => t.id === testId || t._id === testId);
  }
  if (!test) {
    if (typeof DB.syncFromAdminStore === 'function') DB.syncFromAdminStore();
    test = (DB.fullLengthTests || []).find(t => t.id === testId || t._id === testId);
  }
  if (!test) { App.showToast('Test not found'); return; }

  const questions = getFullLengthTestQuestions(test);
  if (questions.length === 0) { App.showToast('No questions available yet'); return; }

  const actualId = test.id || test._id || testId;
  App.navigate('test', {
    questions,
    mode: 'fulllength',
    meta: {
      testId: actualId,
      title: test.title,
      examType: test.examType || 'NEET',
      durationSeconds: (test.durationMinutes || 90) * 60,
    },
    onComplete: (results) => {
      recordFLTAttempt(actualId, results);
      App.navigate('flt-result', results);
    },
  });
};

/* ---- Full Length Test result page ---- */
function renderFLTResult(container, results) {
  if (!results) { App.navigate('full-length-test'); return; }

  const testId = results.meta && results.meta.testId;
  const test = (DB.fullLengthTests || []).find(t => t.id === testId || t._id === testId)
    || (window.DB && window.DB.rawBaseFullLengthTests && window.DB.rawBaseFullLengthTests.find(t => t.id === testId || t._id === testId));
  const progress = getFLTProgress(testId);
  const isCuet = (test && test.examType === 'CUET') || (results && results.examType === 'CUET');
  const totalQ = results.totalQuestions || (isCuet ? 50 : 90);
  const maxMarks = isCuet ? 250 : (totalQ * 4);
  const finalScore = results.score !== undefined ? results.score : (results.neetScore !== undefined ? results.neetScore : (isCuet ? (results.correct * 5 - results.incorrect * 1) : (results.correct * 4 - results.incorrect * 1)));
  const percent = results.accuracy !== undefined ? results.accuracy : (totalQ > 0 ? Math.round((results.correct / totalQ) * 100) : 0);

  window._fltLastResults = results;

  container.innerHTML = `
    <div style="max-width:760px;margin:0 auto;">
      <div style="margin-bottom:var(--sp-5);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span class="badge ${isCuet ? 'badge-primary' : 'badge-neutral'}" style="font-size:11px;font-weight:700;">
            ${isCuet ? '🔵 CUET (UG) Official' : '🟢 NEET Pattern'}
          </span>
        </div>
        <div class="page-title">${(test && test.title) || results.meta.title || (isCuet ? 'CUET Biology Mock' : 'Full Length Test')}</div>
        <div class="page-subtitle">Your ${isCuet ? 'CUET (UG)' : 'NEET'} Mock Test Evaluation</div>
      </div>

      <div class="result-hero" style="background:linear-gradient(135deg,var(--primary-700) 0%,var(--primary-600) 100%);color:#fff;border-radius:var(--radius-lg);padding:var(--sp-6);text-align:center;box-shadow:var(--shadow-md);">
        <div style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:1.5px;opacity:0.9;font-weight:800;margin-bottom:6px;">Total ${isCuet ? 'CUET (UG)' : 'NEET Biology'} Score</div>
        <div class="result-score flt-score" style="font-size:3.2rem;font-weight:800;line-height:1.1;margin-bottom:4px;">${finalScore} <span style="font-size:var(--text-lg);font-weight:600;opacity:0.85;">/ ${maxMarks} Marks</span></div>
        <div class="result-score-label" style="font-size:var(--text-sm);opacity:0.95;">${results.correct} of ${totalQ} Correct &middot; ${percent}% Accuracy</div>
      </div>

      <div class="result-stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-3);margin:var(--sp-5) 0;">
        <div class="result-stat card" style="text-align:center;padding:var(--sp-4);">
          <span class="result-stat-num" style="font-size:var(--text-2xl);font-weight:800;color:var(--success-600);">${results.correct}</span>
          <span class="result-stat-label" style="font-size:var(--text-xs);color:var(--neutral-500);display:block;margin-top:2px;">Correct (+${results.correct * (isCuet ? 5 : 4)})</span>
        </div>
        <div class="result-stat card" style="text-align:center;padding:var(--sp-4);">
          <span class="result-stat-num" style="font-size:var(--text-2xl);font-weight:800;color:var(--error-600);">${results.incorrect}</span>
          <span class="result-stat-label" style="font-size:var(--text-xs);color:var(--neutral-500);display:block;margin-top:2px;">Incorrect (−${results.incorrect})</span>
        </div>
        <div class="result-stat card" style="text-align:center;padding:var(--sp-4);">
          <span class="result-stat-num" style="font-size:var(--text-2xl);font-weight:800;color:var(--neutral-500);">${results.unattempted}</span>
          <span class="result-stat-label" style="font-size:var(--text-xs);color:var(--neutral-500);display:block;margin-top:2px;">Unattempted (0)</span>
        </div>
      </div>

      <div class="card" style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;padding:var(--sp-4) var(--sp-5);">
        <div>
          <div class="section-title" style="font-size:var(--text-base);">Best Score Achieved</div>
          <div style="font-size:var(--text-xs);color:var(--neutral-500);">Across ${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'} on this test</div>
        </div>
        <div style="font-size:var(--text-2xl);font-weight:800;color:var(--primary-600);">${progress.bestScore * (isCuet ? 5 : 4)}/${(progress.bestTotal || totalQ) * (isCuet ? 5 : 4)} <span style="font-size:var(--text-xs);font-weight:600;color:var(--neutral-500);">(${progress.bestScore}/${progress.bestTotal || totalQ} Qs)</span></div>
      </div>

      <div class="flt-result-actions" style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="App.navigate('flt-review', window._fltLastResults)">Review Answers &amp; Solutions →</button>
        <button class="btn btn-secondary" onclick="startFullLengthTest('${testId}')">Attempt Test Again</button>
        <button class="btn btn-ghost" onclick="App.navigate('full-length-test')">Back to Full Length Tests</button>
      </div>
    </div>
  `;
}

/* ---- Full Length Test review-answers page ---- */
function renderFLTReview(container, results) {
  if (!results) { App.navigate('full-length-test'); return; }
  const testId = results.meta && results.meta.testId;
  const test = (DB.fullLengthTests || []).find(t => t.id === testId || t._id === testId)
    || (window.DB && window.DB.rawBaseFullLengthTests && window.DB.rawBaseFullLengthTests.find(t => t.id === testId || t._id === testId));
  const isCuet = (test && test.examType === 'CUET') || (results && results.examType === 'CUET');

  container.innerHTML = `
    <div style="max-width:760px;">
      <div style="margin-bottom:var(--sp-5);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span class="badge ${isCuet ? 'badge-primary' : 'badge-neutral'}" style="font-size:11px;font-weight:700;">
            ${isCuet ? '🔵 CUET (UG)' : '🟢 NEET'}
          </span>
        </div>
        <div class="page-title">Review Answers</div>
        <div class="page-subtitle">${(test && test.title) || results.meta.title || (isCuet ? 'CUET Full Mock Test' : 'Full Length Test')}</div>
      </div>

      <div class="card">
        ${results.questionResults.map((r, i) => `
          <div class="flt-review-row">
            <div style="display:flex;gap:var(--sp-3);align-items:flex-start;">
              <span class="q-result-num ${r.status}">${i + 1}</span>
              <div style="flex:1;">
                <div class="flt-review-q-text">${r.question.text}</div>
                ${r.question.options.map((opt, oi) => {
                  const isCorrect = oi === r.question.correct;
                  const isWrongSelected = oi === r.selected && r.selected !== r.question.correct;
                  const cls = isCorrect ? 'is-correct' : (isWrongSelected ? 'is-wrong-selected' : '');
                  return `<div class="flt-review-option ${cls}">${['A','B','C','D'][oi]}. ${opt}${isCorrect ? ' ✓' : ''}${isWrongSelected ? ' (Your answer)' : ''}</div>`;
                }).join('')}
                ${r.selected === undefined || r.selected === null ? `<div style="font-size:var(--text-xs);color:var(--neutral-400);font-weight:600;">Not attempted</div>` : ''}
                ${r.question.explanation ? `<div class="flt-review-explanation">${r.question.explanation}</div>` : ''}
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--sp-1);margin-left:var(--sp-2);">
                <span class="badge badge-${r.status === 'correct' ? 'success' : r.status === 'incorrect' ? 'error' : 'neutral'}">
                  ${r.status === 'correct' ? (isCuet ? '+5' : '+4') : r.status === 'incorrect' ? '−1' : '0'}
                </span>
                <button class="btn btn-ghost btn-sm" style="font-size:10px;padding:2px 6px;color:var(--neutral-400);height:auto;" onclick="openQuestionReportModal(window._fltLastResults.questionResults[${i}].question, ${i + 1})" title="Report error in this question">
                  ⚠️ Report
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="flt-result-actions" style="margin-top:var(--sp-5);">
        <button class="btn btn-secondary" onclick="App.navigate('flt-result', window._fltLastResults)">Back to Result</button>
        <button class="btn btn-ghost" onclick="App.navigate('full-length-test')">Back to Full Length Tests</button>
      </div>
    </div>
  `;
}

/* ---- Export to global window scope ---- */
window.renderFullLengthTest = renderFullLengthTest;
window.renderFLTResult = renderFLTResult;
window.renderFLTReview = renderFLTReview;

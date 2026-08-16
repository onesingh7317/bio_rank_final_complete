/* ============================================================
   fulltest.js — Full Length Test feature for Bio Rank
   Frontend-only: mock test data (DB.fullLengthTests), attempts and
   best scores are tracked in State (localStorage). No backend/API.
   ============================================================ */

const FLT = {
  filter: 'all', // 'all' | 'attempted' | 'not-attempted'
};

/* ---- Full Length Test list page ---- */
function renderFullLengthTest(container) {
  const tests = DB.fullLengthTests || [];

  const withProgress = tests.map(t => ({ test: t, progress: getFLTProgress(t.id) }));
  const filtered = withProgress.filter(({ progress }) => {
    if (FLT.filter === 'attempted') return progress.attempts > 0;
    if (FLT.filter === 'not-attempted') return progress.attempts === 0;
    return true;
  });

  container.innerHTML = `
    <div class="flt-layout">
      <div class="flt-main-col">
        <div style="margin-bottom:var(--sp-5);">
          <div class="page-title">Full Length Tests</div>
          <div class="page-subtitle">Test your Biology preparation with complete-length mock tests.</div>
        </div>

        <div class="flt-filter-tabs">
          <button class="flt-filter-tab ${FLT.filter === 'all' ? 'active' : ''}" onclick="setFLTFilter('all')">All Tests</button>
          <button class="flt-filter-tab ${FLT.filter === 'attempted' ? 'active' : ''}" onclick="setFLTFilter('attempted')">Attempted</button>
          <button class="flt-filter-tab ${FLT.filter === 'not-attempted' ? 'active' : ''}" onclick="setFLTFilter('not-attempted')">Not Attempted</button>
        </div>

        ${filtered.length === 0 ? `
          <div class="card" style="text-align:center;padding:var(--sp-10);">
            <p style="color:var(--neutral-500);">No tests in this view yet.</p>
          </div>
        ` : `
          <div class="flt-grid">
            ${filtered.map(({ test, progress }) => fltCardHtml(test, progress)).join('')}
          </div>
        `}
      </div>

      <aside class="flt-ad-sidebar">
        <div class="ad-header">Sponsored</div>
        <div class="ad-card ad-placeholder" data-ad-slot="1">
          <div class="ad-placeholder-icon">📢</div>
          <div class="ad-placeholder-text">Advertisement<br><span>300 × 250</span></div>
        </div>
        <div class="ad-card ad-placeholder" data-ad-slot="2">
          <div class="ad-placeholder-icon">🎯</div>
          <div class="ad-placeholder-text">Advertisement<br><span>300 × 250</span></div>
        </div>
      </aside>
    </div>
  `;
}

function fltCardHtml(test, progress) {
  const attempted = progress.attempts > 0;
  const recentHistory = progress.attemptHistory.slice(-5);

  return `
    <div class="flt-card">
      <div class="flt-card-top">
        <div>
          <div class="flt-card-title">${test.title}</div>
          <div class="flt-card-desc">${test.description}</div>
        </div>
        ${attempted ? `<span class="badge badge-success">Attempted</span>` : `<span class="badge badge-neutral">New</span>`}
      </div>

      <div class="flt-card-meta">
        <span>📝 ${test.numberOfQuestions} Questions</span>
        <span>⏱️ ${test.durationMinutes} Minutes</span>
      </div>

      ${attempted ? `
        <div class="flt-card-progress">
          <div class="flt-card-progress-item">
            <div class="flt-card-progress-num">${progress.attempts}</div>
            <div class="flt-card-progress-label">Attempts</div>
          </div>
          <div class="flt-card-progress-item">
            <div class="flt-card-progress-num">${progress.bestScore}/${progress.bestTotal}</div>
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

      <button class="btn btn-primary btn-block" onclick="startFullLengthTest('${test.id}')">
        ${attempted ? 'Attempt Test Again →' : 'Attempt Test →'}
      </button>
    </div>
  `;
}

window.setFLTFilter = function (filter) {
  FLT.filter = filter;
  App.navigate('full-length-test');
};

/* ---- Start / attempt a Full Length Test ---- */
window.startFullLengthTest = function (testId) {
  const test = (DB.fullLengthTests || []).find(t => t.id === testId);
  if (!test) { App.showToast('Test not found'); return; }

  const questions = getFullLengthTestQuestions(test);
  if (questions.length === 0) { App.showToast('No questions available yet'); return; }

  App.navigate('test', {
    questions,
    mode: 'fulllength',
    meta: { testId: test.id, title: test.title, durationSeconds: test.durationMinutes * 60 },
    onComplete: (results) => {
      recordFLTAttempt(test.id, results);
      App.navigate('flt-result', results);
    },
  });
};

/* ---- Full Length Test result page ---- */
function renderFLTResult(container, results) {
  if (!results) { App.navigate('full-length-test'); return; }

  const testId = results.meta.testId;
  const test = (DB.fullLengthTests || []).find(t => t.id === testId);
  const progress = getFLTProgress(testId);
  const percent = results.totalQuestions > 0 ? Math.round((results.correct / results.totalQuestions) * 1000) / 10 : 0;

  container.innerHTML = `
    <div style="max-width:760px;">
      <div style="margin-bottom:var(--sp-5);">
        <div class="page-title">${(test && test.title) || results.meta.title || 'Full Length Test'}</div>
        <div class="page-subtitle">Your Score</div>
      </div>

      <div class="result-hero">
        <div class="result-score flt-score">${results.correct} / ${results.totalQuestions}</div>
        <div class="result-score-label">${percent}% accuracy</div>
      </div>

      <div class="result-stats" style="margin-bottom:var(--sp-5);">
        <div class="result-stat">
          <span class="result-stat-num" style="color:var(--success-500);">${results.correct}</span>
          <span class="result-stat-label">Correct</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-num" style="color:var(--error-500);">${results.incorrect}</span>
          <span class="result-stat-label">Incorrect</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-num" style="color:var(--neutral-500);">${results.unattempted}</span>
          <span class="result-stat-label">Unattempted</span>
        </div>
      </div>

      <div class="card" style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div class="section-title" style="font-size:var(--text-base);">Best Score</div>
          <div style="font-size:var(--text-xs);color:var(--neutral-500);">Across ${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'}</div>
        </div>
        <div style="font-size:var(--text-2xl);font-weight:800;color:var(--primary-600);">${progress.bestScore}/${progress.bestTotal}</div>
      </div>

      <div class="flt-result-actions">
        <button class="btn btn-primary" onclick="App.navigate('flt-review', window._fltLastResults)">Review Answers</button>
        <button class="btn btn-secondary" onclick="startFullLengthTest('${testId}')">Attempt Again</button>
        <button class="btn btn-ghost" onclick="App.navigate('full-length-test')">Back to Full Length Tests</button>
      </div>
    </div>
  `;

  window._fltLastResults = results;
}

/* ---- Full Length Test review-answers page ---- */
function renderFLTReview(container, results) {
  if (!results) { App.navigate('full-length-test'); return; }
  const testId = results.meta.testId;
  const test = (DB.fullLengthTests || []).find(t => t.id === testId);

  container.innerHTML = `
    <div style="max-width:760px;">
      <div style="margin-bottom:var(--sp-5);">
        <div class="page-title">Review Answers</div>
        <div class="page-subtitle">${(test && test.title) || results.meta.title || 'Full Length Test'}</div>
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
              <span class="badge badge-${r.status === 'correct' ? 'success' : r.status === 'incorrect' ? 'error' : 'neutral'}">
                ${r.status === 'correct' ? '+4' : r.status === 'incorrect' ? '−1' : '0'}
              </span>
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

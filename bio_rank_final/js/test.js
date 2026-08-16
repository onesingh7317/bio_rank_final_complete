/* ============================================================
   test.js — Shared Test Engine for Bio Rank
   Handles all test modes: PYQ, Chapter, Improvement, Micro-retest, Spaced
   ============================================================ */

const TestEngine = (() => {

  let state = {
    questions: [],
    current: 0,
    answers: {},       // { questionIndex: optionIndex }
    flagged: new Set(),
    startTime: null,
    timerInterval: null,
    secondsElapsed: 0,
    mode: 'chapter',   // 'pyq' | 'chapter' | 'micro' | 'spaced' | 'foundation'
    meta: {},          // { year, shift, chapterId, subSkillId, ... }
    onComplete: null,
  };

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
    render();
    startTimer();
  }

  /* ---- Timer ---- */
  function startTimer() {
    state.timerInterval = setInterval(() => {
      state.secondsElapsed++;
      updateTimer();
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
              <div class="question-number">
                <span class="q-chip">Q${state.current + 1}</span>
                <span style="color:var(--neutral-400);font-weight:400;">
                  ${q.chapter ? getChapterName(q.chapter) : ''} &nbsp;|&nbsp; ${q.bloomLevel || ''}
                </span>
              </div>
              <div class="question-text">${q.text}</div>
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
                <div class="legend-item"><div class="legend-dot answered"></div> Answered</div>
                <div class="legend-item"><div class="legend-dot unanswered"></div> Not answered</div>
                <div class="legend-item"><div class="legend-dot current"></div> Current</div>
              </div>
            </div>

            <div style="margin-top:var(--sp-3);padding:var(--sp-3) var(--sp-4);background:var(--primary-50);border-radius:var(--radius-md);font-size:var(--text-xs);color:var(--primary-700);">
              <strong>NEET Marking:</strong><br>
              Correct: +4 &nbsp; Incorrect: −1 &nbsp; Skipped: 0
            </div>
          </div>
        </div>
      </div>
    `;

    updateTimer();
  }

  /* ---- Navigation ---- */
  function goTo(index) {
    if (index >= 0 && index < state.questions.length) {
      state.current = index;
      render();
    }
  }

  function nextQ() { goTo(state.current + 1); }
  function prevQ() { goTo(state.current - 1); }

  function selectAnswer(optionIndex) {
    state.answers[state.current] = optionIndex;
    render();
  }

  function toggleFlag() {
    if (state.flagged.has(state.current)) {
      state.flagged.delete(state.current);
    } else {
      state.flagged.add(state.current);
    }
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

  function submit() {
    stopTimer();

    const results = buildResults();
    if (state.onComplete) {
      state.onComplete(results);
    } else {
      App.navigate('result', results);
    }
  }

  function buildResults() {
    const qs = state.questions;
    let correct = 0, incorrect = 0, unattempted = 0;
    let neetScore = 0;
    const questionResults = [];

    qs.forEach((q, i) => {
      const selected = state.answers[i];
      let status;
      if (selected === undefined || selected === null) {
        status = 'skipped';
        unattempted++;
      } else if (selected === q.correct) {
        status = 'correct';
        correct++;
        neetScore += 4;
      } else {
        status = 'incorrect';
        incorrect++;
        neetScore -= 1;
      }
      questionResults.push({
        questionId: q.id,
        question: q,
        selected,
        status,
        errorType: null, // to be tagged by student
      });
    });

    const accuracy = qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0;

    return {
      mode: state.mode,
      meta: state.meta,
      totalQuestions: qs.length,
      correct,
      incorrect,
      unattempted,
      neetScore: Math.max(0, neetScore),
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

  /* ---- Public API ---- */
  return { start, goTo, nextQ, prevQ, selectAnswer, toggleFlag, confirmSubmit };

})();

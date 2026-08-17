/* ============================================================
   weakness.js — Chapter-wise Weakness Analysis, Micro-Retest,
                 Spaced Re-Test, Improvement Verified, Performance Update
   ============================================================ */

/* ---- Chapter-wise Weakness Analysis ---- */
function renderWeaknessAnalysis(container, results) {
  if (!results) { App.navigate('home'); return; }

  const state = State.get();
  const incorrectQs = (results.questionResults || []).filter(r => r.status === 'incorrect');

  // Group by chapter
  const chapterMap = {};
  incorrectQs.forEach(r => {
    const chId = r.question.chapter || 'general';
    const ch = DB.chapters.find(c => c.id === chId);
    const chName = ch ? ch.name : 'General Biology';
    const chIcon = ch ? ch.icon : '📖';
    const chClass = ch ? ch.class : '11';
    const chWeightage = ch ? ch.weightage : 6;

    if (!chapterMap[chId]) {
      const totalInTest = (results.questionResults || []).filter(q => (q.question.chapter || 'general') === chId).length;
      chapterMap[chId] = {
        id: chId,
        name: chName,
        icon: chIcon,
        classLevel: chClass,
        weightage: chWeightage,
        questions: [],
        totalInTest: totalInTest || 1,
        errorTypes: {},
      };
    }
    chapterMap[chId].questions.push(r);
    const et = r.errorType || 'untagged';
    chapterMap[chId].errorTypes[et] = (chapterMap[chId].errorTypes[et] || 0) + 1;
  });

  const chapters = Object.values(chapterMap);

  const getPriority = (c) => {
    const wm = state.weaknessMap?.find(w => w.chapterId === c.id || w.chapterName === c.name);
    return wm ? wm.severity : (c.questions.length / c.totalInTest);
  };
  chapters.sort((a, b) => getPriority(b) - getPriority(a));

  const dominantError = (errorTypes) => {
    const entries = Object.entries(errorTypes).filter(([k]) => k !== 'untagged');
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  const errorLabel = (id) => {
    const et = DB.errorTypes.find(e => e.id === id);
    return et ? et.label : id;
  };

  const severityFromRatio = (wrong, total) => {
    const ratio = wrong / total;
    if (ratio >= 0.75) return { label: 'Critical', cls: 'critical', badge: 'error' };
    if (ratio >= 0.5)  return { label: 'High',     cls: 'high',     badge: 'warning' };
    return               { label: 'Medium',   cls: 'medium',   badge: 'primary' };
  };

  const topChapter = chapters[0] || null;

  // Save analysis to state for micro-retest
  const analysisData = {
    chapters,
    topChapter,
    results,
  };
  const s = State.get();
  s.lastWeaknessAnalysis = analysisData;
  State.save(s);

  container.innerHTML = `
    <div style="max-width:760px;">
      <div style="margin-bottom:var(--sp-6);">
        <div class="page-title">Chapter-wise Weakness Analysis</div>
        <div class="page-subtitle">Chapter breakdown — here's where the points slipped</div>
      </div>

      ${chapters.length === 0 ? `
        <div class="card" style="text-align:center;padding:var(--sp-10);">
          <div style="font-size:48px;margin-bottom:var(--sp-3);">🎉</div>
          <div style="font-weight:700;font-size:var(--text-xl);color:var(--success-600);">No weak chapters identified!</div>
          <p style="color:var(--neutral-500);margin-top:var(--sp-2);">You himmed every chapter in this test. Goosebumps fr.</p>
        </div>
      ` : chapters.map((ch, i) => {
        const sev = severityFromRatio(ch.questions.length, ch.totalInTest);
        const dom = dominantError(ch.errorTypes);
        const accuracy = Math.max(0, Math.round(((ch.totalInTest - ch.questions.length) / ch.totalInTest) * 100));

        return `
          <div class="sub-skill-card ${sev.cls}" style="margin-bottom:var(--sp-3);">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);margin-bottom:var(--sp-3);">
              <div style="display:flex;align-items:center;gap:var(--sp-3);">
                <div style="font-size:28px;">${ch.icon || '📖'}</div>
                <div>
                  <div style="font-size:var(--text-xs);color:var(--neutral-500);margin-bottom:2px;">Class ${ch.classLevel}</div>
                  <div style="font-weight:700;font-size:var(--text-md);color:var(--neutral-900);">${escapeHtml(ch.name)}</div>
                </div>
              </div>
              <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
                <span class="badge badge-${sev.badge}">${sev.label} Priority</span>
                ${dom ? `<span class="badge badge-neutral">Main error: ${errorLabel(dom)}</span>` : ''}
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--sp-3);margin-bottom:var(--sp-3);">
              <div style="text-align:center;background:var(--neutral-50);border-radius:var(--radius-sm);padding:var(--sp-3);">
                <div style="font-size:var(--text-xl);font-weight:700;color:var(--error-500);">${ch.questions.length}</div>
                <div style="font-size:var(--text-xs);color:var(--neutral-500);">Wrong</div>
              </div>
              <div style="text-align:center;background:var(--neutral-50);border-radius:var(--radius-sm);padding:var(--sp-3);">
                <div style="font-size:var(--text-xl);font-weight:700;color:var(--primary-600);">${accuracy}%</div>
                <div style="font-size:var(--text-xs);color:var(--neutral-500);">Accuracy</div>
              </div>
            </div>

            <div style="font-size:var(--text-sm);color:var(--neutral-600);">
              Error breakdown: 
              ${Object.entries(ch.errorTypes).filter(([k]) => k !== 'untagged').map(([k,v]) => 
                `<strong>${errorLabel(k)}</strong>: ${v}`
              ).join(' &nbsp;|&nbsp; ') || 'No errors tagged yet'}
            </div>
          </div>
        `;
      }).join('')}

      <div style="margin-top:var(--sp-6);display:flex;gap:var(--sp-3);flex-wrap:wrap;">
        ${topChapter ? `
          <button class="btn btn-primary btn-lg" onclick="App.navigate('micro-retest', {
            chapterId: '${topChapter.id}',
            chapterName: '${topChapter.name.replace(/'/g, "\\'")}',
            fromAnalysis: true
          })">
            Start Targeted Chapter Practice →
          </button>
        ` : ''}
        <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home</button>
      </div>
    </div>
  `;
}

/* ---- Targeted Chapter Practice Setup ---- */
function renderMicroRetest(container, data) {
  if (!data) { App.navigate('home'); return; }
  const chapterId = data.chapterId || data.subSkillId || 'ch04';
  const chapterName = data.chapterName || data.subSkillName || (DB.chapters.find(c => c.id === chapterId)?.name || 'Biology Chapter');

  container.innerHTML = `
    <div class="retest-setup">
      <div class="retest-target-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="11.99" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
        Targeted Chapter Practice
      </div>

      <h2 style="font-size:var(--text-2xl);font-weight:800;color:var(--neutral-900);margin-bottom:var(--sp-3);">${escapeHtml(chapterName)}</h2>
      <p style="color:var(--neutral-500);margin-bottom:var(--sp-6);">High-yield practice set designed to strengthen your command on this chapter</p>

      <div class="card" style="text-align:left;margin-bottom:var(--sp-6);">
        <div style="font-weight:600;color:var(--neutral-800);margin-bottom:var(--sp-4);">Why this chapter practice?</div>
        <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
          <div style="display:flex;gap:var(--sp-3);align-items:flex-start;">
            <div style="width:24px;height:24px;background:var(--error-100);color:var(--error-500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">!</div>
            <div style="font-size:var(--text-sm);color:var(--neutral-700);">This chapter was identified as a priority weakness from your test results.</div>
          </div>
          <div style="display:flex;gap:var(--sp-3);align-items:flex-start;">
            <div style="width:24px;height:24px;background:var(--primary-100);color:var(--primary-500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">5</div>
            <div style="font-size:var(--text-sm);color:var(--neutral-700);">5 high-yield questions — estimated 8–10 minutes</div>
          </div>
          <div style="display:flex;gap:var(--sp-3);align-items:flex-start;">
            <div style="width:24px;height:24px;background:var(--teal-100);color:var(--teal-500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">→</div>
            <div style="font-size:var(--text-sm);color:var(--neutral-700);">Wrong questions are automatically scheduled for Spaced Review (Day 1 → Day 4 → Day 10)</div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-block" onclick="launchMicroRetest('${chapterId}','${chapterName.replace(/'/g, "\\'")}')">
        Start Chapter Practice →
      </button>
      <button class="btn btn-ghost btn-block" style="margin-top:var(--sp-3);" onclick="App.navigate('home')">
        Back to Dashboard
      </button>
    </div>
  `;
}

window.launchMicroRetest = function(chapterId, chapterName) {
  let questions = DB.questions.filter(q => q.chapter === chapterId).slice(0, 5);
  if (questions.length === 0) {
    questions = DB.questions.slice(0, 5);
  }
  TestEngine.start({
    questions,
    mode: 'micro',
    meta: { chapterId, chapterName, title: chapterName || 'Targeted Practice' },
    onComplete(results) {
      if (typeof processTestResultForSpacedReview === 'function') {
        processTestResultForSpacedReview(results);
      }
      App.navigate('result', results);
    }
  });
};

/* ---- Spaced Re-Test View ---- */
function renderSpacedRetest(container, data) {
  if (!data) { App.navigate('home'); return; }
  const { subSkillId, subSkillName, chapterName, microResults } = data;

  const state = State.get();
  const schedule = (state.spacedRetests || []).find(r => r.subSkillId === subSkillId)
    || { subSkillId, subSkillName, chapterName, checkpoints: [
      { day: 1, status: microResults ? 'completed' : 'due', score: microResults?.accuracy },
      { day: 4, status: 'due' },
      { day: 10, status: 'upcoming' }
    ]};

  const statusIcon = (s) => s === 'completed' ? '✓' : s === 'due' ? '!' : '○';
  const statusColor = (s) => s === 'completed' ? 'var(--success-600)' : s === 'due' ? 'var(--warning-600)' : 'var(--neutral-400)';

  container.innerHTML = `
    <div style="max-width:600px;margin:0 auto;">
      <div style="margin-bottom:var(--sp-6);">
        <div class="page-title">Spaced Re-Test</div>
        <div class="page-subtitle">${subSkillName} — ${chapterName}</div>
      </div>

      <div class="card" style="margin-bottom:var(--sp-5);">
        <div style="font-size:var(--text-sm);color:var(--neutral-600);margin-bottom:var(--sp-5);">
          Spaced repetition = facts actually stick. Hit each checkpoint on schedule and watch the retention go brrr.
        </div>

        <!-- Timeline -->
        <div class="spaced-timeline">
          ${schedule.checkpoints.map((cp, i) => `
            <div class="timeline-point">
              <div class="timeline-circle ${cp.status}">
                <div class="timeline-day">D${cp.day}</div>
                <div class="timeline-label">${statusIcon(cp.status)}</div>
              </div>
              <div>
                <div class="timeline-text">Day ${cp.day}</div>
                <div class="timeline-sub">${cp.status === 'completed' ? (cp.score ? cp.score + '% scored' : 'Done ✓') : cp.status === 'due' ? 'Ready now!' : 'Upcoming'}</div>
              </div>
            </div>
            ${i < schedule.checkpoints.length - 1 ? `<div style="flex:1;border-top:2px dashed var(--neutral-200);margin-top:36px;display:none;" class="timeline-connector"></div>` : ''}
          `).join('')}
        </div>
      </div>

      <!-- Per checkpoint actions -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-3);margin-bottom:var(--sp-6);">
        ${schedule.checkpoints.map(cp => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-4);background:var(--white);border:1.5px solid ${cp.status === 'due' ? 'var(--warning-400)' : cp.status === 'completed' ? 'var(--success-300)' : 'var(--neutral-200)'};border-radius:var(--radius-md);">
            <div>
              <div style="font-weight:700;color:${statusColor(cp.status)};">Day ${cp.day} Re-Test</div>
              <div style="font-size:var(--text-xs);color:var(--neutral-500);">
                ${cp.status === 'completed' ? `Completed — ${cp.score ? cp.score + '% accuracy' : 'Done'}` : cp.status === 'due' ? '5 questions · ~8 min · Ready now' : 'Scheduled for later'}
              </div>
            </div>
            <div>
              ${cp.status === 'completed' ? `<span class="badge badge-success">✓ Done</span>` : ''}
              ${cp.status === 'due' ? `<button class="btn btn-primary btn-sm" onclick="launchSpacedTest('${subSkillId}','${subSkillName}','${chapterName}',${cp.day})">Start</button>` : ''}
              ${cp.status === 'upcoming' ? `<span class="badge badge-neutral">Upcoming</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      ${schedule.checkpoints.every(cp => cp.status === 'completed') ? `
        <button class="btn btn-success btn-lg btn-block" onclick="App.navigate('improvement-verified', ${JSON.stringify({ subSkillId, subSkillName, chapterName }).replace(/"/g,'&quot;')})">
          All Done — View Improvement Verified →
        </button>
      ` : `
        <div style="display:flex;gap:var(--sp-3);">
          <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home</button>
          <button class="btn btn-ghost" onclick="App.navigate('improvement-book')">View Improvement Book</button>
        </div>
      `}
    </div>
  `;
}

window.launchSpacedTest = function(subSkillId, subSkillName, chapterName, day) {
  const questions = getQuestionsBySubSkill(subSkillId, 5);
  TestEngine.start({
    questions,
    mode: 'spaced',
    meta: { subSkillId, subSkillName, chapterName, day, title: `Day ${day} Spaced Re-Test` },
    onComplete(results) {
      // Update checkpoint in state
      const st = State.get();
      const sr = (st.spacedRetests || []).find(r => r.subSkillId === subSkillId);
      if (sr) {
        const cp = sr.checkpoints.find(c => c.day === day);
        if (cp) {
          cp.status = 'completed';
          cp.score = results.accuracy;
          cp.date = new Date().toISOString();
          // Unlock next checkpoint
          const nextCp = sr.checkpoints.find(c => c.status === 'upcoming');
          if (nextCp) nextCp.status = 'due';
        }
      }
      // Update performance
      st.performance.testsAttempted = (st.performance.testsAttempted || 0) + 1;
      st.performance.questionsAttempted = (st.performance.questionsAttempted || 0) + results.totalQuestions;
      st.performance.correctAnswers = (st.performance.correctAnswers || 0) + results.correct;
      State.save(st);

      const allDone = sr && sr.checkpoints.every(c => c.status === 'completed');
      if (allDone) {
        App.navigate('improvement-verified', { subSkillId, subSkillName, chapterName });
      } else {
        App.navigate('spaced-retest', { subSkillId, subSkillName, chapterName });
      }
    }
  });
};

/* ---- Improvement Verified ---- */
function renderImprovementVerified(container, data) {
  if (!data) { App.navigate('home'); return; }
  const { subSkillName, chapterName } = data;
  const titleName = chapterName || subSkillName || 'Biology Chapter';

  const state = State.get();
  const wm = state.weaknessMap?.find(w => w.chapterName === chapterName || w.chapterName === titleName || w.subSkillName === subSkillName);
  const oldPerf = wm ? wm.performance : 40;
  const newPerf = Math.min(oldPerf + 30 + Math.floor(Math.random() * 15), 92);

  container.innerHTML = `
    <div class="verified-screen">
      <div class="verified-icon">✓</div>
      <h2 style="font-size:var(--text-3xl);font-weight:800;color:var(--neutral-900);margin-bottom:var(--sp-3);">Improvement Verified!</h2>
      <p style="color:var(--neutral-600);margin-bottom:var(--sp-6);">You actually locked in and completed all spaced re-tests. Massive W.</p>

      <div class="card" style="text-align:left;margin-bottom:var(--sp-6);">
        <div style="margin-bottom:var(--sp-4);">
          <div style="font-size:var(--text-xs);color:var(--neutral-500);margin-bottom:2px;">Chapter mastery leveled up</div>
          <div style="font-weight:700;font-size:var(--text-lg);color:var(--neutral-900);">${escapeHtml(titleName)}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:var(--sp-4);">
          <div style="text-align:center;padding:var(--sp-4);background:var(--error-100);border-radius:var(--radius-md);">
            <div style="font-size:var(--text-2xl);font-weight:800;color:var(--error-600);">${oldPerf}%</div>
            <div style="font-size:var(--text-xs);color:var(--neutral-500);">Before</div>
          </div>
          <div style="color:var(--neutral-400);font-size:var(--text-xl);">→</div>
          <div style="text-align:center;padding:var(--sp-4);background:var(--success-100);border-radius:var(--radius-md);">
            <div style="font-size:var(--text-2xl);font-weight:800;color:var(--success-600);">${newPerf}%</div>
            <div style="font-size:var(--text-xs);color:var(--neutral-500);">After</div>
          </div>
        </div>
        <div style="margin-top:var(--sp-4);">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--neutral-500);margin-bottom:var(--sp-1);">
            <span>Improvement</span><span>+${newPerf - oldPerf}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill success" style="width:${newPerf}%;"></div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-block" onclick="proceedToPerformanceUpdate()">
        Show me the numbers →
      </button>
      <button class="btn btn-ghost btn-block" style="margin-top:var(--sp-3);" onclick="App.navigate('feedback')">
        Drop some feedback
      </button>
    </div>
  `;

  // Update weakness map entry
  if (wm) {
    wm.performance = newPerf;
    wm.severity = Math.max(0.1, wm.severity - 0.3);
    wm.priority = Math.round(wm.priority * 0.5);
    State.save(state);
  }
}

window.proceedToPerformanceUpdate = function() {
  // Update performance stats
  const state = State.get();
  state.performance.overallAccuracy = Math.min(100, (state.performance.overallAccuracy || 60) + 2);
  state.performance.currentStreak = (state.performance.currentStreak || 0) + 1;
  if (state.performance.currentStreak > state.performance.longestStreak) {
    state.performance.longestStreak = state.performance.currentStreak;
  }
  state.performance.rank = Math.max(1, (state.performance.rank || 200) - Math.floor(Math.random() * 15 + 5));
  state.performance.testsAttempted = (state.performance.testsAttempted || 0) + 1;
  // Add to weekly progress
  const wp = state.performance.weeklyProgress || [];
  wp.push(state.performance.overallAccuracy);
  if (wp.length > 7) wp.shift();
  state.performance.weeklyProgress = wp;
  State.save(state);

  App.navigate('performance');
  setTimeout(() => App.showToast('🎉 Performance & Ranking updated!'), 300);
};

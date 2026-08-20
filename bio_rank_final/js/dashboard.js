/* ============================================================
   dashboard.js — Home, Weakness Map, PYQ, Chapter, Improvement, Performance screens
   ============================================================ */

/* ---- Student Configuration ---- */
function renderConfig(container) {
  const state = State.get();
  const student = state.student || {};
  const currentClass = student.classLevel || '12th';
  const currentYear = student.targetYear || '2025';
  const currentBoard = student.board || 'CBSE';
  const currentHours = student.studyHoursPerDay || '4';
  const currentConfidence = student.confidence || 'Intermediate';

  const isClass11 = currentClass === '11th';

  container.innerHTML = `
    <div class="config-screen">
      <div class="config-logo">
        <img src="/logo-square.jpg" alt="Bio Rank Logo" class="config-logo-img" style="width:76px;height:76px;border-radius:var(--radius-xl);object-fit:cover;margin:0 auto var(--sp-4);box-shadow:0 8px 24px rgba(6,78,59,0.22);border:2px solid #ecfdf5;display:block;" />
        <h1 style="font-size:var(--text-3xl);font-weight:800;color:var(--neutral-900);">Welcome to Bio Rank</h1>
        <p style="color:var(--neutral-500);margin-top:var(--sp-2);">NEET Biology, but make it actually fun. No cap.</p>
      </div>

      <div class="card card-lg">
        <div style="margin-bottom:var(--sp-5);">
          <div class="section-title" style="font-size:var(--text-lg);">Student Setup</div>
          <div class="section-subtitle">This helps us personalise your test experience</div>
        </div>

        <form class="config-form" id="config-form" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label" for="cfg-name">Full Name *</label>
            <input class="form-input" id="cfg-name" type="text" value="${escapeHtml(student.name || '')}" placeholder="e.g. Aryan Sharma" required autocomplete="name" />
          </div>

          <div class="form-group">
            <label class="form-label" for="cfg-class">Current Class / Preparation Stage *</label>
            <select class="form-input form-select" id="cfg-class" onchange="onConfigClassChange(this.value)">
              <option value="11th" ${currentClass === '11th' ? 'selected' : ''}>Class 11th (Targeting Foundation)</option>
              <option value="12th" ${currentClass === '12th' ? 'selected' : ''}>Class 12th (Board + NEET)</option>
              <option value="Dropper" ${currentClass === 'Dropper' ? 'selected' : ''}>Dropper / Repeater (Full Focus NEET)</option>
            </select>
          </div>

          <div class="grid-2" style="gap:var(--sp-4);">
            <div class="form-group">
              <label class="form-label" for="cfg-year">Target Year</label>
              <select class="form-input form-select" id="cfg-year">
                <option value="2025" ${currentYear === '2025' ? 'selected' : ''}>NEET 2025</option>
                <option value="2026" ${currentYear === '2026' ? 'selected' : ''}>NEET 2026</option>
                <option value="2027" ${currentYear === '2027' ? 'selected' : ''}>NEET 2027</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="cfg-board">School Board</label>
              <select class="form-input form-select" id="cfg-board">
                <option value="CBSE" ${currentBoard === 'CBSE' ? 'selected' : ''}>CBSE</option>
                <option value="State" ${currentBoard === 'State' ? 'selected' : ''}>State Board</option>
                <option value="ICSE" ${currentBoard === 'ICSE' ? 'selected' : ''}>ICSE</option>
                <option value="Other" ${currentBoard === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="cfg-hours">Daily Study Hours</label>
            <select class="form-input form-select" id="cfg-hours">
              <option value="2" ${currentHours === '2' ? 'selected' : ''}>2 hours</option>
              <option value="4" ${currentHours === '4' ? 'selected' : ''}>4 hours</option>
              <option value="6" ${currentHours === '6' ? 'selected' : ''}>6 hours</option>
              <option value="8" ${currentHours === '8' ? 'selected' : ''}>8+ hours</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Current Biology Confidence</label>
            <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;" id="cfg-confidence">
              ${['Beginner','Intermediate','Advanced'].map(l =>
                `<button type="button" class="error-tag ${currentConfidence === l ? 'selected' : ''}" data-confidence="${l}" onclick="selectConfidence(this)">${l}</button>`
              ).join('')}
            </div>
          </div>

          <div id="cfg-flow-banner" style="padding:var(--sp-4);background:var(--primary-50);border-radius:var(--radius-md);font-size:var(--text-sm);color:var(--primary-700);margin-bottom:var(--sp-4);">
            ${isClass11
              ? '<strong>Class 11th Plan:</strong> You will go directly to your dashboard to start chapter tests and practice without an initial diagnostic test.'
              : '<strong>Optional Diagnostic Test:</strong> Take a quick 20-question vibe check to map your chapter weaknesses, or skip directly to your dashboard.'
            }
          </div>

          <div id="cfg-action-buttons">
            ${isClass11 ? `
              <button type="button" class="btn btn-primary btn-lg btn-block" onclick="submitConfig(true)">
                ${state.configured ? 'Save Details & Go to Dashboard →' : 'Save Details & Go to Dashboard →'}
              </button>
            ` : `
              <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
                <button type="button" class="btn btn-primary btn-lg btn-block" onclick="submitConfig(false)">
                  Take Diagnostic Vibe Check (Recommended) →
                </button>
                <button type="button" class="btn btn-outline btn-block" onclick="submitConfig(true)">
                  Skip Test &amp; Go to Dashboard →
                </button>
              </div>
            `}
          </div>
        </form>
      </div>
    </div>
  `;
}

window.selectConfidence = function(btn) {
  document.querySelectorAll('[data-confidence]').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
};

window.onConfigClassChange = function(classVal) {
  const is11 = classVal === '11th';
  const banner = document.getElementById('cfg-flow-banner');
  const btns = document.getElementById('cfg-action-buttons');
  if (banner) {
    banner.innerHTML = is11
      ? '<strong>Class 11th Plan:</strong> You will go directly to your dashboard to start chapter tests and practice without an initial diagnostic test.'
      : '<strong>Optional Diagnostic Test:</strong> Take a quick 20-question vibe check to map your chapter weaknesses, or skip directly to your dashboard.';
  }
  if (btns) {
    btns.innerHTML = is11 ? `
      <button type="button" class="btn btn-primary btn-lg btn-block" onclick="submitConfig(true)">
        Save Details &amp; Go to Dashboard →
      </button>
    ` : `
      <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
        <button type="button" class="btn btn-primary btn-lg btn-block" onclick="submitConfig(false)">
          Take Diagnostic Vibe Check (Recommended) →
        </button>
        <button type="button" class="btn btn-outline btn-block" onclick="submitConfig(true)">
          Skip Test &amp; Go to Dashboard →
        </button>
      </div>
    `;
  }
};

window.submitConfig = function(skipTest = false) {
  const name = document.getElementById('cfg-name').value.trim();
  if (!name) { App.showToast('Please enter your name'); return; }
  const classLevel = document.getElementById('cfg-class').value;
  const year       = document.getElementById('cfg-year').value;
  const board      = document.getElementById('cfg-board').value;
  const hours      = document.getElementById('cfg-hours').value;
  const conf       = document.querySelector('[data-confidence].selected');

  const state = State.get();
  state.student = {
    ...(state.student || {}),
    name,
    classLevel: classLevel || '12th',
    targetYear: year,
    board,
    studyHoursPerDay: hours,
    confidence: conf ? conf.dataset.confidence : 'Intermediate',
  };
  state.performance.studentName = name;
  state.configured = true;

  // Sync with backend profile API if authenticated
  if (window.ApiClient && ApiClient.getToken()) {
    ApiClient.put('/user/profile', {
      name,
      classLevel: classLevel || '12th',
      targetYear: year,
      board,
      studyHoursPerDay: hours,
      configured: true,
      foundationDone: classLevel === '11th' || skipTest,
    }).catch(err => console.warn('Profile background sync:', err));
  }

  // Class 11th OR user chosen to skip diagnostic test:
  if (classLevel === '11th' || skipTest) {
    state.foundationDone = true;
    State.save(state);
    App.showToast(`Welcome ${name}! Your dashboard is ready.`);
    App.navigate('home');
    return;
  }

  // Class 12th or Dropper starting diagnostic test:
  State.save(state);
  App.navigate('foundation');
};

/* ---- Foundation Assessment ---- */
function renderFoundation(container) {
  const questionIds = DB.foundationQuestions;
  const questions = getQuestionsByIds(questionIds);
  TestEngine.start({
    questions,
    mode: 'foundation',
    meta: { title: 'Foundation Assessment' },
    onComplete(results) {
      App.navigate('analyzing', results);
    }
  });
}

/* ---- Analyzing State ---- */
function renderAnalyzing(container, results) {
  container.innerHTML = `
    <div class="loading-screen">
      <div class="loading-spinner"></div>
      <h2 style="font-size:var(--text-2xl);font-weight:700;color:var(--neutral-900);margin-bottom:var(--sp-3);">Analyzing Your Chapters...</h2>
      <p style="color:var(--neutral-500);line-height:1.7;">Mapping chapter-wise strengths and identifying priority areas to maximize your NEET Biology score.</p>
      <div class="loading-dots" style="margin-top:var(--sp-6);">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    </div>
  `;

  // Compute Chapter-wise Weakness Map from results
  const state = State.get();
  state.foundationDone = true;
  if (results) {
    state.lastTestResult = results;
    if (results.questionResults && results.questionResults.length > 0) {
      const chapterMap = {};
      results.questionResults.forEach(r => {
        const chId = r.question.chapter || 'ch01';
        if (!chapterMap[chId]) {
          const chObj = DB.chapters.find(c => c.id === chId) || { id: chId, name: 'Biology Chapter', icon: '📖', weightage: 6, class: '11' };
          chapterMap[chId] = {
            chapterId: chId,
            chapterName: chObj.name,
            icon: chObj.icon || '📖',
            classLevel: chObj.class || '11',
            weightage: chObj.weightage || 6,
            total: 0,
            incorrect: 0,
            correct: 0,
          };
        }
        chapterMap[chId].total++;
        if (r.status === 'correct') chapterMap[chId].correct++;
        if (r.status === 'incorrect') chapterMap[chId].incorrect++;
      });

      const newWeaknessMap = Object.values(chapterMap).map(ch => {
        const accuracy = ch.total > 0 ? Math.round((ch.correct / ch.total) * 100) : 0;
        const severity = ch.total > 0 ? (ch.incorrect / ch.total) : 0.5;
        const priority = Math.round(severity * ch.weightage * 10);
        return {
          chapterId: ch.chapterId,
          chapterName: ch.chapterName,
          icon: ch.icon,
          classLevel: ch.classLevel,
          weightage: ch.weightage,
          severity,
          performance: accuracy,
          questionsWrong: ch.incorrect,
          totalQuestions: ch.total,
          priority,
          daysToExam: 120,
        };
      });

      newWeaknessMap.sort((a, b) => b.priority - a.priority || b.severity - a.severity);
      state.weaknessMap = newWeaknessMap;
    }
  }
  State.save(state);

  setTimeout(() => App.navigate('weakness-map'), 2400);
}

/* ---- Weakness Map (Chapter-wise) ---- */
function renderWeaknessMap(container) {
  const state = State.get();
  const items = state.weaknessMap || DB.weaknessMap;

  const severityLabel = s => s >= 0.75 ? 'Critical' : s >= 0.5 ? 'High' : s >= 0.25 ? 'Medium' : 'Low';
  const severityColor = s => s >= 0.75 ? 'error' : s >= 0.5 ? 'warning' : s >= 0.25 ? 'primary' : 'teal';
  const barColor = s => s >= 0.75 ? 'var(--error-500)' : s >= 0.5 ? 'var(--warning-500)' : 'var(--primary-500)';

  container.innerHTML = `
    <div style="max-width:760px;">
      <div style="margin-bottom:var(--sp-6);">
        <div class="page-title">Chapter-wise Weakness Map</div>
        <div class="page-subtitle">Ranked by chapter priority. Let's conquer the weak chapters.</div>
      </div>

      <div class="meme-banner">Chapter diagnostic complete. Here is your chapter-by-chapter priority breakdown.</div>

      <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
        ${items.map((w, i) => `
          <div class="weakness-item">
            <div class="weakness-header" style="align-items:center;">
              <div style="display:flex;align-items:center;gap:var(--sp-3);">
                <div style="font-size:28px;">${w.icon || '📖'}</div>
                <div>
                  <div style="font-size:var(--text-xs);font-weight:700;color:var(--neutral-500);text-transform:uppercase;letter-spacing:0.5px;">#${i + 1} Priority Chapter</div>
                  <div class="weakness-name" style="font-size:var(--text-md);">${escapeHtml(w.chapterName)}</div>
                  <div style="font-size:var(--text-xs);color:var(--neutral-500);margin-top:2px;">
                    ${w.classLevel ? `Class ${w.classLevel}` : 'NEET Syllabus'}
                  </div>
                </div>
              </div>
              <div class="weakness-meta" style="align-items:flex-end;">
                <span class="badge badge-${severityColor(w.severity)}">${severityLabel(w.severity)}</span>
                <button class="btn btn-outline btn-sm" onclick="App.navigate('chapter-test')">
                  Practice Chapter →
                </button>
              </div>
            </div>
            <div>
              <div class="weakness-bar-row">
                <span class="weakness-bar-label">Chapter Mastery</span>
                <div class="weakness-bar-track">
                  <div class="weakness-bar-fill" style="width:${w.performance}%;background:${barColor(w.severity)};border-radius:var(--radius-full);height:100%;"></div>
                </div>
                <span style="font-size:var(--text-xs);font-weight:700;color:var(--neutral-700);min-width:36px;text-align:right;">${w.performance}%</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:var(--sp-6);display:flex;gap:var(--sp-3);justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary btn-lg" onclick="App.navigate('home')">
          Take me to Home Dashboard →
        </button>
        <button class="btn btn-secondary btn-lg" onclick="App.navigate('chapter-test')">
          Explore Chapter Tests
        </button>
      </div>
    </div>
  `;
}

/* ---- Personalised Home ---- */
function renderHome(container) {
  const state = State.get();
  const perf = state.performance;
  const name = state.student.name || 'Student';
  const topWeakness = state.weaknessMap?.[0];
  const earnedBadges = (perf.badges || []).filter(b => b.earned);
  const lockedBadges = (perf.badges || []).filter(b => !b.earned);
  const allBadges = perf.badges || [];
  const badgeProgress = Math.round((earnedBadges.length / allBadges.length) * 100);
  const desc = DB.badgeDescriptions || {};

  const examMode = state.examMode || 'NEET';
  const isCuet = examMode === 'CUET';
  const classTag = isCuet ? 'CUET UG &middot; Class 12th' : (state.student?.classLevel ? `Class ${state.student.classLevel}` : 'NEET Prep');
  const streakCount = perf.currentStreak || 0;

  container.innerHTML = `
    <!-- Hero Section -->
    <div class="home-hero" style="margin-bottom:var(--sp-6);">
      <div class="hero-content">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:var(--sp-3);flex-wrap:wrap;">
          <img src="logo-square.jpg" alt="Bio Rank Logo" style="width:44px;height:44px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,0.18);border:2px solid rgba(255,255,255,0.35);object-fit:cover;" />
          <div class="hero-badge" style="margin-bottom:0;">
            ${isCuet ? '🔵 CUET (UG) Biological Studies &middot; Target 200/200' : '🎯 NEET Biology Prep &middot; Target 360/360'}
          </div>
        </div>
        <h1 class="hero-title">${isCuet ? 'Master CUET Biology. Secure Top Universities.' : 'Dream big. Lock in. Make it happen.'}</h1>
        <p class="hero-subtitle">${isCuet ? '100% Class 12th NCERT line-by-line mastery, Case-Study passages, and timed 50-Q drills (+5 / -1 marking).' : 'Turn concepts into confidence and mistakes into mastery with daily focused chapter practice.'}</p>

        <div class="hero-footer">
          <div class="hero-greeting-box">
            <span class="hero-greeting">Good ${getTimeGreeting()}, <strong>${escapeHtml(name)}</strong> 👋</span>
            <span class="hero-pill-tag">🔥 ${streakCount} Day Streak</span>
            <span class="hero-pill-tag">${isCuet ? '🎓 CUET Mode' : `📚 ${escapeHtml(classTag)}`}</span>
          </div>
          <button class="hero-cta-btn" onclick="App.navigate(${isCuet ? "'full-length-test'" : "'chapter-test'"})">
            ${isCuet ? 'Take CUET Mock Test →' : 'Start Chapter Practice →'}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Layout: Slider + Ads -->
    <div class="home-main-layout">

      <!-- LEFT: Content Slider + existing content -->
      <div class="home-main-col">

        <!-- Content Slider -->
        <div class="hero-slider" id="hero-slider">
          <div class="slider-track" id="slider-track">
            ${(DB.homeSlides || []).map((s, i) => `
              <div class="slider-slide slider-theme-${s.theme || 'emerald'} ${i === 0 ? 'active' : ''}" data-index="${i}">
                <div class="slider-slide-bg slider-bg-${s.theme || 'emerald'}"></div>
                <div class="slider-slide-content">
                  <div class="slider-header-row">
                    <span class="slider-tag">${escapeHtml(s.tag || 'NEET 2025')}</span>
                    <span class="slider-badge-icon">${s.emoji}</span>
                  </div>
                  <h3 class="slider-title">${escapeHtml(s.title)}</h3>
                  <p class="slider-subtitle">${escapeHtml(s.subtitle)}</p>
                  <button class="slider-cta" onclick="App.navigate('${s.screen}')">${escapeHtml(s.cta)} →</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="slider-controls-bar">
            <div class="slider-dots" id="slider-dots">
              ${(DB.homeSlides || []).map((s, i) => `
                <button class="slider-dot ${i === 0 ? 'active' : ''}" onclick="HomeSlider.goTo(${i})" aria-label="Go to slide ${i + 1}"></button>
              `).join('')}
            </div>
            <div class="slider-arrows">
              <button class="slider-nav slider-prev" onclick="HomeSlider.prev()" aria-label="Previous slide">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button class="slider-nav slider-next" onclick="HomeSlider.next()" aria-label="Next slide">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Nav -->
        <div class="reveal">
          <div class="section-header">
            <div class="section-title">Quick Access</div>
          </div>
          <div class="quick-nav-grid">
            <div class="quick-nav-card" onclick="App.navigate('pyq-test')" role="button" tabindex="0">
              <div class="quick-nav-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <div class="quick-nav-label">PYQ Test</div>
                <div class="quick-nav-sub">2019–2024 papers</div>
              </div>
            </div>
            <div class="quick-nav-card" onclick="App.navigate('chapter-test')" role="button" tabindex="0">
              <div class="quick-nav-icon teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <div>
                <div class="quick-nav-label">Chapter Test</div>
                <div class="quick-nav-sub">${(DB.chapters || []).length} Biology chapters</div>
              </div>
            </div>
            <div class="quick-nav-card" onclick="App.navigate('ncert-bio-focus')" role="button" tabindex="0" style="position:relative;">
              <span class="flt-new-badge" style="background:var(--success-600);color:#fff;">Line-by-Line</span>
              <div class="quick-nav-icon green" style="background:var(--success-50);color:var(--success-600);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <div>
                <div class="quick-nav-label">NCERT Bio Focus</div>
                <div class="quick-nav-sub">Line-by-line NCERT mastery</div>
              </div>
            </div>
            <div class="quick-nav-card flt-quick-nav-card" onclick="App.navigate('full-length-test')" role="button" tabindex="0">
              <span class="flt-new-badge">New</span>
              <div class="quick-nav-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              <div>
                <div class="quick-nav-label">Full Length Test</div>
                <div class="quick-nav-sub">Complete NEET Biology mocks</div>
              </div>
            </div>
            <div class="quick-nav-card" onclick="App.navigate('improvement-book')" role="button" tabindex="0">
              <div class="quick-nav-icon orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              </div>
              <div>
                <div class="quick-nav-label">Improvement Book</div>
                <div class="quick-nav-sub">${state.weaknessMap?.length || 0} weak areas tracked</div>
              </div>
            </div>
            <div class="quick-nav-card" onclick="App.navigate('performance')" role="button" tabindex="0">
              <div class="quick-nav-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div>
                <div class="quick-nav-label">Performance & Ranking</div>
                <div class="quick-nav-sub">Rank #${perf.rank} of ${perf.totalStudents.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT: Advertisement Area -->
      <aside class="home-ad-sidebar" id="ad-sidebar">
        <div class="ad-header">Sponsored</div>
        <div class="ad-card ad-placeholder" data-ad-slot="1">
          <div class="ad-placeholder-icon">📢</div>
          <div class="ad-placeholder-text">Ad Banner<br><span>Your ad here</span></div>
        </div>
        <div class="ad-card ad-placeholder" data-ad-slot="2">
          <div class="ad-placeholder-icon">🎯</div>
          <div class="ad-placeholder-text">Ad Banner<br><span>Your ad here</span></div>
        </div>
        <div class="ad-card ad-placeholder" data-ad-slot="3">
          <div class="ad-placeholder-icon">💡</div>
          <div class="ad-placeholder-text">Ad Banner<br><span>Your ad here</span></div>
        </div>
      </aside>
    </div>

    <!-- Achievements & Badges Section -->
    <div class="badges-section reveal" style="margin-top:var(--sp-6);">
      <div class="badges-section-header">
        <div class="section-title" style="font-size:var(--text-base);">Achievements & Badges</div>
        <div class="badges-progress-pill">
          <div class="badges-progress-track">
            <div class="badges-progress-fill" style="width:${badgeProgress}%;"></div>
          </div>
          <span>${earnedBadges.length}/${allBadges.length} earned</span>
        </div>
      </div>

      ${earnedBadges.length > 0 ? `
        <div class="badge-group">
          <div class="badge-group-label">
            <span class="badge-group-dot earned"></span>Earned
          </div>
          <div class="home-badges-grid">
            ${earnedBadges.map(b => `
              <div class="home-badge-card earned" title="${desc[b.id] || ''}">
                <div class="home-badge-icon">${b.icon}</div>
                <div class="home-badge-name">${b.name}</div>
                <div class="home-badge-status earned">Earned</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${lockedBadges.length > 0 ? `
        <div class="badge-group">
          <div class="badge-group-label">
            <span class="badge-group-dot locked"></span>Locked
          </div>
          <div class="home-badges-grid">
            ${lockedBadges.map(b => `
              <div class="home-badge-card locked" title="${desc[b.id] || ''}">
                <div class="home-badge-icon">${b.icon}</div>
                <div class="home-badge-name">${b.name}</div>
                <div class="home-badge-status locked">Locked</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Initialize slider and scroll reveal
  HomeSlider.init();
  HomeReveal.init();
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/* ---- PYQ Test Screen ---- */
/* ---- PYQ Test Screen: Chapter-wise Biology PYQs ----
   Structure: NEET Biology → Chapter → PYQs. Year/Difficulty/Class are
   secondary filters over the chapter list, not primary navigation.
   Practice PYQs reuses the existing TestEngine (same engine Chapter
   Test uses) — no new question-taking UI was built. */
const PYQState = { search: '', classFilter: 'all', difficultyFilter: 'all', yearFilter: 'all' };

function pyqDifficultyOf(ch) {
  // Mock difficulty derived from existing weightage field (no separate
  // difficulty field exists on chapters/questions yet).
  if (ch.weightage >= 8) return 'Hard';
  if (ch.weightage >= 6) return 'Medium';
  return 'Easy';
}

function pyqFilteredChapters() {
  const q = PYQState.search.trim().toLowerCase();
  return DB.chapters.filter(ch => {
    if (q && !ch.name.toLowerCase().includes(q)) return false;
    if (PYQState.classFilter !== 'all' && ch.class !== PYQState.classFilter) return false;
    if (PYQState.difficultyFilter !== 'all' && pyqDifficultyOf(ch) !== PYQState.difficultyFilter) return false;
    if (PYQState.yearFilter !== 'all') {
      const hasYear = DB.questions.some(qn => qn.chapter === ch.id && qn.year === parseInt(PYQState.yearFilter, 10));
      if (!hasYear) return false;
    }
    return true;
  });
}

function pyqChapterCardHtml(ch) {
  const diff = pyqDifficultyOf(ch);
  const diffColor = diff === 'Hard' ? 'var(--error-600)' : diff === 'Medium' ? 'var(--warning-600)' : 'var(--success-600)';
  return `
    <div class="pyq-chapter-card">
      <div class="pyq-chapter-top">
        <span class="pyq-chapter-eyebrow">BIOLOGY &middot; CLASS ${ch.class}</span>
        <span class="pyq-chapter-diff" style="color:${diffColor};">${diff}</span>
      </div>
      <div class="pyq-chapter-icon">${ch.icon}</div>
      <div class="pyq-chapter-name">${ch.name}</div>
      <div class="pyq-chapter-count">${ch.questions} PYQs</div>
      <button class="btn btn-primary btn-sm btn-block" onclick="startPYQTest('${ch.id}','${ch.name.replace(/'/g, "\\'")}')">Practice PYQs →</button>
    </div>
  `;
}

function renderPYQChapterGrid() {
  const grid = document.getElementById('pyq-chapter-grid');
  if (!grid) return;
  const chapters = pyqFilteredChapters();
  grid.innerHTML = chapters.length
    ? chapters.map(pyqChapterCardHtml).join('')
    : `<div class="pyq-empty-state">No chapters match your search/filters. Try clearing them.</div>`;
}

function renderPYQFiltersAndGrid() {
  const wrap = document.getElementById('pyq-controls');
  if (!wrap) return;
  const years = DB.pyqYears.map(p => p.year);

  wrap.innerHTML = `
    <div class="pyq-search-wrap">
      <input
        type="text"
        id="pyq-search-input"
        class="form-input"
        placeholder="Search chapter — e.g. Genetics, Photosynthesis"
        value="${PYQState.search.replace(/"/g, '&quot;')}"
        oninput="PYQState.search=this.value; renderPYQChapterGrid();"
      />
    </div>

    <div class="pyq-filters">
      <div class="pyq-filter-group">
        <span class="pyq-filter-label">Class</span>
        ${['all', '11', '12'].map(v => `
          <button class="pyq-filter-chip ${PYQState.classFilter === v ? 'active' : ''}"
            onclick="PYQState.classFilter='${v}'; renderPYQFiltersAndGrid();">
            ${v === 'all' ? 'All' : 'Class ' + v}
          </button>
        `).join('')}
      </div>

      <div class="pyq-filter-group">
        <span class="pyq-filter-label">Difficulty</span>
        ${['all', 'Easy', 'Medium', 'Hard'].map(v => `
          <button class="pyq-filter-chip ${PYQState.difficultyFilter === v ? 'active' : ''}"
            onclick="PYQState.difficultyFilter='${v}'; renderPYQFiltersAndGrid();">
            ${v === 'all' ? 'All' : v}
          </button>
        `).join('')}
      </div>

      <div class="pyq-filter-group">
        <span class="pyq-filter-label">Year</span>
        <select class="pyq-year-select" onchange="PYQState.yearFilter=this.value; renderPYQChapterGrid();">
          <option value="all">All years</option>
          ${years.map(y => `<option value="${y}" ${PYQState.yearFilter == y ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="pyq-chapter-grid" id="pyq-chapter-grid">
      ${pyqFilteredChapters().map(pyqChapterCardHtml).join('')}
    </div>
  `;
}

function renderPYQTest(container) {
  // reset transient filter state each time the page is freshly opened
  PYQState.search = '';
  PYQState.classFilter = 'all';
  PYQState.difficultyFilter = 'all';
  PYQState.yearFilter = 'all';

  container.innerHTML = `
    <div class="pyq-layout">
      <div class="pyq-main-col">
        <div style="margin-bottom:var(--sp-5);">
          <div class="page-title">NEET Biology Previous Year Questions</div>
          <div class="page-subtitle">Practice chapter-wise NEET Biology PYQs and strengthen your prep.</div>
        </div>

        <div id="pyq-controls"></div>
      </div>

      <aside class="pyq-ad-sidebar" id="pyq-ad-sidebar">
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

  renderPYQFiltersAndGrid();
}

window.startPYQTest = function(chapterId, chapterName) {
  const questions = getQuestionsByChapter(chapterId, 15);
  if (questions.length === 0) { App.showToast('No PYQs available for this chapter yet'); return; }
  App.navigate('test', {
    questions,
    mode: 'pyq',
    meta: { chapterId, chapterName, title: `NEET Biology PYQ — ${chapterName}` }
  });
};

/* ---- Chapter-wise Test Screen ---- */
function renderChapterTest(container) {
  const state = State.get();
  container.innerHTML = `
    <div class="chtest-layout">
      <div class="chtest-main-col">
        <div style="margin-bottom:var(--sp-5);">
          <div class="page-title">Chapter-wise Test</div>
          <div class="page-subtitle">All ${(DB.chapters || []).length} chapters — pick your fighter</div>
        </div>

        <div class="chapter-grid">
          ${DB.chapters.map((ch, i) => {
            const prog = state.performance?.chapterProgress?.[ch.id] || 0;
            const progColor = prog >= 70 ? 'var(--success-500)' : prog >= 50 ? 'var(--primary-500)' : 'var(--neutral-400)';
            return `
              <div class="chapter-card" onclick="startChapterTest('${ch.id}','${ch.name}')" role="button" tabindex="0">
                <div class="chapter-card-top">
                  <div class="chapter-icon">${ch.icon}</div>
                  <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:var(--text-sm);font-weight:800;color:${progColor};">${prog || 0}%</div>
                    <div style="font-size:10px;color:var(--neutral-400);font-weight:600;">progress</div>
                  </div>
                </div>
                <div class="chapter-name">${ch.name}</div>
                <div class="chapter-meta">~${ch.questions} Qs</div>
                <div class="progress-bar" style="width:100%;height:4px;">
                  <div class="progress-fill ${prog >= 70 ? 'success' : prog >= 50 ? '' : 'error'}" style="width:${prog}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <aside class="chtest-ad-sidebar">
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

/* ---- Chapter Test Config State ---- */
const ChTestConfig = {
  chapterId: null,
  chapterName: null,
  chapterIcon: null,
  questionCount: 45,
  timeMin: 45,
};

/* ---- Open chapter config modal ---- */
window.startChapterTest = function(chapterId, chapterName) {
  const ch = DB.chapters.find(c => c.id === chapterId) || {};
  ChTestConfig.chapterId   = chapterId;
  ChTestConfig.chapterName = chapterName;
  ChTestConfig.chapterIcon = ch.icon || '📖';
  ChTestConfig.questionCount = 45;
  ChTestConfig.timeMin       = 45;

  // Remove any existing modal
  const old = document.getElementById('chtest-modal-backdrop');
  if (old) old.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'chtest-modal-backdrop';
  backdrop.className = 'chtest-modal-backdrop';
  backdrop.innerHTML = `
    <div class="chtest-modal" role="dialog" aria-modal="true" aria-labelledby="ctm-title">
      <div class="chtest-modal-handle"></div>

      <div class="chtest-modal-title">
        <span>${ch.icon || '📖'}</span>
        <span id="ctm-title">${escapeHtml(chapterName)}</span>
      </div>
      <div class="chtest-modal-sub">Customise your practice session before starting</div>

      <!-- Question Count -->
      <div class="chtest-modal-label">📝 How many questions?</div>
      <div class="chtest-pill-row" id="ctm-q-row">
        ${[30, 45, 60, 90].map(n => `
          <button class="chtest-pill${n === 45 ? ' selected' : ''}"
                  data-q="${n}"
                  onclick="ChTestConfig.setQ(${n})">
            ${n}
            <span>questions</span>
          </button>
        `).join('')}
      </div>

      <!-- Time Limit -->
      <div class="chtest-modal-label">⏱️ Time limit?</div>
      <div class="chtest-pill-row" id="ctm-t-row">
        ${[30, 45, 60, 90].map(m => `
          <button class="chtest-pill time-pill${m === 45 ? ' selected' : ''}"
                  data-t="${m}"
                  onclick="ChTestConfig.setT(${m})">
            ${m}
            <span>minutes</span>
          </button>
        `).join('')}
      </div>

      <div class="chtest-modal-divider"></div>

      <div class="chtest-modal-actions">
        <button class="btn btn-secondary" onclick="ChTestConfig.close()">Cancel</button>
        <button class="btn btn-primary" onclick="ChTestConfig.launch()">
          Start Test →
        </button>
      </div>
    </div>
  `;

  // Close on backdrop click (outside the modal card)
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) ChTestConfig.close();
  });

  document.body.appendChild(backdrop);
  document.body.classList.add('drawer-open'); // prevent background scroll
};

/* ---- Modal helpers ---- */
ChTestConfig.setQ = function(n) {
  ChTestConfig.questionCount = n;
  document.querySelectorAll('#ctm-q-row .chtest-pill').forEach(el => {
    el.classList.toggle('selected', Number(el.dataset.q) === n);
  });
};

ChTestConfig.setT = function(m) {
  ChTestConfig.timeMin = m;
  document.querySelectorAll('#ctm-t-row .chtest-pill').forEach(el => {
    el.classList.toggle('selected', Number(el.dataset.t) === m);
  });
};

ChTestConfig.close = function() {
  const backdrop = document.getElementById('chtest-modal-backdrop');
  if (backdrop) backdrop.remove();
  document.body.classList.remove('drawer-open');
};

ChTestConfig.launch = function() {
  const { chapterId, chapterName, questionCount, timeMin } = ChTestConfig;
  const questions = getQuestionsByChapter(chapterId, questionCount);
  if (questions.length === 0) {
    App.showToast('No questions available for this chapter yet');
    return;
  }
  ChTestConfig.close();
  App.navigate('test', {
    questions,
    mode: 'chapter',
    meta: {
      chapterId,
      chapterName,
      title: chapterName,
      timeLimitMin: timeMin,
      questionCount,
    },
  });
};

/* ============================================================
   NCERT BIO FOCUS — Line-by-Line NEET Biology Preparation
   ============================================================ */
const NcertFocusState = {
  activeClass: 'all', // 'all', '11', '12'
  activeType: 'all',  // 'all', 'mcq', 'assertion_reason', 'matching', 'diagram'
  searchTerm: '',
};

async function renderNcertBioFocus(container) {
  const state = State.get();
  const ncertProgress = state.ncertProgress || {};

  // Fetch all NCERT focus questions (or use DB fallback) to compute real-time counts
  let allNcertQs = (window.DB && window.DB.ncertQuestions) || [];
  try {
    if (window.ApiClient) {
      const res = await ApiClient.get('/ncert-bio-focus?limit=100');
      if (res && res.questions && res.questions.length) {
        allNcertQs = res.questions;
      }
    }
  } catch (e) {
    // offline fallback
  }

  // Count total solved / attempted
  const attemptedChapters = Object.keys(ncertProgress).length;
  const avgAccuracy = attemptedChapters > 0
    ? Math.round(Object.values(ncertProgress).reduce((acc, p) => acc + (p.accuracy || 0), 0) / attemptedChapters)
    : 0;

  // Filter chapters
  const filteredChapters = (DB.chapters || []).filter((ch) => {
    if (NcertFocusState.activeClass !== 'all' && ch.class !== NcertFocusState.activeClass) return false;
    if (NcertFocusState.searchTerm) {
      const s = NcertFocusState.searchTerm.toLowerCase();
      if (!ch.name.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  container.innerHTML = `
    <div style="max-width:960px;margin:0 auto;">
      <!-- Hero Header -->
      <div style="background:linear-gradient(135deg,#064e3b 0%,#047857 60%,#059669 100%);color:#fff;border-radius:var(--radius-lg);padding:var(--sp-6);margin-bottom:var(--sp-5);box-shadow:var(--shadow-md);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:var(--sp-4);">
          <div style="max-width:580px;">
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.18);padding:4px 10px;border-radius:20px;font-size:var(--text-xs);font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:var(--sp-2);">
              🌿 100% NCERT Line-by-Line
            </div>
            <div style="font-size:var(--text-2xl);font-weight:800;line-height:1.2;margin-bottom:var(--sp-2);">
              NCERT Bio Focus
            </div>
            <div style="font-size:var(--text-sm);opacity:0.92;line-height:1.5;">
              Practice questions based on NCERT Biology, line by line. Master MCQs, Assertion &amp; Reason, Matching Columns, and Diagram questions directly referenced to NCERT textbooks.
            </div>
          </div>

          <!-- Overall Stats Widget -->
          <div style="display:flex;gap:var(--sp-3);background:rgba(0,0,0,0.18);padding:var(--sp-3) var(--sp-4);border-radius:var(--radius-md);backdrop-filter:blur(4px);flex-shrink:0;">
            <div style="text-align:center;padding:0 var(--sp-2);">
              <div style="font-size:var(--text-xl);font-weight:800;">${allNcertQs.length}</div>
              <div style="font-size:10px;opacity:0.8;font-weight:600;">NCERT Questions</div>
            </div>
            <div style="width:1px;background:rgba(255,255,255,0.2);"></div>
            <div style="text-align:center;padding:0 var(--sp-2);">
              <div style="font-size:var(--text-xl);font-weight:800;color:#6ee7b7;">${attemptedChapters}</div>
              <div style="font-size:10px;opacity:0.8;font-weight:600;">Chapters Mastered</div>
            </div>
            <div style="width:1px;background:rgba(255,255,255,0.2);"></div>
            <div style="text-align:center;padding:0 var(--sp-2);">
              <div style="font-size:var(--text-xl);font-weight:800;color:#fde047;">${avgAccuracy}%</div>
              <div style="font-size:10px;opacity:0.8;font-weight:600;">Avg Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="card" style="margin-bottom:var(--sp-5);padding:var(--sp-4);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--sp-3);">
          <!-- Class Tabs -->
          <div style="display:flex;gap:var(--sp-2);align-items:center;">
            <span style="font-size:var(--text-xs);font-weight:700;color:var(--neutral-500);text-transform:uppercase;">Class:</span>
            <button class="btn btn-sm ${NcertFocusState.activeClass === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="setNcertClassFilter('all')">All Classes</button>
            <button class="btn btn-sm ${NcertFocusState.activeClass === '11' ? 'btn-primary' : 'btn-outline'}" onclick="setNcertClassFilter('11')">Class 11</button>
            <button class="btn btn-sm ${NcertFocusState.activeClass === '12' ? 'btn-primary' : 'btn-outline'}" onclick="setNcertClassFilter('12')">Class 12</button>
          </div>

          <!-- Question Type Pills -->
          <div style="display:flex;gap:var(--sp-1);align-items:center;flex-wrap:wrap;">
            <span style="font-size:var(--text-xs);font-weight:700;color:var(--neutral-500);text-transform:uppercase;">Type:</span>
            <button class="btn btn-sm ${NcertFocusState.activeType === 'all' ? 'btn-secondary' : 'btn-ghost'}" style="font-size:11px;" onclick="setNcertTypeFilter('all')">All Types</button>
            <button class="btn btn-sm ${NcertFocusState.activeType === 'mcq' ? 'btn-secondary' : 'btn-ghost'}" style="font-size:11px;" onclick="setNcertTypeFilter('mcq')">MCQ</button>
            <button class="btn btn-sm ${NcertFocusState.activeType === 'assertion_reason' ? 'btn-secondary' : 'btn-ghost'}" style="font-size:11px;" onclick="setNcertTypeFilter('assertion_reason')">A &amp; R</button>
            <button class="btn btn-sm ${NcertFocusState.activeType === 'matching' ? 'btn-secondary' : 'btn-ghost'}" style="font-size:11px;" onclick="setNcertTypeFilter('matching')">Matching</button>
            <button class="btn btn-sm ${NcertFocusState.activeType === 'diagram' ? 'btn-secondary' : 'btn-ghost'}" style="font-size:11px;" onclick="setNcertTypeFilter('diagram')">Diagram</button>
          </div>
        </div>

        <!-- Search Bar -->
        <div style="margin-top:var(--sp-3);">
          <input type="text" class="form-input form-input-sm" placeholder="🔍 Search NCERT chapters (e.g. Cell, Genetics, Photosynthesis)…" value="${escapeHtml(NcertFocusState.searchTerm)}" oninput="onNcertSearchInput(this.value)" style="width:100%;" />
        </div>
      </div>

      <!-- Chapter Grid -->
      <div class="chapter-grid" style="grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:var(--sp-4);">
        ${filteredChapters.map((ch) => {
          const chQs = allNcertQs.filter(
            (q) => q.chapterId === ch.id || q.chapter === ch.id || q.chapterId?._id === ch.id
          );
          const prog = ncertProgress[ch.id];
          const hasQs = chQs.length > 0;
          const displayCount = hasQs ? chQs.length : Math.max(12, Math.round(ch.questions * 0.8));

          return `
            <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;border-radius:var(--radius-lg);padding:var(--sp-4);transition:transform 0.15s ease, box-shadow 0.15s ease;border:1px solid var(--neutral-200);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--sp-2);">
                  <span style="font-size:26px;">${ch.icon || '📘'}</span>
                  <div style="display:flex;gap:4px;align-items:center;">
                    <span class="badge badge-neutral" style="font-size:10px;font-weight:700;">Class ${ch.class}</span>
                    ${prog ? `<span class="badge badge-success" style="font-size:10px;">${prog.accuracy}% accuracy</span>` : ''}
                  </div>
                </div>

                <div style="font-weight:700;font-size:var(--text-sm);color:var(--neutral-900);line-height:1.3;margin-bottom:var(--sp-2);">
                  ${escapeHtml(ch.name)}
                </div>

                <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-3);flex-wrap:wrap;">
                  <span style="font-size:var(--text-xs);color:var(--neutral-500);font-weight:600;">
                    ${displayCount} NCERT Lines
                  </span>
                  <span style="color:var(--neutral-300);">&middot;</span>
                  <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <span class="badge" style="background:var(--neutral-100);font-size:9px;padding:1px 4px;">MCQ</span>
                    <span class="badge" style="background:#fef3c7;color:#92400e;font-size:9px;padding:1px 4px;">A&amp;R</span>
                    <span class="badge" style="background:#e0e7ff;color:#3730a3;font-size:9px;padding:1px 4px;">Match</span>
                    <span class="badge" style="background:#d1fae5;color:#065f46;font-size:9px;padding:1px 4px;">Diag</span>
                  </div>
                </div>
              </div>

              <div style="margin-top:var(--sp-3);border-top:1px solid var(--neutral-100);padding-top:var(--sp-3);">
                <button class="btn btn-primary btn-sm" style="width:100%;justify-content:center;background:var(--success-600);border-color:var(--success-600);" onclick="startNcertChapterTest('${ch.id}', '${escapeHtml(ch.name).replace(/'/g, "\\'")}')">
                  Practice NCERT Focus →
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window.setNcertClassFilter = function (c) {
  NcertFocusState.activeClass = c;
  renderNcertBioFocus(document.getElementById('screen-container'));
};

window.setNcertTypeFilter = function (t) {
  NcertFocusState.activeType = t;
  renderNcertBioFocus(document.getElementById('screen-container'));
};

window.onNcertSearchInput = function (val) {
  NcertFocusState.searchTerm = val;
  renderNcertBioFocus(document.getElementById('screen-container'));
};

window.startNcertChapterTest = async function (chapterId, chapterName) {
  let questions = [];

  // Try fetching chapter specific NCERT questions from API
  try {
    if (window.ApiClient) {
      const typeQuery = NcertFocusState.activeType !== 'all' ? `&questionType=${NcertFocusState.activeType}` : '';
      const res = await ApiClient.get(`/ncert-bio-focus?chapterId=${chapterId}${typeQuery}&limit=50`);
      if (res && res.questions && res.questions.length) {
        questions = res.questions.map((q) => ({
          ...q,
          id: q._id || q.id,
          chapter: q.chapterId?._id || q.chapterId || q.chapter || chapterId,
          options: q.options || ['A', 'B', 'C', 'D'],
          correct: q.correctOption ?? q.correct ?? 0,
        }));
      }
    }
  } catch (e) {
    console.warn('API fetch failed, falling back to local seed DB:', e);
  }

  // Fallback to local DB.ncertQuestions matching this chapter
  if (!questions.length && window.DB && window.DB.ncertQuestions) {
    const matched = DB.ncertQuestions.filter((q) => q.chapter === chapterId || q.chapterId === chapterId);
    if (matched.length > 0) {
      questions = matched.map((q) => ({
        ...q,
        id: q._id || q.id,
        chapter: q.chapter || chapterId,
        correct: q.correctOption ?? q.correct ?? 0,
      }));
    }
  }

  // If still none specifically for this chapter, use general NCERT focus questions + chapter questions labeled with NCERT references
  if (!questions.length) {
    const generalQs = (window.DB && window.DB.questions && getQuestionsByChapter(chapterId, 10)) || [];
    questions = generalQs.map((q, idx) => ({
      ...q,
      isNcertFocus: true,
      ncertReference: `NCERT Biology, ${chapterName}, Page ${100 + idx * 3}`,
      correct: q.correctOption ?? q.correct ?? 0,
    }));
  }

  if (questions.length === 0) {
    App.showToast('No NCERT line-by-line questions found for this chapter yet.');
    return;
  }

  App.navigate('test', {
    questions,
    mode: 'ncert-focus',
    meta: {
      chapterId,
      chapterName,
      title: `NCERT Bio Focus — ${chapterName}`,
      questionCount: questions.length,
    },
  });
};

window.renderNcertBioFocus = renderNcertBioFocus;


/* ============================================================
   IMPROVEMENT BOOK — Create Your Own Test, Chapter Progress,
   Spaced Re-Test (Day 1 → 4 → 10, question-level mastery)
   ============================================================ */

const ImpBook = {
  customTestOpen: false,
  search: '',
  selectedChapters: new Set(),
  questionCount: 45,
  timeMin: 60,
  sortMode: 'all',       // all | weakest | strongest
  dayFilter: 'all',      // all | day1 | day4 | day10
  testSize: 45,
  showMastered: false,
};

const STRENGTH_BANDS = [
  { max: 25,  label: 'Critical',           color: 'var(--error-600)'   },
  { max: 45,  label: 'Needs Improvement',  color: 'var(--warning-600)' },
  { max: 65,  label: 'Average',            color: 'var(--neutral-600)' },
  { max: 85,  label: 'Strong',             color: 'var(--primary-600)' },
  { max: 100, label: 'Very Strong',        color: 'var(--success-600)' },
];

function strengthFor(pct) {
  return STRENGTH_BANDS.find(b => pct <= b.max) || STRENGTH_BANDS[STRENGTH_BANDS.length - 1];
}

/* ---- Main render ---- */
function renderImprovementBook(container) {
  ImpBook.customTestOpen = false;
  ImpBook.search = '';
  ImpBook.selectedChapters = new Set();
  ImpBook.sortMode = 'all';
  ImpBook.dayFilter = 'all';
  ImpBook.showMastered = false;

  const state = State.get();
  const pool = state.spacedReviewPool || [];
  const masteredCount = (state.masteredPool || []).length;
  const dueToday = pool.filter(q => q.status === 'active').length;

  container.innerHTML = `
    <div class="impbook-layout">
      <div class="impbook-main-col">
        <div style="margin-bottom:var(--sp-4);">
          <div class="page-title">Improvement Book</div>
          <div class="page-subtitle">Turn your mistakes into mastery.</div>
          <div class="impbook-stat-row">
            <div class="impbook-stat"><span>${dueToday}</span>Questions to Improve</div>
            <div class="impbook-stat"><span>${pool.filter(q => q.reviewStage === 'day1' && q.status === 'active').length}</span>Due Today</div>
            <div class="impbook-stat"><span>${masteredCount}</span>Mastered</div>
          </div>
        </div>

        <!-- Section 1: Create Your Own Test -->
        <div id="ctest-panel"></div>

        <!-- Section 2: Chapter Progress -->
        <div class="impbook-section">
          <div class="impbook-section-head">
            <div class="section-title" style="font-size:var(--text-base);">Your Biology Progress</div>
            <div class="impbook-chip-row">
              ${['all', 'weakest', 'strongest'].map(v => `
                <button class="impbook-chip ${ImpBook.sortMode === v ? 'active' : ''}" onclick="ImpBook.sortMode='${v}'; renderChapterProgressList();">
                  ${v === 'all' ? 'All Chapters' : v === 'weakest' ? 'Weakest First' : 'Strongest First'}
                </button>
              `).join('')}
            </div>
          </div>
          <div id="chapter-progress-list"></div>
        </div>

        <!-- Section 3: Spaced Re-Test -->
        <div class="impbook-section">
          <div class="section-title" style="font-size:var(--text-base);">Spaced Re-Test</div>
          <div class="section-subtitle" style="margin-bottom:var(--sp-3);">Revisit the questions you got wrong until you master them.</div>
          <div id="spaced-section"></div>
        </div>

        <!-- Section 4 (optional): Mastered Questions -->
        <div class="impbook-mastered-toggle" onclick="ImpBook.showMastered=!ImpBook.showMastered; renderMasteredPanel();">
          <span>🏅 Mastered Questions</span>
          <span id="mastered-count-label">${masteredCount} questions mastered</span>
          <span id="mastered-caret">${ImpBook.showMastered ? '▲' : '▼'}</span>
        </div>
        <div id="mastered-panel"></div>
      </div>

      <aside class="impbook-ad-sidebar">
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

  renderCreateTestPanel();
  renderChapterProgressList();
  renderSpacedSection();
  renderMasteredPanel();
}

/* ---- Section 1: Create Your Own Test ---- */
function renderCreateTestPanel() {
  const el = document.getElementById('ctest-panel');
  if (!el) return;

  if (!ImpBook.customTestOpen) {
    el.innerHTML = `
      <div class="create-test-card">
        <div>
          <div class="create-test-title">Create Your Own Test</div>
          <div class="create-test-sub">Choose chapters, questions and time to create your personalized Biology test.</div>
        </div>
        <button class="btn btn-primary" onclick="ImpBook.customTestOpen=true; renderCreateTestPanel();">Create Test →</button>
      </div>
    `;
    return;
  }

  const totalAvailable = DB.questions.filter(q => ImpBook.selectedChapters.size === 0 || ImpBook.selectedChapters.has(q.chapter)).length;

  el.innerHTML = `
    <div class="create-test-card create-test-open">
      <div class="create-test-title" style="margin-bottom:var(--sp-3);">Create Your Own Test</div>

      <div class="ctest-step-label">Step 1 — Select Chapters</div>
      <input type="text" class="form-input" id="ctest-search" placeholder="Search chapter..."
        value="${ImpBook.search.replace(/"/g, '&quot;')}"
        oninput="ImpBook.search=this.value; renderChapterCheckList();" style="margin-bottom:var(--sp-2);" />
      <div class="ctest-select-actions">
        <button class="btn btn-ghost btn-sm" onclick="selectAllChapters()">Select All</button>
        <button class="btn btn-ghost btn-sm" onclick="clearAllChapters()">Clear</button>
        <span id="ctest-selected-count" style="font-size:var(--text-xs);color:var(--neutral-500);font-weight:600;margin-left:auto;">${ImpBook.selectedChapters.size} selected</span>
      </div>
      <div class="ctest-chapter-list" id="ctest-chapter-list"></div>

      <div class="ctest-step-label" style="margin-top:var(--sp-4);">Step 2 — Number of Questions</div>
      <div class="count-btn-group" id="ctest-count-group">
        ${[30, 45, 60, 90].map(n => `
          <button class="count-btn ${ImpBook.questionCount === n ? 'active' : ''}" onclick="ImpBook.questionCount=${n}; renderCreateTestPanel();">${n}</button>
        `).join('')}
      </div>

      <div class="ctest-step-label" style="margin-top:var(--sp-4);">Step 3 — Test Time</div>
      <div class="count-btn-group">
        ${[30, 45, 60, 90].map(n => `
          <button class="count-btn ${ImpBook.timeMin === n ? 'active' : ''}" onclick="ImpBook.timeMin=${n}; renderCreateTestPanel();">${n} min</button>
        `).join('')}
      </div>

      <div class="ctest-summary" id="ctest-summary-block">
        ${ctestSummaryHtml()}
      </div>

      <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-3);">
        <button class="btn btn-primary" onclick="generateCustomTest()">Create Your Own Test →</button>
        <button class="btn btn-ghost" onclick="ImpBook.customTestOpen=false; renderCreateTestPanel();">Cancel</button>
      </div>
    </div>
  `;
  renderChapterCheckList();
}

function ctestSummaryHtml() {
  const totalAvailable = DB.questions.filter(q => ImpBook.selectedChapters.size === 0 || ImpBook.selectedChapters.has(q.chapter)).length;
  return `
    <div class="ctest-summary-title">Your Test</div>
    <div class="ctest-summary-row">Chapters: <strong>${ImpBook.selectedChapters.size || 'All 28'}</strong></div>
    <div class="ctest-summary-row">Questions: <strong>${Math.min(ImpBook.questionCount, totalAvailable)}</strong>${totalAvailable < ImpBook.questionCount ? ` <span style="color:var(--warning-600);">(only ${totalAvailable} available)</span>` : ''}</div>
    <div class="ctest-summary-row">Time: <strong>${ImpBook.timeMin} minutes</strong></div>
  `;
}

function renderChapterCheckList() {
  const el = document.getElementById('ctest-chapter-list');
  if (!el) return;
  const q = ImpBook.search.trim().toLowerCase();
  const chapters = DB.chapters.filter(ch => !q || ch.name.toLowerCase().includes(q));

  el.innerHTML = chapters.length ? chapters.map(ch => `
    <label class="ctest-chapter-row">
      <input type="checkbox" ${ImpBook.selectedChapters.has(ch.id) ? 'checked' : ''} onchange="toggleChapter('${ch.id}')" />
      <span class="ctest-chapter-icon">${ch.icon}</span>
      <span class="ctest-chapter-name">${ch.name}</span>
    </label>
  `).join('') : `<div style="padding:var(--sp-4);text-align:center;color:var(--neutral-400);font-size:var(--text-sm);">No chapters match your search.</div>`;

  const input = document.getElementById('ctest-search');
  if (input && document.activeElement === input) {
    const val = input.value;
    input.focus();
    input.value = val;
    input.setSelectionRange(val.length, val.length);
  }
}

window.toggleChapter = function(chapterId) {
  if (ImpBook.selectedChapters.has(chapterId)) ImpBook.selectedChapters.delete(chapterId);
  else ImpBook.selectedChapters.add(chapterId);
  const countEl = document.getElementById('ctest-selected-count');
  if (countEl) countEl.textContent = `${ImpBook.selectedChapters.size} selected`;
  const summaryEl = document.getElementById('ctest-summary-block');
  if (summaryEl) summaryEl.innerHTML = ctestSummaryHtml();
};

window.selectAllChapters = function() {
  ImpBook.selectedChapters = new Set(DB.chapters.map(c => c.id));
  renderCreateTestPanel();
};

window.clearAllChapters = function() {
  ImpBook.selectedChapters = new Set();
  renderCreateTestPanel();
};

window.generateCustomTest = function() {
  const chapterIds = ImpBook.selectedChapters.size > 0 ? Array.from(ImpBook.selectedChapters) : DB.chapters.map(c => c.id);
  let pool = DB.questions.filter(q => chapterIds.includes(q.chapter));
  // shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const requested = ImpBook.questionCount;
  const questions = pool.slice(0, requested);

  if (questions.length === 0) {
    App.showToast('No questions available for the selected chapters yet');
    return;
  }
  if (questions.length < requested) {
    App.showToast(`Only ${questions.length} questions available for your selection — starting with those`);
  }

  App.navigate('test', {
    questions,
    mode: 'custom',
    meta: { title: chapterIds.length === DB.chapters.length ? 'All Chapters' : `${chapterIds.length} Chapter${chapterIds.length > 1 ? 's' : ''}`, chapterIds, timeLimitMin: ImpBook.timeMin }
  });
};

/* ---- Section 2: Chapter Progress ---- */
function renderChapterProgressList() {
  const el = document.getElementById('chapter-progress-list');
  if (!el) return;
  const state = State.get();
  const cp = state.performance?.chapterProgress || {};

  let chapters = DB.chapters.map(ch => ({ ch, pct: cp[ch.id] || 0 }));
  if (ImpBook.sortMode === 'weakest') chapters.sort((a, b) => a.pct - b.pct);
  else if (ImpBook.sortMode === 'strongest') chapters.sort((a, b) => b.pct - a.pct);

  el.innerHTML = `
    <div class="progress-row-list">
      ${chapters.map(({ ch, pct }) => {
        const s = strengthFor(pct);
        return `
          <div class="progress-row">
            <span class="progress-row-icon">${ch.icon}</span>
            <span class="progress-row-name">${ch.name}</span>
            <div class="progress-bar progress-row-bar"><div class="progress-fill" style="width:${pct}%;background:${s.color};"></div></div>
            <span class="progress-row-pct">${pct}%</span>
            <span class="progress-row-strength" style="color:${s.color};">${s.label}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ---- Section 3: Spaced Re-Test ---- */
function renderSpacedSection() {
  const el = document.getElementById('spaced-section');
  if (!el) return;
  const state = State.get();
  const pool = (state.spacedReviewPool || []).filter(q => q.status === 'active');

  const filtered = ImpBook.dayFilter === 'all' ? pool : pool.filter(q => q.reviewStage === ImpBook.dayFilter);
  const stageCounts = {
    day1: pool.filter(q => q.reviewStage === 'day1').length,
    day4: pool.filter(q => q.reviewStage === 'day4').length,
    day10: pool.filter(q => q.reviewStage === 'day10').length,
  };

  // chapter breakdown for the current filter
  const byChapter = {};
  filtered.forEach(q => { byChapter[q.chapter] = (byChapter[q.chapter] || 0) + 1; });
  const chapterRows = Object.entries(byChapter).map(([chId, count]) => {
    const ch = DB.chapters.find(c => c.id === chId);
    return { name: ch ? ch.name : chId, count };
  }).sort((a, b) => b.count - a.count);

  el.innerHTML = `
    <div class="spaced-dashboard">
      <div class="spaced-stage-rows">
        <div class="spaced-stage-row">
          <span class="spaced-stage-label">Day 1</span>
          <span class="spaced-stage-count">${stageCounts.day1} Questions</span>
          <button class="btn btn-outline btn-sm" ${stageCounts.day1 === 0 ? 'disabled' : ''} onclick="startSpacedRetest(Math.min(30, ${stageCounts.day1}), 'day1')">Start Test</button>
        </div>
        <div class="spaced-stage-row">
          <span class="spaced-stage-label">Day 4</span>
          <span class="spaced-stage-count">${stageCounts.day4} Questions</span>
          <button class="btn btn-outline btn-sm" ${stageCounts.day4 === 0 ? 'disabled' : ''} onclick="startSpacedRetest(Math.min(30, ${stageCounts.day4}), 'day4')">Start Test</button>
        </div>
        <div class="spaced-stage-row">
          <span class="spaced-stage-label">Day 10</span>
          <span class="spaced-stage-count">${stageCounts.day10} Questions</span>
          <button class="btn btn-outline btn-sm" ${stageCounts.day10 === 0 ? 'disabled' : ''} onclick="startSpacedRetest(Math.min(30, ${stageCounts.day10}), 'day10')">Start Test</button>
        </div>
      </div>

      <div class="impbook-chip-row" style="margin:var(--sp-4) 0 var(--sp-2);">
        ${['all', 'day1', 'day4', 'day10'].map(v => `
          <button class="impbook-chip ${ImpBook.dayFilter === v ? 'active' : ''}" onclick="ImpBook.dayFilter='${v}'; renderSpacedSection();">
            ${v === 'all' ? 'All Due' : v.replace('day', 'Day ')}
          </button>
        `).join('')}
      </div>

      ${chapterRows.length ? `
        <div class="spaced-chapter-breakdown">
          ${chapterRows.map(r => `<div class="spaced-chapter-row"><span>${r.name}</span><span>${r.count} Questions</span></div>`).join('')}
          <div class="spaced-chapter-row spaced-chapter-total"><span>Total</span><span>${filtered.length} Questions</span></div>
        </div>
      ` : `<div style="padding:var(--sp-4) 0;color:var(--neutral-400);font-size:var(--text-sm);">Nothing due right now — clear! 🎉</div>`}

      <div style="margin-top:var(--sp-4);">
        <div style="font-size:var(--text-sm);color:var(--neutral-500);font-weight:600;margin-bottom:var(--sp-2);">${filtered.length} question${filtered.length !== 1 ? 's are' : ' is'} currently due. Choose test size:</div>
        <div class="count-btn-group" style="margin-bottom:var(--sp-3);">
          ${[30, 45, 60, 90].map(n => `
            <button class="count-btn ${ImpBook.testSize === n ? 'active' : ''}" onclick="ImpBook.testSize=${n}; renderSpacedSection();">${n}</button>
          `).join('')}
        </div>
        <button class="btn btn-primary" ${filtered.length === 0 ? 'disabled' : ''} onclick="startSpacedRetest(Math.min(ImpBook.testSize, ${filtered.length}), '${ImpBook.dayFilter}')">Start Spaced Re-Test →</button>
      </div>
    </div>
  `;
}

window.startSpacedRetest = function(size, stageFilter) {
  const state = State.get();
  const pool = (state.spacedReviewPool || []).filter(q => q.status === 'active');
  const due = stageFilter === 'all' ? pool : pool.filter(q => q.reviewStage === stageFilter);

  if (due.length === 0) { App.showToast('No due questions for this selection'); return; }

  const chosen = due.slice(0, size);
  const questions = chosen
    .map(item => DB.questions.find(q => q.id === item.questionId))
    .filter(Boolean);

  if (questions.length === 0) { App.showToast('Those questions are no longer available'); return; }

  TestEngine.start({
    questions,
    mode: 'spacedq',
    meta: { reviewStage: stageFilter === 'all' ? 'mixed' : stageFilter, title: 'Spaced Re-Test' },
    onComplete(results) {
      applySpacedRetestResults(results, chosen);
      App.navigate('result', results);
    }
  });
};

/* ---- Mastery logic: 2 correct answers in separate re-test sessions ---- */
function applySpacedRetestResults(results, chosenPoolItems) {
  const state = State.get();
  const pool = state.spacedReviewPool || [];
  const mastered = state.masteredPool || [];

  results.questionResults.forEach(r => {
    const poolItem = pool.find(p => p.questionId === r.questionId);
    if (!poolItem) return;

    if (r.status === 'correct') {
      poolItem.successfulRetests = (poolItem.successfulRetests || 0) + 1;
      if (poolItem.successfulRetests >= 2) {
        // Mastered — remove from active pool, move to mastered history
        poolItem.status = 'mastered';
        poolItem.masteredDate = Date.now();
        mastered.push({ ...poolItem });
      } else {
        // advance stage: day1 -> day4 -> day10
        if (poolItem.reviewStage === 'day1') {
          poolItem.reviewStage = 'day4';
          poolItem.dueDate = Date.now() + 4 * 86400000;
        } else if (poolItem.reviewStage === 'day4') {
          poolItem.reviewStage = 'day10';
          poolItem.dueDate = Date.now() + 10 * 86400000;
        } else {
          poolItem.reviewStage = 'day10';
          poolItem.dueDate = Date.now() + 10 * 86400000;
        }
        poolItem.lastReviewDate = Date.now();
      }
    } else if (r.status === 'incorrect') {
      // wrong again — reset progress, keep active, back to Day 1
      poolItem.successfulRetests = 0;
      poolItem.reviewStage = 'day1';
      poolItem.dueDate = Date.now();
      poolItem.lastReviewDate = Date.now();
    }
    // skipped questions: leave state untouched, still due
  });

  const nextPool = pool.filter(p => p.status !== 'mastered');
  State.update({ spacedReviewPool: nextPool, masteredPool: mastered });

  // Sync to backend Improvement Book API if authenticated
  if (window.ApiClient && ApiClient.getToken()) {
    const syncEntries = pool.map(p => ({
      questionId: p.questionId,
      status: p.status === 'mastered' ? 'mastered' : 'reviewing',
      reviewCount: p.successfulRetests || 0,
      mistakeReason: p.mistakeReason || '',
      nextReviewDate: p.dueDate ? new Date(p.dueDate).toISOString() : null,
    }));
    ApiClient.post('/user/improvement/sync', { entries: syncEntries }).catch(e => console.warn('ImpBook sync:', e));
  }
}

/* ---- Wrong-question collection from Chapter Test / Create Your Own Test ---- */
function processTestResultForSpacedReview(results) {
  if (results.mode !== 'chapter' && results.mode !== 'custom') return;

  const state = State.get();
  const pool = state.spacedReviewPool || [];

  results.questionResults.forEach(r => {
    if (r.status !== 'incorrect') return;
    const existing = pool.find(p => p.questionId === r.questionId && p.status === 'active');
    if (existing) {
      // already being tracked — a fresh wrong answer resets it to Day 1
      existing.successfulRetests = 0;
      existing.reviewStage = 'day1';
      existing.wrongDate = Date.now();
      existing.dueDate = Date.now();
    } else {
      pool.push({
        questionId: r.questionId,
        chapter: (r.question && r.question.chapter) || '',
        reviewStage: 'day1',
        successfulRetests: 0,
        status: 'active',
        wrongDate: Date.now(),
        dueDate: Date.now(),
      });
    }
  });

  State.update({ spacedReviewPool: pool });

  // Sync to backend Improvement Book API if authenticated
  if (window.ApiClient && ApiClient.getToken()) {
    const wrongEntries = (results.questionResults || [])
      .filter(r => r.status === 'incorrect')
      .map(r => ({
        questionId: r.questionId,
        questionText: (r.question && r.question.text) || '',
        chapterName: (r.question && r.question.chapterName) || (r.question && r.question.chapter) || '',
        status: 'active',
        wrongDate: new Date(),
      }));

    if (wrongEntries.length > 0) {
      ApiClient.post('/user/improvement/sync', { entries: wrongEntries }).catch(e => console.warn('ImpBook wrong sync:', e));
    }
  }
}

/* ---- Mastered panel ---- */
function renderMasteredPanel() {
  const el = document.getElementById('mastered-panel');
  const caret = document.getElementById('mastered-caret');
  if (!el) return;
  if (caret) caret.textContent = ImpBook.showMastered ? '▲' : '▼';

  if (!ImpBook.showMastered) { el.innerHTML = ''; return; }

  const state = State.get();
  const mastered = state.masteredPool || [];

  el.innerHTML = `
    <div class="impbook-mastered-list">
      ${mastered.length ? mastered.slice().reverse().map(m => {
        const q = DB.questions.find(x => x.id === m.questionId);
        const ch = DB.chapters.find(c => c.id === m.chapter);
        return `<div class="spaced-chapter-row"><span>${q ? q.text.substring(0, 60) + (q.text.length > 60 ? '…' : '') : m.questionId}</span><span style="color:var(--neutral-400);">${ch ? ch.name : ''}</span></div>`;
      }).join('') : `<div style="padding:var(--sp-3) 0;color:var(--neutral-400);font-size:var(--text-sm);">No questions mastered yet — keep re-testing!</div>`}
    </div>
  `;
}

/* ---- Performance & Ranking: local UI state for the Chapter-wise /
   Full-Length test performance graph toggle. Reset each time the page
   is opened so it always starts on the Chapter-wise tab. ---- */
const PerfPage = { activeTab: 'chapter' };

/* ---- Helper: average of a metric over a slice of trend points ---- */
function perfAvg(points, metricKey) {
  if (!points || points.length === 0) return 0;
  return Math.round(points.reduce((s, p) => s + (p[metricKey] || 0), 0) / points.length);
}

/* ---- Helper: compare the earlier half of a trend to the more recent
   half, so the graph can call out "previous vs recent performance". ---- */
function perfTrendDelta(points, metricKey = 'accuracy') {
  if (!points || points.length < 2) return null;
  const mid = Math.ceil(points.length / 2);
  const prevSlice = points.slice(0, mid);
  const recentSlice = points.slice(mid).length ? points.slice(mid) : prevSlice;
  const prevAvg = perfAvg(prevSlice, metricKey);
  const recentAvg = perfAvg(recentSlice, metricKey);
  return { prevAvg, recentAvg, diff: recentAvg - prevAvg };
}

/* ---- Renders just the chart + meta-row for the active tab, without
   re-rendering the rest of the Performance page (called on tab switch). ---- */
function renderPerfTrendChart() {
  const el = document.getElementById('perf-chart-body');
  if (!el) return;

  const isChapter = PerfPage.activeTab === 'chapter';
  const points = isChapter ? getChapterTestTrend() : getFullLengthTestTrend();
  const color = isChapter ? '#16a34a' : '#2563eb';
  const delta = perfTrendDelta(points, 'accuracy');
  const latest = points[points.length - 1];
  const bestScorePct = points.length
    ? Math.max(...points.map(p => (p.total ? Math.round((p.score / p.total) * 100) : 0)))
    : 0;

  const deltaCls = !delta ? '' : delta.diff > 0 ? 'up' : delta.diff < 0 ? 'down' : 'flat';
  const deltaLabel = !delta ? '' : delta.diff > 0 ? `▲ +${delta.diff}%` : delta.diff < 0 ? `▼ ${delta.diff}%` : '— No change';

  el.innerHTML = `
    <div class="perf-chart-legend" style="margin-bottom:var(--sp-3);">
      <span><span class="perf-chart-legend-dot" style="background:${color};"></span>${isChapter ? 'Chapter-wise' : 'Full-Length'} accuracy trend — hover any point for that test's score</span>
    </div>
    ${Charts.trendChart({ key: PerfPage.activeTab, points, color })}
    ${points.length ? `
      <div class="perf-chart-meta-row">
        <div class="perf-chart-meta-item">
          <span class="perf-chart-meta-label">Latest Accuracy</span>
          <span class="perf-chart-meta-value">${latest.accuracy}%</span>
        </div>
        <div class="perf-chart-meta-item">
          <span class="perf-chart-meta-label">Latest Score</span>
          <span class="perf-chart-meta-value">${latest.score}/${latest.total}</span>
        </div>
        <div class="perf-chart-meta-item">
          <span class="perf-chart-meta-label">Best Score</span>
          <span class="perf-chart-meta-value">${bestScorePct}%</span>
        </div>
        ${delta ? `
          <div class="perf-chart-meta-item">
            <span class="perf-chart-meta-label">Recent vs Previous</span>
            <span class="perf-chart-meta-value">
              ${delta.recentAvg}% <span class="perf-chart-delta ${deltaCls}">${deltaLabel}</span>
            </span>
          </div>
        ` : ''}
      </div>
    ` : ''}
  `;
}

/* ---- Switch between Chapter-wise / Full-Length graph tabs ---- */
window.setPerfTab = function (tab) {
  if (PerfPage.activeTab === tab) return;
  PerfPage.activeTab = tab;
  document.querySelectorAll('.perf-chart-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
  });
  renderPerfTrendChart();
};

/* ---- Performance & Ranking (merged) ---- */
function renderPerformance(container) {
  PerfPage.activeTab = 'chapter';
  const state = State.get();
  const perf = state.performance;
  const name = state.student.name || 'Student';
  const initial = (name.charAt(0) || 'S').toUpperCase();
  const earnedBadges = (perf.badges || []).filter(b => b.earned);
  const allBadges = perf.badges || [];
  const badgeProgress = Math.round((earnedBadges.length / allBadges.length) * 100);

  container.innerHTML = `
    <div class="perf-layout">
      <div class="perf-main-col">
        <div style="margin-bottom:var(--sp-6);">
          <div class="page-title">Performance & Ranking</div>
          <div class="page-subtitle">Your stats, your rank, your glow-up tracker</div>
        </div>

        <!-- Profile / Rank Summary Card -->
        <div class="profile-card" id="rank-section" style="margin-bottom:var(--sp-5);">
          <div class="profile-avatar-area">
            <div class="profile-avatar">${initial}</div>
            <div class="profile-name-area">
              <div class="profile-name">${name}</div>
              <div class="profile-rank">Bio Rank: <strong>#${perf.rank}</strong></div>
            </div>
          </div>
          <div class="profile-stats">
            <div class="profile-stat-item">
              <span class="profile-stat-icon">🔥</span>
              <span class="profile-stat-val">${perf.currentStreak}</span>
              <span class="profile-stat-label">Day Streak</span>
            </div>
            <div class="profile-stat-item">
              <span class="profile-stat-icon">🏆</span>
              <span class="profile-stat-val">${earnedBadges.length}</span>
              <span class="profile-stat-label">Achievements</span>
            </div>
            <div class="profile-stat-item">
              <span class="profile-stat-icon">🎯</span>
              <span class="profile-stat-val">${perf.overallAccuracy}%</span>
              <span class="profile-stat-label">Accuracy</span>
            </div>
          </div>
          <div class="profile-progress">
            <div class="profile-progress-label">
              <span>Next Achievement</span>
              <span>${earnedBadges.length}/${allBadges.length} badges</span>
            </div>
            <div class="progress-bar" style="height:8px;margin-top:var(--sp-2);">
              <div class="progress-fill" style="width:${badgeProgress}%;"></div>
            </div>
          </div>
        </div>

        <!-- Ranking Criteria Info Pill -->
        <div style="background:var(--primary-50);border:1px solid var(--primary-200);border-radius:var(--radius-md);padding:var(--sp-3) var(--sp-4);margin-bottom:var(--sp-4);display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-xs);color:var(--primary-900);">
          <span style="font-size:16px;">⚖️</span>
          <span><strong>Official Bio Rank Formula:</strong> Rank is computed based on <strong>1. Marks Scored</strong> (Higher marks) and <strong>2. Speed</strong> (Lower Avg Time taken per question).</span>
        </div>

        <!-- Stats Grid -->
        <div class="perf-stats-grid" style="margin-bottom:var(--sp-5);">
          <div class="stat-card">
            <div class="stat-label">Your Rank</div>
            <div class="stat-value">#${perf.testsAttempted > 0 ? (perf.rank || 1) : '—'}</div>
            <div class="stat-sub">of ${perf.totalStudents.toLocaleString()} active students</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Percentile</div>
            <div class="stat-value" style="color:var(--primary-600);">${perf.testsAttempted > 0 ? perf.percentile : 0}%</div>
            <div class="stat-sub">top ${(100 - (perf.testsAttempted > 0 ? perf.percentile : 0)).toFixed(1)}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Avg Speed / Question</div>
            <div class="stat-value" style="color:var(--primary-700);">${perf.lastAvgTimePerQuestion ? `${perf.lastAvgTimePerQuestion}s` : '42s'}</div>
            <div class="stat-sub">${(perf.lastAvgTimePerQuestion || 42) <= 50 ? '⚡ Fast Pace' : '⏱️ Needs Speed'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Overall Accuracy</div>
            <div class="stat-value">${perf.overallAccuracy}%</div>
            <div class="stat-sub">across all attempts</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Tests Completed</div>
            <div class="stat-value">${perf.testsAttempted}</div>
            <div class="stat-sub">tests done</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Questions Attempted</div>
            <div class="stat-value">${perf.questionsAttempted}</div>
            <div class="stat-sub">of available questions</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Correct Answers</div>
            <div class="stat-value" style="color:var(--success-500);">${perf.correctAnswers}</div>
            <div class="stat-sub">${perf.questionsAttempted > 0 ? Math.round(perf.correctAnswers / perf.questionsAttempted * 100) : 0}% hit rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Incorrect</div>
            <div class="stat-value" style="color:var(--error-500);">${perf.incorrectAnswers}</div>
            <div class="stat-sub">−${perf.incorrectAnswers} negative marks</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Longest Streak</div>
            <div class="stat-value" style="color:var(--warning-500);">🔥 ${perf.longestStreak}</div>
            <div class="stat-sub">days in a row</div>
          </div>
        </div>

        <!-- Weekly Chart -->
        <div id="progress-section">
          <div class="card" style="margin-bottom:var(--sp-5);">
            <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-4);">Weekly Accuracy Trend</div>
            ${Charts.lineChart({ values: perf.weeklyProgress, width: 600, height: 100, color: '#2980b9' })}
          </div>
        </div>

        <!-- Test Performance Graphs (Chapter-wise / Full-Length toggle) -->
        <div class="card" id="perf-trend-section" style="margin-bottom:var(--sp-5);">
          <div class="perf-chart-header">
            <div>
              <div class="section-title" style="font-size:var(--text-base);">Test Performance</div>
              <div class="section-subtitle">How your scores are trending over time</div>
            </div>
            <div class="perf-chart-tabs" role="tablist" aria-label="Test performance graph type">
              <button type="button" class="perf-chart-tab-btn active" data-tab="chapter" role="tab" aria-selected="true" onclick="setPerfTab('chapter')">Chapter-wise Tests</button>
              <button type="button" class="perf-chart-tab-btn" data-tab="fulllength" role="tab" aria-selected="false" onclick="setPerfTab('fulllength')">Full-Length Tests</button>
            </div>
          </div>
          <div id="perf-chart-body" style="margin-top:var(--sp-3);"></div>
        </div>

        <!-- Badges -->
        <div class="card" id="badges-section">
          <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-4);">Badges</div>
          <div class="badges-grid">
            ${perf.badges.map(b => `
              <div class="badge-card ${b.earned ? 'earned' : 'locked'}">
                <div class="badge-icon">${b.icon}</div>
                <div class="badge-name">${b.name}</div>
                ${b.earned ? '<div style="font-size:10px;color:var(--success-600);font-weight:600;">Earned</div>' : '<div style="font-size:10px;color:var(--neutral-400);">Locked</div>'}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Advertisement Sidebar (placeholder only — no ad network wired up) -->
      <aside class="perf-ad-sidebar" id="perf-ad-sidebar">
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

  renderPerfTrendChart();
}

/* ---- Result Screen (Redesigned with Mistake Analysis) ---- */
let _resultFilter = 'all'; // 'all' | 'incorrect' | 'correct' | 'skipped'
let _expandedQuestions = new Set();

function renderResult(container, results) {
  if (!results) { App.navigate('home'); return; }

  // Store results reference
  window._currentResults = results;

  // Run existing background processors
  processTestResultForSpacedReview(results);
  recordChapterTestAttempt(results);

  // Attempt identifier for persistent mistake tagging
  if (!results._attemptKey) {
    results._attemptKey = `attempt_${Date.now()}_${results.mode || 'test'}`;
  }
  const attemptKey = results._attemptKey;

  // Restore any previously saved mistake reasons from State for this attempt or questions
  const state = State.get();
  const savedReasons = (state.mistakeReasons && state.mistakeReasons[attemptKey]) || {};
  results.questionResults.forEach((r, idx) => {
    const qId = r.questionId || r.question.id || `q_${idx}`;
    if (savedReasons[qId]) {
      r.errorType = savedReasons[qId];
    } else if (!r.errorType && state.mistakeReasons && state.mistakeReasons[qId]) {
      // Global fallback for question ID
      r.errorType = state.mistakeReasons[qId];
    }
  });

  // Calculate metrics
  const isCuet = (results.meta && results.meta.examType === 'CUET') || results.examType === 'CUET' || state.examMode === 'CUET';
  const totalQ = results.totalQuestions || results.questionResults.length || 1;
  const correctCount = results.correct || 0;
  const incorrectCount = results.incorrect || 0;
  const unattemptedCount = results.unattempted || (totalQ - correctCount - incorrectCount);
  const accuracy = results.accuracy !== undefined ? results.accuracy : Math.round((correctCount / totalQ) * 100);
  const maxMarks = isCuet ? (results.maxScore || (totalQ * 5)) : (totalQ * 4);
  const evaluatedScore = results.score !== undefined ? results.score : (results.neetScore !== undefined ? results.neetScore : (isCuet ? (correctCount * 5 - incorrectCount * 1) : (correctCount * 4 - incorrectCount * 1)));
  const timeStr = formatSeconds(results.timeSpent || 0);
  const avgSeconds = results.timeSpent ? Math.round(results.timeSpent / totalQ) : 0;
  const rank = state.performance?.rank ? `#${state.performance.rank}` : '#1';

  // Group performance by chapter
  const chapterBreakdown = {};
  results.questionResults.forEach((r, i) => {
    const chId = r.question.chapter || 'general';
    const chObj = DB.chapters.find(c => c.id === chId);
    const chName = chObj ? chObj.name : (r.question.chapterName || 'General Biology');
    const chIcon = chObj ? chObj.icon : '📖';

    if (!chapterBreakdown[chId]) {
      chapterBreakdown[chId] = {
        id: chId,
        name: chName,
        icon: chIcon,
        total: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        reasons: {}
      };
    }
    chapterBreakdown[chId].total++;
    if (r.status === 'correct') chapterBreakdown[chId].correct++;
    else if (r.status === 'incorrect') {
      chapterBreakdown[chId].incorrect++;
      if (r.errorType) {
        chapterBreakdown[chId].reasons[r.errorType] = (chapterBreakdown[chId].reasons[r.errorType] || 0) + 1;
      }
    } else {
      chapterBreakdown[chId].unattempted++;
    }
  });

  // Calculate mistake breakdown summary
  const mistakeCounts = {};
  let totalTaggedMistakes = 0;
  results.questionResults.forEach(r => {
    if (r.status === 'incorrect' || r.status === 'skipped') {
      if (r.errorType) {
        mistakeCounts[r.errorType] = (mistakeCounts[r.errorType] || 0) + 1;
        totalTaggedMistakes++;
      }
    }
  });

  // Find dominant mistake reason
  let dominantReason = null;
  let maxReasonCount = 0;
  Object.entries(mistakeCounts).forEach(([id, count]) => {
    if (count > maxReasonCount) {
      maxReasonCount = count;
      dominantReason = DB.errorTypes.find(et => et.id === id);
    }
  });

  // Actionable Insight computation
  let insightTitle = 'Continuous Improvement';
  let insightDesc = 'Review your solutions and tag the reasons for any missed questions to get tailored recommendations.';
  let insightRecom = 'Practice daily with timed tests to maintain your edge.';

  if (dominantReason) {
    if (dominantReason.id === 'conceptual_gap') {
      insightTitle = 'Primary Challenge: Concept Clarity 🧠';
      insightDesc = `You lost ${maxReasonCount} question(s) due to core concept gaps. Factual biology questions require crystal clear conceptual foundation.`;
      insightRecom = '💡 Recommended: Re-read NCERT theory for weak chapters and re-attempt concept-specific quizzes.';
    } else if (dominantReason.id === 'time') {
      insightTitle = 'Primary Challenge: Time Management ⏱️';
      insightDesc = `You reported time pressure on ${maxReasonCount} question(s). Average pace was ${avgSeconds}s/question (NEET Biology target is ~40–50s).`;
      insightRecom = '💡 Recommended: Practice timed chapter tests to build rapid question elimination instinct.';
    } else if (dominantReason.id === 'confused') {
      insightTitle = 'Primary Challenge: Option Elimination 🤔';
      insightDesc = `You were stuck between 2 close options on ${maxReasonCount} question(s). This shows good partial knowledge but needs precise distinction.`;
      insightRecom = '💡 Recommended: Focus on exception cases, keywords in NCERT lines, and assertion-reason patterns.';
    } else if (dominantReason.id === 'silly_mistake') {
      insightTitle = 'Primary Challenge: Careless Errors ⚠️';
      insightDesc = `You made ${maxReasonCount} avoidable silly mistake(s) on questions you knew. In NEET, negative marking on known questions heavily impacts rank.`;
      insightRecom = '💡 Recommended: Read NOT / INCORRECT keywords twice before confirming your option bubble.';
    } else if (dominantReason.id === 'misread') {
      insightTitle = 'Primary Challenge: Question Interpretation 😵';
      insightDesc = `${maxReasonCount} question(s) were misread or misinterpreted.`;
      insightRecom = '💡 Recommended: Underline key conditions in questions before selecting answers.';
    } else if (dominantReason.id === 'memory_lapse') {
      insightTitle = 'Primary Challenge: Factual Recall 📚';
      insightDesc = `${maxReasonCount} question(s) slipped due to factual or data memory gaps.`;
      insightRecom = '💡 Recommended: Make one-page formula/examples flashcards for direct NCERT tables.';
    } else if (dominantReason.id === 'guessed') {
      insightTitle = 'Primary Challenge: Random Guessing 🎯';
      insightDesc = `You guessed on ${maxReasonCount} question(s). Random guessing carries a negative penalty in NEET.`;
      insightRecom = '💡 Recommended: Skip questions with zero familiarity unless you can eliminate at least 2 options.';
    }
  } else if (incorrectCount === 0 && unattemptedCount === 0) {
    insightTitle = 'Outstanding Mastery! 🌟';
    insightDesc = 'Flawless performance! 100% accuracy with zero mistakes.';
    insightRecom = '💡 Recommended: Keep the momentum going by attempting Full-Length Mock Tests.';
  }

  // Filter questions according to current active tab
  const filteredQuestionResults = results.questionResults.map((r, originalIdx) => ({ ...r, originalIdx })).filter(r => {
    if (_resultFilter === 'incorrect') return r.status === 'incorrect';
    if (_resultFilter === 'correct') return r.status === 'correct';
    if (_resultFilter === 'skipped') return r.status === 'skipped';
    return true;
  });

  const correctPct = Math.round((correctCount / totalQ) * 100);
  const incorrectPct = Math.round((incorrectCount / totalQ) * 100);
  const unattemptedPct = 100 - correctPct - incorrectPct;

  container.innerHTML = `
    <div class="result-v2-container">
      
      <!-- ================= 1. Score & Hero Header ================= -->
      <div class="result-v2-hero">
        <div class="result-v2-hero-header">
          <div class="result-v2-pill-badge">
            <span>🎉 ${isCuet ? 'CUET (UG) Test Done' : 'Test Completed'}</span>
          </div>
          <div style="display:flex;align-items:center;gap:var(--sp-2);">
            <div class="result-v2-neet-badge">
              <span>${isCuet ? '🔵 CUET Score' : '🎯 NEET Score'}: <strong>${evaluatedScore}</strong> / ${maxMarks}</span>
            </div>
          </div>
        </div>

        <div class="result-v2-main-score-box">
          <div>
            <div style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.85);margin-bottom:6px;font-weight:800;">Total ${isCuet ? 'CUET (UG)' : 'NEET'} Score</div>
            <div style="display:flex;align-items:baseline;gap:10px;">
              <span class="result-v2-score-num">${evaluatedScore}</span>
              <span class="result-v2-score-max">/ ${maxMarks} Marks &middot; ${correctCount}/${totalQ} Qs</span>
            </div>
          </div>
        </div>

        <!-- 6 Compact Statistics -->
        <div class="result-v2-stats-grid">
          <div class="result-v2-stat-tile">
            <div class="result-v2-stat-tile-val" style="color:#a7f3d0;">${accuracy}%</div>
            <div class="result-v2-stat-tile-label">Accuracy</div>
          </div>
          <div class="result-v2-stat-tile">
            <div class="result-v2-stat-tile-val" style="color:#6ee7b7;">${correctCount}</div>
            <div class="result-v2-stat-tile-label">Correct (+${correctCount * (isCuet ? 5 : 4)})</div>
          </div>
          <div class="result-v2-stat-tile">
            <div class="result-v2-stat-tile-val" style="color:#fca5a5;">${incorrectCount}</div>
            <div class="result-v2-stat-tile-label">Wrong (−${incorrectCount})</div>
          </div>
          <div class="result-v2-stat-tile">
            <div class="result-v2-stat-tile-val" style="color:#cbd5e1;">${unattemptedCount}</div>
            <div class="result-v2-stat-tile-label">Skipped (0)</div>
          </div>
          <div class="result-v2-stat-tile">
            <div class="result-v2-stat-tile-val">${timeStr}</div>
            <div class="result-v2-stat-tile-label">Time Spent</div>
          </div>
          <div class="result-v2-stat-tile">
            <div class="result-v2-stat-tile-val" style="color:#fef08a;">${rank}</div>
            <div class="result-v2-stat-tile-label">Bio Rank</div>
          </div>
        </div>
      </div>

      <!-- ================= 2. Question Review Section ================= -->
      <div class="result-section" id="question-review-section">
        <div class="result-section-header">
          <div>
            <div class="result-section-title">
              <span>📝 Question Review & Solutions</span>
            </div>
            <div class="result-section-subtitle">Click any question to view full solution, options, and tag mistake reasons</div>
          </div>
        </div>

        <!-- Filter tabs -->
        <div class="q-review-filter-tabs">
          <button class="q-review-tab-btn ${_resultFilter === 'all' ? 'active' : ''}" onclick="setResultFilter('all')">
            All Questions (${totalQ})
          </button>
          <button class="q-review-tab-btn ${_resultFilter === 'incorrect' ? 'active' : ''}" onclick="setResultFilter('incorrect')">
            ❌ Incorrect (${incorrectCount})
          </button>
          <button class="q-review-tab-btn ${_resultFilter === 'correct' ? 'active' : ''}" onclick="setResultFilter('correct')">
            ✅ Correct (${correctCount})
          </button>
          <button class="q-review-tab-btn ${_resultFilter === 'skipped' ? 'active' : ''}" onclick="setResultFilter('skipped')">
            — Skipped (${unattemptedCount})
          </button>
        </div>

        <!-- Question Cards List -->
        <div class="q-review-list">
          ${filteredQuestionResults.map(r => {
            const q = r.question;
            const qNum = r.originalIdx + 1;
            const isExpanded = _expandedQuestions.has(r.originalIdx) || _resultFilter === 'incorrect';
            const userAnsText = r.selected !== null && r.selected !== undefined ? ['A','B','C','D'][r.selected] + '. ' + q.options[r.selected] : 'Not attempted';
            const correctAnsText = ['A','B','C','D'][q.correct] + '. ' + q.options[q.correct];
            const chName = q.chapter ? (DB.chapters.find(c => c.id === q.chapter)?.name || q.chapter) : '';

            return `
              <div class="q-review-card status-${r.status}" id="q-card-${r.originalIdx}">
                <div class="q-review-card-header" onclick="toggleQuestionExpand(${r.originalIdx})">
                  <div class="q-review-card-topline">
                    <div class="q-review-meta">
                      <span class="q-review-num-chip ${r.status}">
                        ${r.status === 'correct' ? `Q${qNum} · Correct ✅` : r.status === 'incorrect' ? `Q${qNum} · Wrong ❌` : `Q${qNum} · Skipped —`}
                      </span>
                      ${chName ? `<span style="font-size:11px;color:var(--neutral-500);font-weight:600;">${escapeHtml(chName)}</span>` : ''}
                      ${q.ncertReference ? `<span class="badge" style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;font-size:10px;">📖 ${escapeHtml(q.ncertReference)}</span>` : ''}
                    </div>
                    <div style="display:flex;align-items:center;gap:var(--sp-2);">
                      <span class="badge badge-${r.status === 'correct' ? 'success' : r.status === 'incorrect' ? 'error' : 'neutral'}">
                        ${r.status === 'correct' ? '+4 Marks' : r.status === 'incorrect' ? '−1 Mark' : '0 Marks'}
                      </span>
                      <span style="font-size:12px;color:var(--neutral-400);">${isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  <div class="q-review-text">${q.text}</div>

                  ${r.status === 'correct' ? `
                    <div class="q-review-correct-badge-row">
                      <span class="q-review-correct-pill">✓ Choice: <strong>${escapeHtml(correctAnsText)}</strong></span>
                    </div>
                  ` : `
                    <div class="q-review-answers-compact">
                      <div>
                        Your Answer: <strong style="${r.status === 'incorrect' ? 'color:var(--error-700);' : ''}">${escapeHtml(userAnsText)}</strong>
                      </div>
                      <div>
                        Correct Answer: <strong style="color:var(--success-700);">${escapeHtml(correctAnsText)}</strong>
                      </div>
                    </div>
                  `}
                </div>

                <!-- "Why did I get this wrong?" Section for incorrect / skipped -->
                ${r.status !== 'correct' ? `
                  <div class="why-wrong-box">
                    <div class="why-wrong-header">
                      <span>🤔 Why did I get this wrong?</span>
                      ${r.errorType ? `<span style="font-size:11px;color:#b45309;font-weight:700;">Saved ✓</span>` : ''}
                    </div>
                    <div class="why-wrong-options-grid">
                      ${DB.errorTypes.map(et => `
                        <button type="button" 
                          class="why-wrong-chip ${r.errorType === et.id ? 'selected' : ''}" 
                          onclick="selectMistakeReason(${r.originalIdx}, '${et.id}', event)"
                          title="${et.description}">
                          <span>${et.icon || '📌'}</span>
                          <span>${et.label}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Collapsible Explanation Details -->
                <div class="q-review-card-details" style="${isExpanded ? 'display:block;' : 'display:none;'}">
                  <div style="font-size:11px;font-weight:700;color:var(--neutral-500);text-transform:uppercase;margin-bottom:var(--sp-2);">Options:</div>
                  <div class="q-review-options-list">
                    ${q.options.map((opt, oi) => {
                      const isCorrect = oi === q.correct;
                      const isUserSelected = oi === r.selected;
                      const cls = isCorrect ? 'is-correct' : (isUserSelected && !isCorrect ? 'is-user-wrong' : '');
                      return `
                        <div class="q-review-opt ${cls}">
                          <div>
                            <strong>${['A','B','C','D'][oi]}.</strong> ${escapeHtml(opt)}
                          </div>
                          <div>
                            ${isCorrect ? '<span style="font-size:11px;font-weight:700;color:var(--success-700);">✓ Correct Answer</span>' : ''}
                            ${isUserSelected && !isCorrect ? '<span style="font-size:11px;font-weight:700;color:var(--error-700);">✗ Your Choice</span>' : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>

                  ${q.explanation ? `
                    <div class="q-review-exp-box">
                      <div style="font-weight:700;color:var(--primary-700);margin-bottom:4px;display:flex;align-items:center;gap:4px;">
                        <span>💡 Detailed Solution</span>
                      </div>
                      <div>${q.explanation}</div>
                    </div>
                  ` : ''}

                  <div style="display:flex;justify-content:flex-end;margin-top:var(--sp-3);">
                    <button class="btn btn-ghost btn-sm" style="font-size:11px;color:var(--neutral-500);" onclick="openQuestionReportModal(window._currentResults.questionResults[${r.originalIdx}].question, ${qNum})">
                      ⚠️ Report Question Issue
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ================= 3. My Mistake Analysis ================= -->
      <div class="result-section" id="mistake-analysis-section">
        <div class="result-section-header">
          <div>
            <div class="result-section-title">
              <span>🔍 My Mistake Analysis</span>
              <span class="badge badge-primary" style="font-size:11px;">Why did you lose marks?</span>
            </div>
            <div class="result-section-subtitle">
              ${incorrectCount > 0 
                ? 'Tag your wrong questions below to reveal what causes your mark loss.' 
                : 'Zero incorrect questions! No mistakes to analyze.'}
            </div>
          </div>
        </div>

        ${incorrectCount > 0 ? `
          <div class="mistake-analysis-card">
            <div style="margin-bottom:var(--sp-4);font-size:var(--text-xs);font-weight:700;color:var(--neutral-600);text-transform:uppercase;letter-spacing:0.5px;">
              Mark Loss Distribution (${totalTaggedMistakes}/${incorrectCount} tagged)
            </div>

            ${DB.errorTypes.map(et => {
              const count = mistakeCounts[et.id] || 0;
              const barPct = incorrectCount > 0 ? Math.round((count / incorrectCount) * 100) : 0;
              if (count === 0 && totalTaggedMistakes > 0) return '';
              return `
                <div class="mistake-analysis-row">
                  <div class="mistake-analysis-label">
                    <span>${et.icon || '📌'}</span>
                    <span>${et.label}</span>
                  </div>
                  <div class="mistake-analysis-bar-wrap">
                    <div class="mistake-analysis-bar-fill" style="width:${barPct}%;"></div>
                  </div>
                  <div class="mistake-analysis-count">
                    ${count} Qs (${count > 0 ? `−${count}` : '0'})
                  </div>
                </div>
              `;
            }).join('')}

            ${totalTaggedMistakes === 0 ? `
              <div style="text-align:center;padding:var(--sp-3);background:var(--white);border-radius:var(--radius-md);border:1px dashed var(--neutral-300);font-size:var(--text-xs);color:var(--neutral-500);">
                👉 Select reasons under the <strong>Question Review</strong> cards above to see your personalized mistake breakdown.
              </div>
            ` : ''}

            <!-- Actionable Insights Callout -->
            <div class="actionable-insight-box">
              <div class="actionable-insight-title">
                <span>💡 ${insightTitle}</span>
              </div>
              <div class="actionable-insight-desc">
                ${insightDesc}
              </div>
              <div class="actionable-insight-recom">
                ${insightRecom}
              </div>
            </div>
          </div>
        ` : `
          <div style="text-align:center;padding:var(--sp-6);background:#ecfdf5;border-radius:var(--radius-md);border:1px solid #a7f3d0;">
            <div style="font-size:32px;margin-bottom:var(--sp-2);">🏆</div>
            <div style="font-weight:700;font-size:var(--text-base);color:#065f46;">Zero Mistakes! Perfect Execution.</div>
            <p style="font-size:var(--text-xs);color:#047857;margin-top:4px;">You answered every attempted question correctly. Continue practicing full tests to maintain peak accuracy.</p>
          </div>
        `}
      </div>

      <!-- ================= 4. Performance Overview ================= -->
      <div class="result-section">
        <div class="result-section-header">
          <div>
            <div class="result-section-title">
              <span>📊 Performance Overview</span>
            </div>
            <div class="result-section-subtitle">Visual breakdown of your test accuracy, score distribution, and speed</div>
          </div>
        </div>

        <div class="result-perf-grid">
          <!-- Score Distribution -->
          <div class="result-perf-card">
            <div class="result-perf-card-title">
              <span>🎯 Score Distribution</span>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);font-weight:700;margin-bottom:4px;">
                <span style="color:var(--success-600);">${correctCount} Correct</span>
                <span style="color:var(--error-600);">${incorrectCount} Wrong</span>
                <span style="color:var(--neutral-500);">${unattemptedCount} Skipped</span>
              </div>
              <div class="result-perf-ratio-bar">
                <div class="result-perf-ratio-seg correct" style="width:${correctPct}%;"></div>
                <div class="result-perf-ratio-seg incorrect" style="width:${incorrectPct}%;"></div>
                <div class="result-perf-ratio-seg unattempted" style="width:${Math.max(0, unattemptedPct)}%;"></div>
              </div>
              <div class="result-perf-legend">
                <div class="result-perf-legend-item"><div class="result-perf-legend-dot" style="background:var(--success-500);"></div> Correct (${correctPct}%)</div>
                <div class="result-perf-legend-item"><div class="result-perf-legend-dot" style="background:var(--error-500);"></div> Wrong (${incorrectPct}%)</div>
              </div>
            </div>
          </div>

          <!-- Accuracy Status -->
          <div class="result-perf-card">
            <div class="result-perf-card-title">
              <span>🎯 Accuracy Rating</span>
            </div>
            <div>
              <div style="font-size:var(--text-2xl);font-weight:800;color:${accuracy >= 80 ? 'var(--success-600)' : accuracy >= 50 ? 'var(--warning-600)' : 'var(--error-600)'};">
                ${accuracy}%
              </div>
              <div style="font-size:var(--text-xs);color:var(--neutral-600);margin-top:2px;">
                ${accuracy >= 85 ? '🌟 Excellent NEET Readiness' : accuracy >= 65 ? '👍 Good Foundation, Refine Weak Spots' : '⚠️ Concept Revision Required'}
              </div>
              <div class="progress-bar" style="height:6px;margin-top:var(--sp-2);">
                <div class="progress-fill ${accuracy >= 80 ? 'success' : ''}" style="width:${accuracy}%;"></div>
              </div>
            </div>
          </div>

          <!-- Time Efficiency -->
          <div class="result-perf-card">
            <div class="result-perf-card-title">
              <span>⏱️ Speed & Efficiency</span>
            </div>
            <div>
              <div style="font-size:var(--text-2xl);font-weight:800;color:var(--primary-600);">
                ${avgSeconds}s <span style="font-size:var(--text-xs);font-weight:500;color:var(--neutral-500);">/ question</span>
              </div>
              <div style="font-size:var(--text-xs);color:var(--neutral-600);margin-top:2px;">
                ${avgSeconds <= 50 ? '⚡ Fast & efficient pace' : avgSeconds <= 75 ? '⏱️ On target for NEET (~72s max)' : '🐢 High time per question'}
              </div>
              <div style="font-size:11px;color:var(--neutral-400);margin-top:var(--sp-2);">
                Total time: ${timeStr}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 5. Chapter-wise Performance ================= -->
      <div class="result-section">
        <div class="result-section-header">
          <div>
            <div class="result-section-title">
              <span>📚 Chapter-wise Breakdown</span>
            </div>
            <div class="result-section-subtitle">Performance and mistake pattern across chapters in this test</div>
          </div>
        </div>

        <div>
          ${Object.values(chapterBreakdown).map(ch => {
            const chAcc = ch.total > 0 ? Math.round((ch.correct / ch.total) * 100) : 0;
            const reasonEntries = Object.entries(ch.reasons);
            return `
              <div class="result-chapter-card">
                <div class="result-chapter-header">
                  <div class="result-chapter-name">
                    <span>${ch.icon}</span>
                    <span>${escapeHtml(ch.name)}</span>
                  </div>
                  <div class="result-chapter-stats">
                    <span style="font-weight:700;color:${chAcc >= 75 ? 'var(--success-600)' : chAcc >= 50 ? 'var(--warning-600)' : 'var(--error-600)'};">
                      ${chAcc}% Accuracy
                    </span>
                    <span style="color:var(--neutral-400);">•</span>
                    <span style="color:var(--success-600);font-weight:600;">${ch.correct} Correct</span>
                    <span style="color:var(--neutral-400);">•</span>
                    <span style="color:var(--error-600);font-weight:600;">${ch.incorrect} Wrong</span>
                  </div>
                </div>

                <div class="progress-bar" style="height:5px;">
                  <div class="progress-fill ${chAcc >= 80 ? 'success' : ''}" style="width:${chAcc}%;"></div>
                </div>

                ${reasonEntries.length > 0 ? `
                  <div class="result-chapter-mistake-tags">
                    <span style="font-size:11px;font-weight:700;color:var(--neutral-500);align-self:center;">Mistakes:</span>
                    ${reasonEntries.map(([rid, cnt]) => {
                      const etObj = DB.errorTypes.find(e => e.id === rid);
                      return `
                        <span class="result-chapter-mistake-pill">
                          ${etObj ? etObj.icon : '⚠️'} ${etObj ? etObj.label : rid} — ${cnt}
                        </span>
                      `;
                    }).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ================= 6. Improvement Section & Actions ================= -->
      <div class="result-section" style="background:#f0fdf4;border-color:#bbf7d0;">
        <div class="result-section-header">
          <div>
            <div class="result-section-title" style="color:#065f46;">
              <span>🚀 Improve Your Weak Areas</span>
            </div>
            <div class="result-section-subtitle" style="color:#047857;">
              Targeted practice loops to convert mistakes into guaranteed NEET marks
            </div>
          </div>
        </div>

        <p style="font-size:var(--text-xs);color:#166534;line-height:1.5;margin-bottom:var(--sp-4);">
          All incorrect questions are automatically synced to your <strong>Improvement Book</strong> for Spaced Re-testing (Day 1 → Day 4 → Day 10).
        </p>

        <div class="result-v2-actions">
          <button class="btn btn-primary" onclick="proceedToWeaknessAnalysis()">
            Practice Weak Chapters →
          </button>
          <button class="btn btn-secondary" onclick="setResultFilter('incorrect'); document.getElementById('question-review-section').scrollIntoView({ behavior: 'smooth' });">
            Review Wrong Questions (${incorrectCount})
          </button>
          <button class="btn btn-outline" onclick="App.navigate('improvement-book')">
            Open Improvement Book 📖
          </button>
          <button class="btn btn-ghost" onclick="App.navigate('home')">
            Back to Dashboard 🏠
          </button>
        </div>
      </div>

    </div>
  `;
}

/* ---- Question Review Filter & Toggle Handlers ---- */
window.setResultFilter = function(filter) {
  _resultFilter = filter;
  const container = document.getElementById('screen-container');
  if (container && window._currentResults) {
    renderResult(container, window._currentResults);
  }
};

window.toggleQuestionExpand = function(originalIdx) {
  if (_expandedQuestions.has(originalIdx)) {
    _expandedQuestions.delete(originalIdx);
  } else {
    _expandedQuestions.add(originalIdx);
  }
  const card = document.getElementById(`q-card-${originalIdx}`);
  if (card) {
    const details = card.querySelector('.q-review-card-details');
    const arrow = card.querySelector('.q-review-card-topline span:last-child');
    if (details) {
      const isNowExpanded = _expandedQuestions.has(originalIdx);
      details.style.display = isNowExpanded ? 'block' : 'none';
      if (arrow) arrow.textContent = isNowExpanded ? '▲' : '▼';
    }
  }
};

/* ---- Save & Tag Student Mistake Reason ---- */
window.selectMistakeReason = function(originalIdx, reasonId, event) {
  if (event) event.stopPropagation();

  if (!window._currentResults) return;
  const r = window._currentResults.questionResults[originalIdx];
  if (!r) return;

  // Toggle or assign reason
  const newReason = (r.errorType === reasonId) ? null : reasonId;
  r.errorType = newReason;

  // Save to State (localStorage)
  try {
    const state = State.get();
    if (!state.mistakeReasons) state.mistakeReasons = {};

    const attemptKey = window._currentResults._attemptKey || 'last_attempt';
    if (!state.mistakeReasons[attemptKey]) {
      state.mistakeReasons[attemptKey] = {};
    }

    const qId = r.questionId || r.question.id || `q_${originalIdx}`;
    if (newReason) {
      state.mistakeReasons[attemptKey][qId] = newReason;
      state.mistakeReasons[qId] = newReason; // general backup
    } else {
      delete state.mistakeReasons[attemptKey][qId];
      delete state.mistakeReasons[qId];
    }
    State.save(state);

    if (window.App && App.showToast) {
      const et = DB.errorTypes.find(e => e.id === newReason);
      if (et) {
        App.showToast(`Reason saved: ${et.icon || '📌'} ${et.label}`);
      }
    }
  } catch (err) {
    console.warn('Could not persist mistake reason:', err);
  }

  // Re-render result screen to update mistake analysis and chapter stats in real-time
  const container = document.getElementById('screen-container');
  if (container) {
    renderResult(container, window._currentResults);
  }
};

window.tagError = function(incorrectIdx, errorTypeId, btn) {
  if (window._currentResults) {
    const incorrectQs = window._currentResults.questionResults.filter(r => r.status === 'incorrect');
    if (incorrectQs[incorrectIdx]) {
      const originalIdx = window._currentResults.questionResults.indexOf(incorrectQs[incorrectIdx]);
      window.selectMistakeReason(originalIdx, errorTypeId);
    }
  }
};

window.proceedToWeaknessAnalysis = function() {
  App.navigate('weakness-analysis', window._currentResults);
};

function formatSeconds(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

/* ============================================================
   HomeSlider — auto-advancing content carousel
   ============================================================ */
const HomeSlider = (() => {
  let current = 0;
  let timer = null;
  const INTERVAL = 5000;

  function init() {
    current = 0;
    startAuto();
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }

  function stopAuto() { clearInterval(timer); }

  function goTo(idx) {
    const slides = document.querySelectorAll('#slider-track .slider-slide');
    const dots = document.querySelectorAll('#slider-dots .slider-dot');
    if (!slides.length) return;
    const total = slides.length;
    current = ((idx % total) + total) % total;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    const track = document.getElementById('slider-track');
    if (track) track.style.transform = `translateX(-${current * 100}%)`;
    startAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  return { init, goTo, next, prev, stopAuto };
})();

/* ============================================================
   HomeReveal — scroll-triggered entrance animations
   ============================================================ */
const HomeReveal = (() => {
  let observer = null;

  function init() {
    if (observer) observer.disconnect();
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('revealed'));
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Animate counters inside
          entry.target.querySelectorAll('[data-count]').forEach(animateCount);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (target <= 0) { el.textContent = target; return; }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 20));
    const tick = () => {
      current += step;
      if (current >= target) { el.textContent = target; return; }
      el.textContent = current;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return { init };
})();

window.openQuestionReportModal = function (questionData, qNumber) {
  if (!questionData) return;
  const qId = questionData.id || questionData._id || '';
  const qText = questionData.text || '';
  const chapterName = questionData.chapterName || (window.DB && window.DB.chapters && window.DB.chapters.find(c => c.id === questionData.chapter)?.name) || questionData.chapter || 'General';

  let modal = document.getElementById('global-question-report-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-question-report-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:var(--sp-4);">
      <div class="card" style="max-width:480px;width:100%;background:var(--surface);box-shadow:var(--shadow-xl);border-radius:var(--radius-lg);padding:var(--sp-5);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-3);">
          <div style="font-weight:700;font-size:var(--text-base);display:flex;align-items:center;gap:var(--sp-2);">
            <span>⚠️ Report Question ${qNumber ? `#${qNumber}` : ''}</span>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('global-question-report-modal').remove()" style="font-size:16px;line-height:1;padding:4px 8px;">✕</button>
        </div>

        <p style="font-size:var(--text-xs);color:var(--neutral-500);margin-bottom:var(--sp-3);line-height:1.4;background:var(--neutral-50);padding:var(--sp-2);border-radius:var(--radius-sm);border-left:3px solid var(--primary-500);">
          "${qText.length > 100 ? qText.substring(0, 100) + '…' : qText}"
        </p>

        <form id="global-report-form" onsubmit="event.preventDefault(); window.submitGlobalQuestionReport('${qId}', '${(qText || '').replace(/'/g, "\\'")}');">
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label" style="font-size:var(--text-xs);font-weight:600;margin-bottom:4px;">What issue did you find?</label>
            <select class="form-select form-select-sm" id="global-report-reason" required style="width:100%;">
              <option value="Incorrect Answer / Wrong Correct Option">Incorrect Answer / Wrong Correct Option</option>
              <option value="Question Formulation / Typo Error">Question Formulation / Typo Error</option>
              <option value="Incorrect / Incomplete Options">Incorrect / Incomplete Options</option>
              <option value="Wrong or Misleading Explanation">Wrong or Misleading Explanation</option>
              <option value="Other">Other Issue</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom:var(--sp-4);">
            <label class="form-label" style="font-size:var(--text-xs);font-weight:600;margin-bottom:4px;">Details (optional):</label>
            <textarea class="form-input form-input-sm" id="global-report-comments" rows="3" placeholder="Explain what looks wrong so the admin team can fix it…" style="width:100%;font-size:var(--text-xs);"></textarea>
          </div>

          <div style="display:flex;gap:var(--sp-2);justify-content:flex-end;">
            <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('global-question-report-modal').remove()">Cancel</button>
            <button class="btn btn-primary btn-sm" type="submit" id="global-report-submit-btn">Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

window.submitGlobalQuestionReport = async function (qId, qText) {
  const reason = document.getElementById('global-report-reason')?.value || 'General Issue';
  const comments = document.getElementById('global-report-comments')?.value.trim() || '';
  const btn = document.getElementById('global-report-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

  try {
    if (window.ApiClient) {
      await ApiClient.post('/reports', {
        questionId: qId,
        questionText: qText,
        reason,
        comments,
      });
    }
    const modal = document.getElementById('global-question-report-modal');
    if (modal) modal.remove();
    if (window.App && App.showToast) {
      App.showToast('✅ Question reported for admin review. Thank you!');
    } else {
      alert('✅ Question reported for admin review. Thank you!');
    }
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Report'; }
    alert('Could not submit report: ' + err.message);
  }
};

window.reportQuestionDirectly = function (qId, text, chapter) {
  window.openQuestionReportModal({ id: qId, text, chapter });
};

window.HomeSlider = HomeSlider;
window.HomeReveal = HomeReveal;

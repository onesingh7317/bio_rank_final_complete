/* ============================================================
   app.js — Main Router & App Controller for Bio Rank
   Drives screen rendering, navigation, and app state.
   ============================================================ */

const App = (() => {

  const NAV_SCREENS = ['home', 'pyq-test', 'chapter-test', 'improvement-book', 'performance'];
  // Full set of routable screens
  const SCREENS = [
    'config', 'foundation', 'analyzing', 'weakness-map', 'home',
    'pyq-test', 'chapter-test', 'improvement-book', 'performance',
    'test', 'result', 'weakness-analysis', 'micro-retest',
    'spaced-retest', 'improvement-verified', 'feedback', 'platform-improvement',
    'profile', 'settings', 'help',
    'full-length-test', 'flt-result', 'flt-review',
    // Admin panel screens — added in Stage 8. 'admin' is the route-guard
    // entry point (checks role against the backend, then redirects);
    // it is never the final screen a renderer targets directly.
    'admin', 'admin-login', 'admin-chapters', 'admin-subskills',
    'admin-questions', 'admin-question-form', 'admin-csv-import',
    'admin-fulltests', 'admin-auditlogs',
  ];

  let current = { screen: null, data: null };

  /* ---- Navigate to a screen ---- */
  function navigate(screen, data) {
    if (!SCREENS.includes(screen)) {
      console.warn('Unknown screen:', screen);
      return;
    }
    current = { screen, data };

    // Scroll to top on screen change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const container = document.getElementById('screen-container');
    if (!container) return;

    // Test screen is handled by TestEngine.start, not a render function
    if (screen === 'test') {
      if (data && data.questions) {
        TestEngine.start({
          questions: data.questions,
          mode: data.mode || 'chapter',
          meta: data.meta || {},
          onComplete: data.onComplete || ((results) => navigate('result', results)),
        });
      } else {
        navigate('home');
      }
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Dispatch to the matching render function
    const renderer = RENDERERS[screen];
    if (renderer) {
      try {
        renderer(container, data);
      } catch (err) {
        console.error('Render error for screen', screen, err);
        container.innerHTML = renderErrorState(err);
      }
    } else {
      container.innerHTML = `<div class="card" style="text-align:center;padding:var(--sp-10);"><p>Screen "${screen}" not found.</p><button class="btn btn-primary" onclick="App.navigate('home')">Go Home</button></div>`;
    }

    // Update nav highlight & visibility
    updateNav(screen);
    updateShellVisibility(screen);

    // Persist current screen — but never an admin screen. Reloading the
    // app should always re-run the 'admin' guard fresh (which re-checks
    // the token against the backend), not restore straight into a
    // previously-visited admin screen from localStorage.
    if (!(screen === 'admin' || screen.startsWith('admin-'))) {
      const state = State.get();
      state.currentScreen = screen;
      State.save(state);
    }
  }

  /* ---- Map screen names to render functions ---- */
  const RENDERERS = {
    'config':               renderConfig,
    'foundation':           renderFoundation,
    'analyzing':            renderAnalyzing,
    'weakness-map':         renderWeaknessMap,
    'home':                 renderHome,
    'pyq-test':             renderPYQTest,
    'chapter-test':         renderChapterTest,
    'improvement-book':     renderImprovementBook,
    'performance':          renderPerformance,
    'result':               renderResult,
    'weakness-analysis':    renderWeaknessAnalysis,
    'micro-retest':         renderMicroRetest,
    'spaced-retest':        renderSpacedRetest,
    'improvement-verified': renderImprovementVerified,
    'feedback':             renderFeedback,
    'platform-improvement': renderPlatformImprovement,
    'profile':              renderProfile,
    'settings':             renderSettings,
    'help':                 renderHelp,
    'full-length-test':     renderFullLengthTest,
    'flt-result':           renderFLTResult,
    'flt-review':           renderFLTReview,
    // Admin panel
    'admin':                renderAdminGuard,
    'admin-login':          renderAdminLogin,
    'admin-chapters':       renderAdminChapters,
    'admin-subskills':      renderAdminSubSkills,
    'admin-questions':      renderAdminQuestions,
    'admin-question-form':  renderAdminQuestionForm,
    'admin-csv-import':     renderAdminCsvImport,
    'admin-fulltests':      renderAdminFullLengthTests,
    'admin-auditlogs':      renderAdminAuditLogs,
  };

  /* ---- Update nav active states ---- */
  function updateNav(screen) {
    const navItems = document.querySelectorAll('.bottom-nav-item, .drawer-nav-item[data-screen], .more-menu-item[data-screen]');
    navItems.forEach(item => {
      const target = item.getAttribute('data-screen');
      // Highlight the nav item that matches, or home for non-nav screens
      const isActive = target === screen
        || (screen === 'weakness-map' && target === 'home')
        || (screen === 'micro-retest' && target === 'improvement-book')
        || (screen === 'spaced-retest' && target === 'improvement-book')
        || (screen === 'improvement-verified' && target === 'improvement-book')
        || (screen === 'weakness-analysis' && target === 'improvement-book')
        || (screen === 'result' && target === 'home')
        || (screen === 'feedback' && target === 'home')
        || (screen === 'platform-improvement' && target === 'home')
        || (screen === 'analyzing' && target === 'home')
        || (screen === 'foundation' && target === 'home')
        || (screen === 'test' && target === 'home')
        || (screen === 'full-length-test' && target === 'home')
        || (screen === 'flt-result' && target === 'home')
        || (screen === 'flt-review' && target === 'home');
      item.classList.toggle('active', isActive);
    });
  }

  /* ---- Show/hide shell elements based on screen ---- */
  function updateShellVisibility(screen) {
    const state = State.get();
    const isOnboarding = ['config', 'foundation', 'analyzing'].includes(screen);
    // Admin screens are a fully separate area — the student bottom-nav/
    // topbar chrome should never layer on top of them, regardless of
    // whether the student's own onboarding is complete.
    const isAdminScreen = screen === 'admin' || screen.startsWith('admin-');
    const showChrome = state.configured && !isOnboarding && !isAdminScreen;

    const topbar    = document.getElementById('topbar');
    const bottomNav = document.getElementById('bottom-nav');

    if (showChrome) {
      topbar?.classList.remove('hidden');
      bottomNav?.classList.remove('hidden');
    } else {
      topbar?.classList.add('hidden');
      bottomNav?.classList.add('hidden');
    }

    // Update student info in topbar/drawer
    updateStudentInfo(state);
  }

  /* ---- Update student info + streak display ---- */
  function updateStudentInfo(state) {
    const name = state.student?.name || 'Student';
    const streak = state.performance?.currentStreak || 0;
    const rank = state.performance?.rank;
    const initial = (name.charAt(0) || 'S').toUpperCase();

    const tStreak = document.getElementById('topbar-streak-count');
    if (tStreak) tStreak.textContent = streak;

    // Drawer user card
    const dName   = document.getElementById('drawer-user-name');
    const dRank   = document.getElementById('drawer-user-rank');
    const dStreak = document.getElementById('drawer-user-streak');
    const dAvatar = document.getElementById('drawer-avatar');

    if (dName)   dName.textContent = name;
    if (dRank)   dRank.textContent = rank ? `Bio Rank #${rank}` : 'Bio Rank —';
    if (dStreak) dStreak.textContent = `🔥 ${streak} Day Streak`;
    if (dAvatar) dAvatar.textContent = initial;
  }

  /* ---- Error state HTML ---- */
  function renderErrorState(err) {
    return `
      <div class="card" style="text-align:center;padding:var(--sp-10);max-width:480px;margin:0 auto;">
        <div style="font-size:48px;margin-bottom:var(--sp-4);">⚠️</div>
        <h2 style="font-size:var(--text-xl);font-weight:700;color:var(--neutral-900);margin-bottom:var(--sp-2);">Something went wrong</h2>
        <p style="color:var(--neutral-500);margin-bottom:var(--sp-5);">An error occurred while loading this screen. Please try again.</p>
        <button class="btn btn-primary" onclick="App.navigate('home')">Back to Home</button>
      </div>
    `;
  }

  /* ---- Toast notification ---- */
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ---- Wire up nav click handlers ---- */
  function bindNav() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const screen = item.getAttribute('data-screen');
        if (screen) navigate(screen);
      });
    });

    // Keyboard: Escape closes any overlay/test
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const toast = document.getElementById('toast');
        if (toast) toast.classList.remove('show');
      }
    });
  }

  /* ---- Initialize app on page load ---- */
  function init() {
    bindNav();

    // Admin entry point: visiting the app with #admin in the URL routes
    // straight to the admin guard, independent of student onboarding
    // state. This is a deliberate choice — there is no other URL-based
    // routing anywhere in this app (navigate() is purely in-memory), and
    // a visible "Admin" link in the student-facing nav/drawer would
    // advertise the admin panel to every regular student, which isn't
    // appropriate. A hash check is the minimal option that doesn't
    // require introducing full URL routing just for this one entry point.
    if (window.location.hash === '#admin') {
      navigate('admin');
      return;
    }

    const state = State.get();

    // Decide starting screen
    if (!state.configured) {
      navigate('config');
    } else if (!state.foundationDone) {
      navigate('home'); // configured but skip foundation for demo friendliness
    } else if (state.currentScreen && SCREENS.includes(state.currentScreen) && state.currentScreen !== 'config') {
      navigate(state.currentScreen);
    } else {
      navigate('home');
    }
  }

  /* ---- Log Out function ---- */
  function logout(confirmFirst = false) {
    if (confirmFirst) {
      const ok = window.confirm('Are you sure you want to log out from this device?');
      if (!ok) return;
    }
    // Clear student state
    try {
      localStorage.removeItem('bioready_v1');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear error', e);
    }

    // Clear any admin tokens or mock auth tokens
    if (window.ApiClient && typeof ApiClient.clearToken === 'function') {
      ApiClient.clearToken();
    }

    // Remove hash if any
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Reset State object in memory
    if (window.State && typeof State.reset === 'function') {
      State.reset();
    }

    // Close any open menus or drawers
    const moreMenu = document.getElementById('more-menu');
    const moreBtn  = document.getElementById('more-btn');
    const drawer   = document.getElementById('nav-drawer');
    const overlay  = document.getElementById('drawer-overlay');
    if (moreMenu) moreMenu.classList.remove('open');
    if (moreBtn) moreBtn.classList.remove('active');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('drawer-open');

    // Update shell & navigate to config screen
    navigate('config');
    showToast('Logged out successfully');
  }

  /* ---- Public API ---- */
  return { navigate, showToast, init, logout, SCREENS };
})();

// `const App = ...` above only creates a local/module-scope binding — it does
// NOT add a `window.App` property (unlike `var`). drawer.js's click handlers
// (including the Profile item in the "more" menu) guard on `window.App`
// before calling App.navigate(), so without this line those clicks silently
// no-op.
window.App = App;

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', () => App.init());


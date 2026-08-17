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
    'profile', 'settings', 'help', 'contact',
    'full-length-test', 'flt-result', 'flt-review',
    'about', 'privacy-policy', 'terms', 'disclaimer',
    // Admin panel screens — added in Stage 8. 'admin' is the route-guard
    // entry point (checks role against the backend, then redirects);
    // it is never the final screen a renderer targets directly.
    'admin', 'admin-login', 'admin-chapters', 'admin-subskills',
    'admin-questions', 'admin-question-form', 'admin-ncert-focus', 'admin-ncert-form', 'admin-csv-import',
    'admin-fulltests', 'admin-flt-questions', 'admin-reports', 'admin-auditlogs',
    'ncert-bio-focus',
  ];

  let current = { screen: null, data: null };
  let isNavigatingFromHash = false;

  /* ---- Navigate to a screen ---- */
  function navigate(screen, data) {
    if (!SCREENS.includes(screen)) {
      console.warn('Unknown screen:', screen);
      return;
    }
    current = { screen, data };

    // Update browser URL hash for direct access and history support
    try {
      const currentHash = window.location.hash.replace(/^#\/?/, '');
      if (!isNavigatingFromHash && currentHash !== screen) {
        if (window.history && window.history.pushState) {
          window.history.pushState({ screen, data }, '', `#${screen}`);
        } else {
          window.location.hash = screen;
        }
      }
    } catch (e) {
      console.warn('History navigation update failed', e);
    }

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

    // Persist current screen — but never an admin screen or temporary modal.
    if (!(screen === 'admin' || screen.startsWith('admin-') || screen === 'test')) {
      const state = (window.State && typeof State.get === 'function') ? State.get() : {};
      if (state && typeof State.save === 'function') {
        state.currentScreen = screen;
        State.save(state);
      }
    }
  }

  /* ---- Map screen names to render functions ---- */
  const RENDERERS = {
    'config':               typeof renderConfig === 'function' ? renderConfig : null,
    'foundation':           typeof renderFoundation === 'function' ? renderFoundation : null,
    'analyzing':            typeof renderAnalyzing === 'function' ? renderAnalyzing : null,
    'weakness-map':         typeof renderWeaknessMap === 'function' ? renderWeaknessMap : null,
    'home':                 typeof renderHome === 'function' ? renderHome : null,
    'pyq-test':             typeof renderPYQTest === 'function' ? renderPYQTest : null,
    'chapter-test':         typeof renderChapterTest === 'function' ? renderChapterTest : null,
    'improvement-book':     typeof renderImprovementBook === 'function' ? renderImprovementBook : null,
    'performance':          typeof renderPerformance === 'function' ? renderPerformance : null,
    'result':               typeof renderResult === 'function' ? renderResult : null,
    'weakness-analysis':    typeof renderWeaknessAnalysis === 'function' ? renderWeaknessAnalysis : null,
    'micro-retest':         typeof renderMicroRetest === 'function' ? renderMicroRetest : null,
    'spaced-retest':        typeof renderSpacedRetest === 'function' ? renderSpacedRetest : null,
    'improvement-verified': typeof renderImprovementVerified === 'function' ? renderImprovementVerified : null,
    'feedback':             typeof renderFeedback === 'function' ? renderFeedback : null,
    'platform-improvement': typeof renderPlatformImprovement === 'function' ? renderPlatformImprovement : null,
    'profile':              typeof renderProfile === 'function' ? renderProfile : null,
    'settings':             typeof renderSettings === 'function' ? renderSettings : null,
    'help':                 typeof renderHelp === 'function' ? renderHelp : null,
    'contact':              typeof renderContact === 'function' ? renderContact : null,
    'full-length-test':     typeof renderFullLengthTest === 'function' ? renderFullLengthTest : null,
    'flt-result':           typeof renderFLTResult === 'function' ? renderFLTResult : null,
    'flt-review':           typeof renderFLTReview === 'function' ? renderFLTReview : null,
    // Information & About Screens
    'about':                typeof renderAbout === 'function' ? renderAbout : null,
    'privacy-policy':       typeof renderPrivacyPolicy === 'function' ? renderPrivacyPolicy : null,
    'terms':                typeof renderTerms === 'function' ? renderTerms : null,
    'disclaimer':           typeof renderDisclaimer === 'function' ? renderDisclaimer : null,
    // Admin panel
    'admin':                typeof renderAdminGuard === 'function' ? renderAdminGuard : null,
    'admin-login':          typeof renderAdminLogin === 'function' ? renderAdminLogin : null,
    'admin-chapters':       typeof renderAdminChapters === 'function' ? renderAdminChapters : null,
    'admin-subskills':      typeof renderAdminSubSkills === 'function' ? renderAdminSubSkills : null,
    'admin-questions':      typeof renderAdminQuestions === 'function' ? renderAdminQuestions : null,
    'admin-question-form':  typeof renderAdminQuestionForm === 'function' ? renderAdminQuestionForm : null,
    'admin-ncert-focus':    typeof renderAdminNcertFocus === 'function' ? renderAdminNcertFocus : null,
    'admin-ncert-form':     typeof renderAdminNcertForm === 'function' ? renderAdminNcertForm : null,
    'admin-csv-import':     typeof renderAdminCsvImport === 'function' ? renderAdminCsvImport : null,
    'admin-fulltests':      typeof renderAdminFullLengthTests === 'function' ? renderAdminFullLengthTests : null,
    'admin-flt-questions':  typeof renderAdminFLTQuestions === 'function' ? renderAdminFLTQuestions : null,
    'admin-reports':        typeof renderAdminReports === 'function' ? renderAdminReports : null,
    'admin-auditlogs':      typeof renderAdminAuditLogs === 'function' ? renderAdminAuditLogs : null,
    'ncert-bio-focus':      typeof renderNcertBioFocus === 'function' ? renderNcertBioFocus : null,
  };

  /* ---- Update nav active states ---- */
  function updateNav(screen) {
    const navItems = document.querySelectorAll('.bottom-nav-item, .drawer-nav-item[data-screen], .more-menu-item[data-screen]');
    navItems.forEach(item => {
      const target = item.getAttribute('data-screen');
      const isActive = target === screen
        || (screen === 'ncert-bio-focus' && target === 'ncert-bio-focus')
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
    const state = (window.State && typeof State.get === 'function') ? State.get() : { configured: false };
    const isOnboarding = ['config', 'foundation', 'analyzing'].includes(screen);
    const isAdminScreen = screen === 'admin' || screen.startsWith('admin-');
    const isTestScreen = screen === 'test';
    const isPublicInfoScreen = ['about', 'privacy-policy', 'terms', 'disclaimer', 'help', 'contact'].includes(screen);

    // Chrome is visible whenever user is configured, or on public info screens
    const showChrome = (!isOnboarding && !isAdminScreen && !isTestScreen) && (state.configured || isPublicInfoScreen);

    const topbar    = document.getElementById('topbar');
    const bottomNav = document.getElementById('bottom-nav');
    const footer    = document.getElementById('site-footer');

    if (showChrome) {
      topbar?.classList.remove('hidden');
      if (state.configured) {
        bottomNav?.classList.remove('hidden');
      } else {
        bottomNav?.classList.add('hidden');
      }
      footer?.classList.remove('hidden');
    } else {
      topbar?.classList.add('hidden');
      bottomNav?.classList.add('hidden');
      footer?.classList.add('hidden');
    }

    // Update student info in topbar/drawer
    updateStudentInfo(state);
  }

  /* ---- Update student info + streak display ---- */
  function updateStudentInfo(state) {
    const name = state?.student?.name || 'Student';
    const streak = state?.performance?.currentStreak || 0;
    const rank = state?.performance?.rank;
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
      <div class="card" style="text-align:center;padding:var(--sp-10);max-width:480px;margin:var(--sp-6) auto;">
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

  /* ---- Parse route from hash ---- */
  function getScreenFromHash() {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    if (!raw) return null;
    // Map aliases
    if (raw === 'contact-us' || raw === 'contact') return 'contact';
    if (raw === 'privacy' || raw === 'privacy_policy') return 'privacy-policy';
    if (raw === 'terms-and-conditions' || raw === 'tos') return 'terms';
    if (raw === 'about-us') return 'about';
    if (SCREENS.includes(raw)) return raw;
    return null;
  }

  /* ---- Wire up nav click handlers & history listeners ---- */
  function bindNav() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const screen = item.getAttribute('data-screen');
        if (screen) navigate(screen);
      });
    });

    // Browser back / forward support (popstate & hashchange)
    const handleRoutePop = (e) => {
      const targetScreen = (e.state && e.state.screen) || getScreenFromHash();
      if (targetScreen && SCREENS.includes(targetScreen)) {
        if (current.screen !== targetScreen) {
          isNavigatingFromHash = true;
          navigate(targetScreen, e.state ? e.state.data : null);
          isNavigatingFromHash = false;
        }
      } else if (!targetScreen) {
        const state = (window.State && typeof State.get === 'function') ? State.get() : {};
        if (state.configured) {
          isNavigatingFromHash = true;
          navigate('home');
          isNavigatingFromHash = false;
        }
      }
    };

    window.addEventListener('popstate', handleRoutePop);
    window.addEventListener('hashchange', handleRoutePop);

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

    // Check for direct URL hash routing (e.g. #about, #admin, #pyq-test, etc.)
    const hashScreen = getScreenFromHash();
    if (hashScreen === 'admin' || (hashScreen && hashScreen.startsWith('admin-'))) {
      navigate('admin');
      return;
    }

    const state = (window.State && typeof State.get === 'function') ? State.get() : {};

    // Allow direct access to public informational routes even before onboarding
    const publicScreens = ['about', 'privacy-policy', 'terms', 'disclaimer', 'help', 'contact'];
    if (hashScreen && publicScreens.includes(hashScreen)) {
      navigate(hashScreen);
      return;
    }

    if (hashScreen && SCREENS.includes(hashScreen) && state.configured) {
      navigate(hashScreen);
      return;
    }

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

// Assign to window for global access across scripts
window.App = App;

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', () => App.init());
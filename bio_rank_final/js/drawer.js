/* ============================================================
   drawer.js — Hamburger side navigation drawer
   Slides open from the left, reuses App.navigate() for routing.
   ============================================================ */

(function () {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawer        = document.getElementById('nav-drawer');
  const overlay       = document.getElementById('drawer-overlay');
  const closeBtn       = document.getElementById('drawer-close-btn');

  if (!drawer || !overlay) return;

  let lastFocused = null;

  function updateDrawerUserInfo() {
    if (!window.State) return;
    const state = State.get();
    const name = state?.student?.name || 'Student';
    const streak = state?.performance?.currentStreak || 0;
    const testsAttempted = state?.performance?.testsAttempted || 0;
    const rank = state?.performance?.rank;
    const initial = (name.charAt(0) || 'S').toUpperCase();

    const dName   = document.getElementById('drawer-user-name');
    const dRank   = document.getElementById('drawer-user-rank');
    const dStreak = document.getElementById('drawer-user-streak');
    const dAvatar = document.getElementById('drawer-avatar');

    if (dName)   dName.textContent = name;
    if (dRank) {
      dRank.textContent = (testsAttempted > 0) ? `Bio Rank #${rank || 1}` : 'Bio Rank #—';
    }
    if (dStreak) dStreak.textContent = `🔥 ${streak} Day Streak`;
    if (dAvatar) dAvatar.textContent = initial;
  }

  function openDrawer() {
    lastFocused = document.activeElement;
    updateDrawerUserInfo();
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.classList.add('drawer-open');
    hamburgerBtn?.classList.add('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    closeBtn?.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
    hamburgerBtn?.classList.remove('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function toggleDrawer() {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  /* ---- Hamburger toggle ---- */
  hamburgerBtn?.addEventListener('click', toggleDrawer);

  /* ---- Overlay click closes drawer ---- */
  overlay.addEventListener('click', closeDrawer);

  /* ---- Close (X) button ---- */
  closeBtn?.addEventListener('click', closeDrawer);

  /* ---- Escape key closes drawer ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* ---- Routable nav items: reuse App.navigate() ---- */
  drawer.querySelectorAll('.drawer-nav-item[data-screen]').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const screen = item.getAttribute('data-screen');
      const anchor = item.getAttribute('data-anchor');

      closeDrawer();
      if (screen && window.App && typeof App.navigate === 'function') {
        App.navigate(screen);
        if (anchor) {
          // Wait for the screen to render before scrolling to the section
          requestAnimationFrame(() => {
            setTimeout(() => {
              document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
          });
        }
      }
    });
  });

  /* ---- Action items with no dedicated screen yet ---- */
  drawer.querySelectorAll('.drawer-nav-item[data-action]').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const action = item.getAttribute('data-action');
      closeDrawer();
      handleMenuAction(action);
    });
  });

  function handleMenuAction(action) {
    switch (action) {
      case 'logout': {
        if (window.App && typeof App.logout === 'function') {
          App.logout(true);
        } else {
          State.reset();
          window.location.reload();
        }
        break;
      }
      default:
        break;
    }
  }

  /* ============================================================
     3-DOT "MORE OPTIONS" MENU (header)
     ============================================================ */
  const moreBtn  = document.getElementById('more-btn');
  const moreMenu = document.getElementById('more-menu');

  if (moreBtn && moreMenu) {
    function openMoreMenu() {
      moreMenu.classList.add('open');
      moreBtn.classList.add('active');
      moreBtn.setAttribute('aria-expanded', 'true');
      moreMenu.setAttribute('aria-hidden', 'false');
    }

    function closeMoreMenu() {
      moreMenu.classList.remove('open');
      moreBtn.classList.remove('active');
      moreBtn.setAttribute('aria-expanded', 'false');
      moreMenu.setAttribute('aria-hidden', 'true');
    }

    function toggleMoreMenu() {
      if (moreMenu.classList.contains('open')) {
        closeMoreMenu();
      } else {
        openMoreMenu();
      }
    }

    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMoreMenu();
    });

    // Close when clicking anywhere outside the menu
    document.addEventListener('click', (e) => {
      if (moreMenu.classList.contains('open') && !moreMenu.contains(e.target) && e.target !== moreBtn) {
        closeMoreMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && moreMenu.classList.contains('open')) {
        closeMoreMenu();
      }
    });

    // Nav items -> navigate via App.navigate()
    moreMenu.querySelectorAll('.more-menu-item[data-screen]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const screen = item.getAttribute('data-screen');
        closeMoreMenu();
        if (screen === 'admin' || screen === 'admin-login') {
          window.open('#admin', '_blank');
          return;
        }
        if (screen && window.App && typeof App.navigate === 'function') {
          App.navigate(screen);
        }
      });
    });

    // Menu item actions (Logout lives at the bottom of this menu)
    moreMenu.querySelectorAll('.more-menu-item[data-action]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const action = item.getAttribute('data-action');
        closeMoreMenu();
        handleMenuAction(action);
      });
    });

    // Also close the more-menu if the hamburger drawer opens
    hamburgerBtn?.addEventListener('click', closeMoreMenu);
  }
})();

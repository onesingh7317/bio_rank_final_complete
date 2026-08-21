/* ============================================================
   account.js — Profile, Settings, and Help & Support screens
   ============================================================ */

/* ---- Profile Screen ---- */
function renderProfile(container) {
  const state = State.get();
  const student = state.student || {};
  const perf = state.performance || {};
  const name = student.name || 'Student';
  const initial = (name.charAt(0) || 'S').toUpperCase();
  const username = student.username || autoUsername(name);
  const classLabel = student.classLevel === 'Dropper'
    ? 'Dropper'
    : (student.classLevel ? (student.classLevel.startsWith('Class') ? student.classLevel : `Class ${student.classLevel}`) : 'Class 12th');

  container.innerHTML = `
    <div style="max-width:760px;">
      <div style="margin-bottom:var(--sp-6);">
        <div class="page-title">Profile</div>
        <div class="page-subtitle">Your account details and study stats</div>
      </div>

      <!-- Profile Hero -->
      <div class="card card-lg" style="display:flex;align-items:center;gap:var(--sp-5);margin-bottom:var(--sp-5);flex-wrap:wrap;">
        <div class="profile-pic-wrap" id="profile-pic-wrap" onclick="document.getElementById('profile-pic-input').click()" title="Change profile picture" role="button" tabindex="0">
          <div class="profile-pic-avatar" id="profile-pic-avatar" style="${student.avatarDataUrl ? `background-image:url('${student.avatarDataUrl}');` : ''}">
            ${student.avatarDataUrl ? '' : initial}
          </div>
          <div class="profile-pic-edit-badge">📷</div>
          <input type="file" id="profile-pic-input" accept="image/*" style="display:none;" onchange="Profile.onPictureSelected(this)" />
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-size:var(--text-xl);font-weight:800;color:var(--neutral-900);">${escapeHtml(name)}</div>
          <div style="font-size:var(--text-sm);color:var(--neutral-500);font-weight:600;margin-top:4px;display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
            <span>@${escapeHtml(username)}</span> &middot;
            <span class="vibe-tag fire" style="font-size:11px;padding:2px 8px;">${escapeHtml(classLabel)}</span> &middot;
            <span>Bio Rank #${perf.rank ?? '—'}</span> &middot;
            <span>🔥 ${perf.currentStreak ?? 0} day streak</span>
          </div>
          ${student.avatarDataUrl ? `<button class="btn btn-ghost btn-sm" style="padding-left:0;margin-top:var(--sp-1);" onclick="Profile.removePicture()">Remove photo</button>` : ''}
        </div>
        <button class="btn btn-outline btn-sm" onclick="App.navigate('config')">Edit Details</button>
      </div>

      <!-- Account Details: Username & Google Authentication -->
      <div class="card card-lg" style="margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-1);">Account Details</div>
        <div class="section-subtitle" style="margin-bottom:var(--sp-4);">Manage your profile username and linked Google authentication</div>

        <div class="grid-2" style="gap:var(--sp-4);align-items:end;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" for="profile-username">Username</label>
            <input class="form-input" id="profile-username" type="text" value="${escapeHtml(username)}" placeholder="e.g. bio_aryan" autocomplete="username" />
          </div>
          <button class="btn btn-primary" style="height:44px;" onclick="Profile.saveUsername()">Save Username</button>
        </div>

        <div style="height:1px;background:var(--neutral-100);margin:var(--sp-5) 0;"></div>

        <!-- Google Authentication Integration -->
        <div style="margin-bottom:var(--sp-3);">
          <div style="font-weight:700;color:var(--neutral-900);font-size:var(--text-sm);display:flex;align-items:center;gap:var(--sp-2);">
            <svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0;">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google Authentication</span>
          </div>
          <div style="font-size:var(--text-xs);color:var(--neutral-500);margin-top:2px;">
            Fast, secure 1-click access connected to your Google Account
          </div>
        </div>

        <div style="background:var(--neutral-50);border:1px solid var(--neutral-200);border-radius:var(--radius-md);padding:var(--sp-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
          <div style="display:flex;align-items:center;gap:var(--sp-3);">
            <div style="width:40px;height:40px;border-radius:50%;background:#ffffff;border:1px solid var(--neutral-200);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-xs);">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <div style="font-size:var(--text-sm);font-weight:700;color:var(--neutral-900);">
                ${escapeHtml(student.email || `${username}@gmail.com`)}
              </div>
              <div style="font-size:11px;color:var(--success-600);font-weight:600;display:flex;align-items:center;gap:4px;margin-top:2px;">
                <span>●</span> Connected with Google
              </div>
            </div>
          </div>

          <button class="btn btn-outline btn-sm" onclick="Profile.connectGoogle()" style="display:inline-flex;align-items:center;gap:var(--sp-2);background:#ffffff;">
            <span>🔄 Switch Google Account</span>
          </button>
        </div>

        <div style="font-size:var(--text-xs);color:var(--neutral-500);margin-top:var(--sp-3);line-height:1.5;">
          🔒 <strong>Security Note:</strong> Passwords are not required. Your learning progress and ranks are securely authenticated via Google Sign-In.
        </div>
      </div>

      <!-- Study Info -->
      <div class="perf-stats-grid" style="margin-bottom:var(--sp-5);">
        <div class="stat-card">
          <div class="stat-label">Class / Stage</div>
          <div class="stat-value" style="font-size:var(--text-2xl);color:var(--primary-600);">${escapeHtml(classLabel)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Target Year</div>
          <div class="stat-value" style="font-size:var(--text-2xl);">NEET ${student.targetYear || '—'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">School Board</div>
          <div class="stat-value" style="font-size:var(--text-2xl);">${student.board || '—'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Daily Study Hours</div>
          <div class="stat-value" style="font-size:var(--text-2xl);">${student.studyHoursPerDay || '—'}h</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Percentile</div>
          <div class="stat-value" style="font-size:var(--text-2xl);">${perf.percentile ?? '—'}%</div>
        </div>
      </div>

      <!-- Strong / Weak areas -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-3);">Confidence Areas</div>
        ${(student.strongAreas && student.strongAreas.length) ? `
          <div style="margin-bottom:var(--sp-3);">
            <div style="font-size:var(--text-xs);font-weight:800;color:var(--success-600);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--sp-2);">Strong</div>
            <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
              ${student.strongAreas.map(a => `<span class="error-tag selected" style="border-color:var(--success-500);background:var(--success-100);color:var(--success-600);">${a}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${(student.weakAreas && student.weakAreas.length) ? `
          <div>
            <div style="font-size:var(--text-xs);font-weight:800;color:var(--error-600);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--sp-2);">Needs Work</div>
            <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
              ${student.weakAreas.map(a => `<span class="error-tag selected" style="border-color:var(--error-500);background:var(--error-100);color:var(--error-600);">${a}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${(!student.strongAreas?.length && !student.weakAreas?.length) ? `<p style="color:var(--neutral-500);font-size:var(--text-sm);">No confidence areas set yet. Complete the setup to personalise your study plan.</p>` : ''}
      </div>

      <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;align-items:center;justify-content:space-between;margin-top:var(--sp-6);">
        <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="App.navigate('performance')">View Full Performance →</button>
          <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home</button>
        </div>
        <button class="btn btn-outline" style="color:var(--error-600);border-color:var(--error-200);" onclick="App.logout(true)">
          🚪 Log Out
        </button>
      </div>
    </div>
  `;
}

/* ---- Derive a default @username from the display name ---- */
function autoUsername(name) {
  const base = (name || 'student').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return base || 'student';
}

/* ---- Profile screen actions ----
   All of this is local/mock behaviour — no network calls, no cloud
   storage. When the backend is ready, these three methods are the
   places to swap in real API requests. */
const Profile = {

  /* -- Profile picture: preview locally and upload to backend -- */
  async onPictureSelected(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      App.showToast('Please choose an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      App.showToast('Please choose an image under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      const state = State.get();
      state.student = Object.assign({}, state.student, { avatarDataUrl: dataUrl });
      State.save(state);

      const avatar = document.getElementById('profile-pic-avatar');
      if (avatar) {
        avatar.style.backgroundImage = `url('${dataUrl}')`;
        avatar.textContent = '';
      }

      // Upload to live backend if authenticated
      if (window.ApiClient && ApiClient.getToken()) {
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          const res = await ApiClient.upload('/user/avatar', formData);
          if (res && res.avatarUrl) {
            state.student.avatarUrl = res.avatarUrl;
            State.save(state);
          }
        } catch (err) {
          console.warn('Could not upload avatar file to server:', err);
        }
      }

      App.showToast('✅ Profile picture updated');
    };
    reader.readAsDataURL(file);
  },

  /* -- Remove picture: revert to initial avatar -- */
  async removePicture() {
    const state = State.get();
    state.student = Object.assign({}, state.student, { avatarDataUrl: null, avatarUrl: null });
    State.save(state);

    if (window.ApiClient && ApiClient.getToken()) {
      try {
        await ApiClient.put('/user/profile', { avatarUrl: null });
      } catch (err) {}
    }

    const avatar = document.getElementById('profile-pic-avatar');
    if (avatar) {
      avatar.style.backgroundImage = '';
      const initial = (state.student.name?.charAt(0) || 'S').toUpperCase();
      avatar.textContent = initial;
    }
    App.showToast('Profile picture removed');
    App.navigate('profile');
  },

  /* -- Username: validate, persist locally, and sync to backend -- */
  async saveUsername() {
    const input = document.getElementById('profile-username');
    const value = (input ? input.value : '').toLowerCase().trim();

    if (!/^[a-z0-9_]{3,20}$/.test(value)) {
      App.showToast('Username must be 3–20 characters: letters, numbers, underscore only');
      return;
    }

    const state = State.get();
    state.student = Object.assign({}, state.student, { username: value });
    State.save(state);

    if (window.ApiClient && ApiClient.getToken()) {
      try {
        await ApiClient.put('/user/profile', { username: value });
      } catch (err) {
        console.warn('Could not sync username to backend:', err);
      }
    }

    App.showToast('✅ Username updated');
    App.navigate('profile');
  },

  /* -- Google Authentication: Connect or switch Google account on frontend -- */
  connectGoogle() {
    const state = State.get();
    const currentEmail = state.student?.email || `${state.student?.username || 'student'}@gmail.com`;
    
    // In frontend-first mode, simulate Google account prompt/sync
    const promptEmail = prompt('Enter your Google Account email to link:', currentEmail);
    if (!promptEmail) return;

    if (!promptEmail.includes('@') || !promptEmail.includes('.')) {
      App.showToast('Please enter a valid Google email address');
      return;
    }

    state.student = Object.assign({}, state.student, {
      email: promptEmail.toLowerCase().trim(),
      authProvider: 'google',
      googleLinked: true,
    });
    State.save(state);

    if (window.ApiClient && ApiClient.getToken()) {
      ApiClient.put('/user/profile', { email: promptEmail.toLowerCase().trim() }).catch(e => {});
    }

    App.showToast('✅ Google Account connected successfully!');
    App.navigate('profile');
  },
};

/* ---- Settings Screen ---- */
function renderSettings(container) {
  const state = State.get();
  const settings = Object.assign({ notifications: true, soundEffects: true }, state.settings || {});

  container.innerHTML = `
    <div style="max-width:640px;">
      <div style="margin-bottom:var(--sp-6);">
        <div class="page-title">Settings</div>
        <div class="page-subtitle">Manage your preferences and account</div>
      </div>

      <!-- Preferences -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-4);">Preferences</div>

        <label style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-3) 0;border-bottom:1px solid var(--neutral-100);cursor:pointer;">
          <div>
            <div style="font-weight:700;color:var(--neutral-900);font-size:var(--text-sm);">Notifications</div>
            <div style="font-size:var(--text-xs);color:var(--neutral-500);">Daily reminders and streak alerts</div>
          </div>
          <input type="checkbox" id="setting-notifications" ${settings.notifications ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--primary-600);cursor:pointer;" onchange="Settings.toggle('notifications', this.checked)" />
        </label>

        <label style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-3) 0;cursor:pointer;">
          <div>
            <div style="font-weight:700;color:var(--neutral-900);font-size:var(--text-sm);">Sound Effects</div>
            <div style="font-size:var(--text-xs);color:var(--neutral-500);">Feedback sounds during tests</div>
          </div>
          <input type="checkbox" id="setting-sound" ${settings.soundEffects ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--primary-600);cursor:pointer;" onchange="Settings.toggle('soundEffects', this.checked)" />
        </label>
      </div>

      <!-- Account -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-4);">Account</div>
        <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
          <button class="btn btn-outline btn-block" onclick="App.navigate('config')">Edit Profile Details</button>
          <button class="btn btn-outline btn-block" onclick="App.navigate('help')">Help &amp; Support</button>
          <button class="btn btn-outline btn-block" style="color:var(--error-600);border-color:var(--error-200);" onclick="App.logout(true)">🚪 Log Out</button>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card" style="border:1.5px solid var(--error-100);margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-2);color:var(--error-600);">Danger Zone</div>
        <p style="font-size:var(--text-sm);color:var(--neutral-500);margin-bottom:var(--sp-4);">This clears all local progress, streaks, and test history on this device. This can't be undone.</p>
        <button class="btn btn-block" style="background:var(--error-100);color:var(--error-600);" onclick="Settings.resetProgress()">Reset All Progress</button>
      </div>

      <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home</button>
    </div>
  `;
}

/* ---- Settings helper actions ---- */
const Settings = {
  toggle(key, value) {
    const state = State.get();
    const settings = Object.assign({ notifications: true, soundEffects: true }, state.settings || {});
    settings[key] = value;
    State.update({ settings });
    App.showToast(value ? '✅ Preference enabled' : '🔕 Preference disabled');
  },
  resetProgress() {
    const confirmed = window.confirm('Reset all your progress? This cannot be undone.');
    if (confirmed) {
      State.reset();
      window.location.reload();
    }
  }
};

/* ---- Help & Support Screen ---- */
function renderHelp(container) {
  const faqs = [
    {
      q: 'How is my Bio Rank calculated?',
      a: 'Your rank is based on overall accuracy, number of tests attempted, and how you perform relative to other students preparing for NEET.'
    },
    {
      q: 'How do streaks work?',
      a: 'Complete at least one test or practice session each day to keep your streak alive. Missing a day resets your current streak, but your longest streak is always saved.'
    },
    {
      q: 'Can I redo the setup questionnaire?',
      a: 'Yes — go to Settings → Edit Profile Details, or Profile → Edit Details, to update your target year, board, and study hours anytime.'
    },
    {
      q: 'How do I reset my progress?',
      a: 'Open Settings and use the Reset All Progress button in the Danger Zone. This clears all local data on this device.'
    },
    {
      q: 'Is my data saved online?',
      a: 'This app currently stores your progress locally on your device only. Clearing your browser data will remove it.'
    }
  ];

  container.innerHTML = `
    <div style="max-width:700px;">
      <div style="margin-bottom:var(--sp-6);">
        <div class="page-title">Help &amp; Support</div>
        <div class="page-subtitle">Answers to common questions, plus how to reach us</div>
      </div>

      <!-- FAQs -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-4);">Frequently Asked Questions</div>
        <div style="display:flex;flex-direction:column;">
          ${faqs.map((f, i) => `
            <div style="padding:var(--sp-4) 0;${i < faqs.length - 1 ? 'border-bottom:1px solid var(--neutral-100);' : ''}">
              <div style="font-weight:800;color:var(--neutral-900);font-size:var(--text-sm);margin-bottom:var(--sp-1);">${f.q}</div>
              <div style="font-size:var(--text-sm);color:var(--neutral-500);line-height:1.5;">${f.a}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Contact -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-3);">Still need help?</div>
        <p style="font-size:var(--text-sm);color:var(--neutral-500);margin-bottom:var(--sp-4);">Reach out and we'll get back to you as soon as we can.</p>
        <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">
          <a href="mailto:biorankofficial@gmail.com" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px;">✉️ Email biorankofficial@gmail.com</a>
          <button class="btn btn-secondary" onclick="App.navigate('contact')">Open Contact Page →</button>
        </div>
      </div>

      <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home</button>
    </div>
  `;
}

/* ---- Contact Us Screen ---- */
function renderContact(container) {
  container.innerHTML = `
    <div class="contact-page-container">

      <!-- 1. HERO -->
      <div class="contact-hero-card">
        <div class="contact-hero-badge">
          <img src="logo-square.jpg" alt="Bio Rank" class="contact-hero-logo" />
          <span>Bio Rank Support</span>
        </div>
        <h1 class="contact-hero-title">Contact Us</h1>
        <p class="contact-hero-subtitle">
          Have a question, suggestion, or need help? We're here to help.
        </p>
      </div>

      <!-- 2. MAIN CONTACT CARD -->
      <div class="contact-main-card">
        <div class="contact-icon-wrapper">
          <svg class="contact-mail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </div>

        <h2 class="contact-card-title">Get in Touch</h2>
        <p class="contact-card-text">
          For questions, suggestions, feedback, or reporting an issue, you can reach us directly by email.
        </p>

        <div class="contact-email-box">
          <div class="contact-email-label">Email Us</div>
          <a href="mailto:biorankofficial@gmail.com" class="contact-email-link" title="Send email to biorankofficial@gmail.com">
            biorankofficial@gmail.com
          </a>
          <div class="contact-email-action-row">
            <a href="mailto:biorankofficial@gmail.com" class="btn btn-primary contact-email-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </div>

      <!-- 3. WHAT YOU CAN CONTACT US ABOUT -->
      <div class="contact-topics-card">
        <div class="contact-topics-header">
          <div class="contact-topics-icon">💬</div>
          <div>
            <h3 class="contact-topics-title">What You Can Contact Us About</h3>
            <div class="contact-topics-subtitle">We welcome all inquiries from NEET aspirants and learners</div>
          </div>
        </div>

        <div class="contact-topics-grid">
          <!-- Item 1: Questions -->
          <div class="contact-topic-item">
            <div class="contact-topic-icon-badge">❓</div>
            <div class="contact-topic-content">
              <div class="contact-topic-name">Questions</div>
              <div class="contact-topic-desc">For questions about Bio Rank and its features.</div>
            </div>
          </div>

          <!-- Item 2: Suggestions -->
          <div class="contact-topic-item">
            <div class="contact-topic-icon-badge">💡</div>
            <div class="contact-topic-content">
              <div class="contact-topic-name">Suggestions</div>
              <div class="contact-topic-desc">Share ideas that could help improve Bio Rank.</div>
            </div>
          </div>

          <!-- Item 3: Report an Issue -->
          <div class="contact-topic-item">
            <div class="contact-topic-icon-badge">🛠️</div>
            <div class="contact-topic-content">
              <div class="contact-topic-name">Report an Issue</div>
              <div class="contact-topic-desc">Let us know about technical problems or incorrect information.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. SOCIAL MEDIA & COMMUNITY -->
      <div class="contact-topics-card" style="margin-top:var(--sp-4);">
        <div class="contact-topics-header">
          <div class="contact-topics-icon">🌐</div>
          <div>
            <h3 class="contact-topics-title">Connect on Social Media</h3>
            <div class="contact-topics-subtitle">Follow for daily NCERT flashcards, trick reels &amp; test updates</div>
          </div>
        </div>
        <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;margin-top:var(--sp-3);">
          <a href="https://www.instagram.com/biorank.official" target="_blank" rel="noopener noreferrer" class="social-icon-btn insta" style="padding:10px 18px;font-size:var(--text-sm);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <span>Instagram: @biorank.official</span>
          </a>
          <a href="https://youtube.com/@biorankofficial?si=nOsgnJAxGMNAQyzz" target="_blank" rel="noopener noreferrer" class="social-icon-btn yt" style="padding:10px 18px;font-size:var(--text-sm);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span>YouTube: @biorankofficial</span>
          </a>
        </div>
      </div>

      <!-- 5. PRIVACY NOTE -->
      <div class="contact-privacy-note">
        <div class="contact-privacy-icon">🔒</div>
        <div class="contact-privacy-text">
          <strong>Privacy Note:</strong> Please do not include passwords, payment details, or other sensitive personal information in your email.
        </div>
      </div>

      <!-- 5. BOTTOM CTA -->
      <div class="contact-bottom-cta">
        <h3 class="contact-cta-heading">We'd love to hear from you.</h3>
        <p class="contact-cta-text">Your feedback helps us make Bio Rank better.</p>
        <div class="contact-cta-actions">
          <a href="mailto:biorankofficial@gmail.com" class="btn btn-primary">✉️ Send an Email</a>
          <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home 🏠</button>
          <button class="btn btn-ghost" onclick="App.navigate('about')">About Bio Rank ℹ️</button>
        </div>
      </div>

    </div>
  `;
}

/* ---- About Us Screen ---- */
function renderAbout(container) {
  container.innerHTML = `
    <div class="about-page-container">
      
      <!-- 1. HERO -->
      <div class="about-hero-card">
        <div class="about-hero-badge">
          <img src="logo-square.jpg" alt="Bio Rank" class="about-hero-logo" />
          <span>About Bio Rank</span>
        </div>
        <h1 class="about-hero-title">About Bio Rank</h1>
        <div style="font-size:var(--text-lg);font-weight:700;color:#a7f3d0;margin-bottom:var(--sp-2);">
          Master Biology. Build Your Rank.
        </div>
        <p class="about-hero-lead">
          Bio Rank is built to make NEET Biology preparation more focused, organized, and practice-driven.
        </p>
        <div class="about-hero-tags">
          <span class="about-pill-tag">🎯 Targeted NCERT Practice</span>
          <span class="about-pill-tag">📊 Diagnostic Mistake Tagging</span>
          <span class="about-pill-tag">⚡ Spaced Revision Loops</span>
        </div>
      </div>

      <!-- 2. OUR MISSION -->
      <div class="about-section-card">
        <div class="about-section-header">
          <div class="about-section-icon">🎯</div>
          <div>
            <h2 class="about-section-title">Our Mission</h2>
            <div class="about-section-subtitle">Empowering NEET aspirants with structured, active preparation</div>
          </div>
        </div>
        <p class="about-text">
          At Bio Rank, our mission is to help NEET aspirants build stronger Biology preparation through structured practice, authentic PYQs, targeted tests, intelligent revision loops, and actionable performance tracking.
        </p>
        
        <div class="about-mission-grid">
          <div class="about-mission-item">
            <div class="about-mission-item-icon">⚡</div>
            <div>
              <div class="about-mission-item-title">Consistent Practice</div>
              <div class="about-mission-item-desc">Build rapid problem-solving speed, NCERT recall, and exam stamina through daily chapter drills.</div>
            </div>
          </div>
          <div class="about-mission-item">
            <div class="about-mission-item-icon">🔍</div>
            <div>
              <div class="about-mission-item-title">Understanding Mistakes</div>
              <div class="about-mission-item-desc">Diagnose precisely why marks slip—silly errors, conceptual gaps, time pressure, or misread questions.</div>
            </div>
          </div>
          <div class="about-mission-item">
            <div class="about-mission-item-icon">📍</div>
            <div>
              <div class="about-mission-item-title">Identifying Weak Areas</div>
              <div class="about-mission-item-desc">Pinpoint low-scoring chapters and high-weightage topics with automated chapter weakness mapping.</div>
            </div>
          </div>
          <div class="about-mission-item">
            <div class="about-mission-item-icon">📖</div>
            <div>
              <div class="about-mission-item-title">Smart Revision</div>
              <div class="about-mission-item-desc">Lock high-yield facts into long-term memory with structured Day 1 → Day 4 → Day 10 spaced review.</div>
            </div>
          </div>
          <div class="about-mission-item">
            <div class="about-mission-item-icon">📈</div>
            <div>
              <div class="about-mission-item-title">Measuring Improvement</div>
              <div class="about-mission-item-desc">Track real accuracy trends and time-per-question metrics to measure genuine progress over time.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. WHAT YOU CAN DO WITH BIO RANK -->
      <div class="about-section-card">
        <div class="about-section-header">
          <div class="about-section-icon">✨</div>
          <div>
            <h2 class="about-section-title">What You Can Do With Bio Rank</h2>
            <div class="about-section-subtitle">Dedicated tools tailored specifically for NEET Biology success</div>
          </div>
        </div>

        <div class="about-features-grid">
          <!-- 1. Chapter-wise PYQs -->
          <div class="about-feature-card">
            <div class="about-feature-top">
              <div class="about-feature-icon">📚</div>
              <span class="badge badge-primary">High Yield</span>
            </div>
            <h3 class="about-feature-title">Chapter-wise PYQs</h3>
            <p class="about-feature-desc">Practice Biology questions chapter by chapter to master historical question patterns and recurring NCERT lines.</p>
            <a href="#" class="about-feature-link" onclick="App.navigate('pyq-test'); return false;">Explore PYQs →</a>
          </div>

          <!-- 2. Practice Tests -->
          <div class="about-feature-card">
            <div class="about-feature-top">
              <div class="about-feature-icon">🧪</div>
              <span class="badge badge-neutral">Chapter Focused</span>
            </div>
            <h3 class="about-feature-title">Practice Tests</h3>
            <p class="about-feature-desc">Test your understanding and improve through regular practice sessions with timed chapter quizzes.</p>
            <a href="#" class="about-feature-link" onclick="App.navigate('chapter-test'); return false;">Start Chapter Practice →</a>
          </div>

          <!-- 3. Full-Length Tests -->
          <div class="about-feature-card">
            <div class="about-feature-top">
              <div class="about-feature-icon">📝</div>
              <span class="badge badge-neutral">Exam Simulation</span>
            </div>
            <h3 class="about-feature-title">Full-Length Tests</h3>
            <p class="about-feature-desc">Experience complete Biology tests with 90-100 questions to evaluate your overall preparation and exam stamina.</p>
            <a href="#" class="about-feature-link" onclick="App.navigate('full-length-test'); return false;">View Mock Tests →</a>
          </div>

          <!-- 4. Performance & Rank Tracking -->
          <div class="about-feature-card">
            <div class="about-feature-top">
              <div class="about-feature-icon">📊</div>
              <span class="badge badge-neutral">Analytics</span>
            </div>
            <h3 class="about-feature-title">Performance &amp; Rank Tracking</h3>
            <p class="about-feature-desc">Track your test performance, accuracy rates, speed per question, and rank progression over time.</p>
            <a href="#" class="about-feature-link" onclick="App.navigate('performance'); return false;">View Performance →</a>
          </div>

          <!-- 5. Improvement Book -->
          <div class="about-feature-card">
            <div class="about-feature-top">
              <div class="about-feature-icon">📕</div>
              <span class="badge badge-success">Smart Loop</span>
            </div>
            <h3 class="about-feature-title">Improvement Book</h3>
            <p class="about-feature-desc">Review questions that need more attention, tag mistake reasons, and focus on converting weak areas into guaranteed marks.</p>
            <a href="#" class="about-feature-link" onclick="App.navigate('improvement-book'); return false;">Open Improvement Book →</a>
          </div>

          <!-- 6. Smart Revision -->
          <div class="about-feature-card">
            <div class="about-feature-top">
              <div class="about-feature-icon">🔁</div>
              <span class="badge badge-neutral">Retention</span>
            </div>
            <h3 class="about-feature-title">Smart Revision</h3>
            <p class="about-feature-desc">Use repeated practice, scheduled re-tests, and spaced review to permanently strengthen critical biology concepts.</p>
            <a href="#" class="about-feature-link" onclick="App.navigate('ncert-bio-focus'); return false;">NCERT Bio Focus →</a>
          </div>
        </div>
      </div>

      <!-- 4. WHY BIO RANK? -->
      <div class="about-section-card">
        <div class="about-section-header">
          <div class="about-section-icon">💡</div>
          <div>
            <h2 class="about-section-title">Why Bio Rank?</h2>
            <div class="about-section-subtitle">Designed around what actually drives NEET score improvement</div>
          </div>
        </div>

        <div class="about-why-grid">
          <div class="about-why-item">
            <div class="about-why-bullet">✓</div>
            <div>
              <div class="about-why-title">Biology-focused preparation</div>
              <div class="about-why-desc">100% focused on NEET Botany and Zoology to help you maximize the 360 marks that anchor your medical rank.</div>
            </div>
          </div>
          <div class="about-why-item">
            <div class="about-why-bullet">✓</div>
            <div>
              <div class="about-why-title">Chapter-wise and structured practice</div>
              <div class="about-why-desc">Systematic topic progression covering Class 11 and Class 12 aligned directly with NCERT guidelines.</div>
            </div>
          </div>
          <div class="about-why-item">
            <div class="about-why-bullet">✓</div>
            <div>
              <div class="about-why-title">PYQ-based preparation</div>
              <div class="about-why-desc">Practice with verified past exam questions to master high-frequency keywords, exceptions, and patterns.</div>
            </div>
          </div>
          <div class="about-why-item">
            <div class="about-why-bullet">✓</div>
            <div>
              <div class="about-why-title">Performance-focused learning</div>
              <div class="about-why-desc">Get instant diagnostic breakdown on speed, accuracy, and error types without confusing clutter.</div>
            </div>
          </div>
          <div class="about-why-item">
            <div class="about-why-bullet">✓</div>
            <div>
              <div class="about-why-title">Revision and improvement mindset</div>
              <div class="about-why-desc">Every wrong question is tagged, saved, and scheduled for systematic re-testing until mastered.</div>
            </div>
          </div>
          <div class="about-why-item">
            <div class="about-why-bullet">✓</div>
            <div>
              <div class="about-why-title">Simple, distraction-free experience</div>
              <div class="about-why-desc">Clean, aesthetic interface built purely for learning—no ads, no unnecessary noise, no gimmicks.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. OUR APPROACH -->
      <div class="about-section-card">
        <div class="about-section-header">
          <div class="about-section-icon">🔄</div>
          <div>
            <h2 class="about-section-title">Our Approach</h2>
            <div class="about-section-subtitle">A simple, proven 5-step loop for mastery</div>
          </div>
        </div>

        <div class="about-approach-flow">
          <div class="about-step-card">
            <div class="about-step-num">01</div>
            <div class="about-step-name">LEARN</div>
            <div class="about-step-desc">Strengthen your Biology concepts thoroughly from NCERT.</div>
          </div>
          <div class="about-step-arrow">→</div>
          <div class="about-step-card">
            <div class="about-step-num">02</div>
            <div class="about-step-name">PRACTICE</div>
            <div class="about-step-desc">Solve questions and PYQs regularly under timed conditions.</div>
          </div>
          <div class="about-step-arrow">→</div>
          <div class="about-step-card">
            <div class="about-step-num">03</div>
            <div class="about-step-name">ANALYZE</div>
            <div class="about-step-desc">Understand your test performance and tag mistake reasons.</div>
          </div>
          <div class="about-step-arrow">→</div>
          <div class="about-step-card">
            <div class="about-step-num">04</div>
            <div class="about-step-name">IMPROVE</div>
            <div class="about-step-desc">Focus on weaker chapters with targeted practice drills.</div>
          </div>
          <div class="about-step-arrow">→</div>
          <div class="about-step-card">
            <div class="about-step-num">05</div>
            <div class="about-step-name">REPEAT</div>
            <div class="about-step-desc">Revise and practice consistently to lock in exam readiness.</div>
          </div>
        </div>
      </div>

      <!-- 6. WHO IS BIO RANK FOR? -->
      <div class="about-section-card">
        <div class="about-section-header">
          <div class="about-section-icon">👥</div>
          <div>
            <h2 class="about-section-title">Built for Biology Preparation</h2>
            <div class="about-section-subtitle">Designed specifically for serious medical aspirants</div>
          </div>
        </div>
        <p class="about-text" style="margin-bottom:var(--sp-4);">
          Bio Rank is built specifically for students preparing for NEET-UG who want a focused, organized platform for Biology practice, chapter tests, PYQs, spaced revision, and realistic performance tracking.
        </p>
        <div class="about-audience-pills">
          <span class="about-audience-pill">🌱 Class 11th Foundation</span>
          <span class="about-audience-pill">🌿 Class 12th Board &amp; NEET</span>
          <span class="about-audience-pill">🌳 Dropper / Repeater Batch</span>
          <span class="about-audience-pill">⚡ Rapid NCERT Revision</span>
        </div>
      </div>

      <!-- 7. INDEPENDENT PLATFORM NOTE -->
      <div class="about-disclaimer-note">
        <div style="font-size:18px;">ℹ️</div>
        <div>
          <strong>Independent Platform Note:</strong> Bio Rank is an independent educational platform and is not affiliated with, endorsed by, or officially associated with NTA or NEET.
        </div>
      </div>

      <!-- 8. CONTACT CTA -->
      <div class="about-cta-card">
        <div class="about-cta-title">Have a question or suggestion?</div>
        <p class="about-cta-desc">We'd love to hear from you. Get in touch with the Bio Rank team.</p>
        <div class="about-cta-buttons">
          <button class="btn btn-primary" onclick="App.navigate('contact')">Contact Us ✉️</button>
          <button class="btn btn-secondary" onclick="App.navigate('chapter-test')">Start Chapter Practice →</button>
          <button class="btn btn-ghost" onclick="App.navigate('home')">Back to Dashboard 🏠</button>
        </div>
      </div>

    </div>
  `;
}

/* ---- Privacy Policy Screen ---- */
function renderPrivacyPolicy(container) {
  container.innerHTML = `
    <div style="max-width:760px;">
      <div style="margin-bottom:var(--sp-6);">
        <div class="page-title">Privacy Policy</div>
        <div class="page-subtitle">Last updated: January 2026</div>
      </div>

      <div class="card" style="margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-2);">1. Data Privacy &amp; Local Storage</div>
        <p style="font-size:var(--text-sm);color:var(--neutral-600);line-height:1.7;margin-bottom:var(--sp-4);">
          Bio Rank values student privacy. Your test attempts, mistake tagging, streak records, and progress metrics are stored directly on your local device browser storage.
        </p>

        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-2);">2. No Third-Party Selling</div>
        <p style="font-size:var(--text-sm);color:var(--neutral-600);line-height:1.7;margin-bottom:var(--sp-4);">
          We do not sell, rent, or distribute student information to third parties or advertising brokers.
        </p>

        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-2);">3. Contact for Privacy Inquiries</div>
        <p style="font-size:var(--text-sm);color:var(--neutral-600);line-height:1.7;">
          If you have questions about privacy or data retention, contact us at <a href="mailto:biorankofficial@gmail.com" style="color:var(--primary-600);font-weight:600;">biorankofficial@gmail.com</a>.
        </p>
      </div>

      <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home</button>
    </div>
  `;
}

/* ---- Terms & Conditions Screen ---- */
function renderTerms(container) {
  if (typeof document !== 'undefined') {
    document.title = "Terms & Conditions | Bio Rank — NEET Biology Prep";
  }

  container.innerHTML = `
    <main class="terms-page-container" aria-label="Terms and Conditions">

      <!-- 1. HERO SECTION -->
      <section class="terms-hero-card">
        <div class="terms-hero-badge">
          <img src="logo-square.jpg" alt="Bio Rank" class="terms-hero-logo" />
          <span>User Agreement</span>
        </div>
        <h1 class="terms-hero-title">Terms &amp; Conditions</h1>
        <p class="terms-hero-subtitle">Please read these terms before using Bio Rank.</p>
      </section>

      <!-- 2. INTRO OVERVIEW -->
      <div class="terms-intro-box">
        <div class="terms-intro-icon">📜</div>
        <div class="terms-intro-content">
          <strong>Agreement to Terms:</strong> By accessing or using the Bio Rank website and educational tools, you agree to be bound by these Terms &amp; Conditions. Please review them carefully.
        </div>
      </div>

      <!-- 3. MAIN CONTENT SECTIONS -->
      <div class="terms-sections-stack">

        <!-- 1. Introduction -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">📖</div>
            <h2 class="terms-section-title">1. Introduction</h2>
          </div>
          <p class="terms-text">
            Welcome to Bio Rank. These Terms &amp; Conditions govern your access to and use of the Bio Rank website and its educational features.
          </p>
          <p class="terms-text">
            By accessing or using Bio Rank, you agree to these Terms &amp; Conditions. If you do not agree with these terms, please do not use the website.
          </p>
        </section>

        <!-- 2. About Bio Rank -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">🌱</div>
            <h2 class="terms-section-title">2. About Bio Rank</h2>
          </div>
          <p class="terms-text">
            Bio Rank is an independent educational platform designed to support students preparing for NEET Biology through practice questions, previous-year questions, tests, revision resources, and performance-related features.
          </p>
          <p class="terms-text">
            Bio Rank is intended to be used as a learning and practice resource.
          </p>
        </section>

        <!-- 3. Google Sign-In and User Accounts -->
        <section class="terms-section-card terms-card-highlight">
          <div class="terms-section-header">
            <div class="terms-section-icon">🔐</div>
            <h2 class="terms-section-title">3. Google Sign-In and User Accounts</h2>
          </div>
          <p class="terms-text">
            Bio Rank may allow users to create or access their account using Google Sign-In. When you choose to sign in with Google, authentication is handled through Google's authentication services.
          </p>
          <p class="terms-text">
            By using Google Sign-In, you agree to Google's applicable terms and policies in addition to these Bio Rank Terms &amp; Conditions.
          </p>
          <p class="terms-text">
            Bio Rank may receive limited account-related information from Google that is necessary to create and maintain your Bio Rank account, such as your name, email address, and profile information made available through the authentication process.
          </p>
          <p class="terms-text">
            Users are responsible for maintaining the security of their Google account and should contact Google if they believe their Google account has been compromised.
          </p>
        </section>

        <!-- 4. Account Use -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">👤</div>
            <h2 class="terms-section-title">4. Account Use</h2>
          </div>
          <p class="terms-text">
            If you use Google Sign-In or another supported authentication method to access Bio Rank, you are responsible for using your account appropriately.
          </p>
          <p class="terms-text">
            Users must not intentionally provide false information, impersonate another person, or use another person's account without authorization.
          </p>
          <p class="terms-text">
            Users should not share access to their account in a way that compromises account security.
          </p>
        </section>

        <!-- 5. Educational Content -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">📚</div>
            <h2 class="terms-section-title">5. Educational Content</h2>
          </div>
          <p class="terms-text">
            Bio Rank provides educational content including Biology questions, PYQs, tests, explanations, revision resources, and related learning materials.
          </p>
          <p class="terms-text">
            These resources are provided primarily for educational, practice, revision, and self-assessment purposes.
          </p>
          <p class="terms-text">
            Users should verify important examination-related information, including official dates, eligibility requirements, rules, and announcements, through relevant official sources.
          </p>
        </section>

        <!-- 6. No Official Affiliation -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">🏛️</div>
            <h2 class="terms-section-title">6. No Official Affiliation</h2>
          </div>
          <p class="terms-text">
            Bio Rank is an independent educational platform and is not affiliated with, endorsed by, sponsored by, or officially associated with the National Testing Agency (NTA), NEET, Google, or any government organization.
          </p>
          <p class="terms-text">
            References to NEET, NTA, Google, examinations, or related terminology are used only where necessary for educational, authentication, or informational purposes.
          </p>
        </section>

        <!-- 7. Intellectual Property -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">💡</div>
            <h2 class="terms-section-title">7. Intellectual Property</h2>
          </div>
          <p class="terms-text">
            Unless otherwise stated, Bio Rank's original branding, website design, interface elements, original written content, and other original materials are intended to remain the property of Bio Rank or their respective rights holders.
          </p>
          <p class="terms-text">
            Users may use Bio Rank for personal educational purposes but should not reproduce, redistribute, sell, or commercially exploit Bio Rank's original materials without appropriate permission.
          </p>
          <p class="terms-text">
            Third-party names, trademarks, logos, and materials remain the property of their respective owners.
          </p>
        </section>

        <!-- 8. Prohibited Activities -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">🚫</div>
            <h2 class="terms-section-title">8. Prohibited Activities</h2>
          </div>
          <p class="terms-text">Users must not engage in any of the following prohibited activities:</p>
          <div class="terms-prohibited-grid">
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Attempt to hack, disrupt, or damage the website.</span></div>
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Attempt unauthorized access to accounts, systems, or data.</span></div>
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Use automated methods to abuse or overload the website.</span></div>
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Upload or distribute malicious code.</span></div>
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Use the platform for unlawful activities.</span></div>
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Impersonate another person.</span></div>
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Access another user's account without authorization.</span></div>
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Copy or commercially redistribute Bio Rank's original content without permission.</span></div>
            <div class="terms-prohibited-item"><span class="terms-prohibited-cross">✕</span><span>Interfere with other users' access to the website.</span></div>
          </div>
        </section>

        <!-- 9. Third-Party Services -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">🧩</div>
            <h2 class="terms-section-title">9. Third-Party Services</h2>
          </div>
          <p class="terms-text">
            Bio Rank may rely on third-party services for certain functionality, including authentication, analytics, hosting, advertising, or other website features.
          </p>
          <p class="terms-text">
            Third-party services operate under their own terms and privacy policies.
          </p>
          <p class="terms-text">
            Users should review the applicable policies of third-party services when using features that rely on them.
          </p>
        </section>

        <!-- 10. Advertisements -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">📢</div>
            <h2 class="terms-section-title">10. Advertisements</h2>
          </div>
          <p class="terms-text">
            Bio Rank may display advertisements provided by third-party advertising services, including Google AdSense.
          </p>
          <p class="terms-text">
            Bio Rank does not necessarily endorse every product or service displayed through third-party advertisements.
          </p>
        </section>

        <!-- 11. Website Availability and Changes -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">⚡</div>
            <h2 class="terms-section-title">11. Website Availability and Changes</h2>
          </div>
          <p class="terms-text">
            We aim to keep Bio Rank available and functional, but we do not guarantee uninterrupted or error-free access to the website.
          </p>
          <p class="terms-text">
            We may update, modify, suspend, or discontinue features, content, or parts of the website when necessary.
          </p>
        </section>

        <!-- 12. No Guarantee of Results -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">🎯</div>
            <h2 class="terms-section-title">12. No Guarantee of Results</h2>
          </div>
          <p class="terms-text">
            Bio Rank is a preparation and learning platform. Use of the website does not guarantee any particular NEET score, percentile, rank, admission, college, or examination result.
          </p>
          <p class="terms-text">
            Individual outcomes depend on many factors, including preparation, consistency, understanding, and examination performance.
          </p>
        </section>

        <!-- 13. Suspension or Termination -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">⚠️</div>
            <h2 class="terms-section-title">13. Suspension or Termination</h2>
          </div>
          <p class="terms-text">
            Bio Rank may restrict or suspend access to the website or certain features if a user violates these Terms &amp; Conditions, misuses the platform, attempts unauthorized access, or engages in activities that may harm the website or other users.
          </p>
        </section>

        <!-- 14. Changes to These Terms -->
        <section class="terms-section-card">
          <div class="terms-section-header">
            <div class="terms-section-icon">📝</div>
            <h2 class="terms-section-title">14. Changes to These Terms</h2>
          </div>
          <p class="terms-text">
            Bio Rank may update these Terms &amp; Conditions from time to time to reflect changes to the website, features, services, authentication methods, or applicable requirements.
          </p>
          <p class="terms-text">
            Updated terms will be published on this page.
          </p>
          <div class="terms-date-row">
            <span class="terms-date-badge">📅 Last updated: August 17, 2026</span>
          </div>
        </section>

      </div>

      <!-- 15. CONTACT CTA -->
      <section class="terms-cta-card">
        <h2 class="terms-cta-heading">Questions About These Terms?</h2>
        <p class="terms-cta-text">If you have questions or concerns about these Terms &amp; Conditions, please contact us.</p>
        <div class="terms-cta-actions">
          <button class="btn btn-primary" onclick="App.navigate('contact')">Contact Us ✉️</button>
          <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home 🏠</button>
          <button class="btn btn-ghost" onclick="App.navigate('about')">About Bio Rank ℹ️</button>
        </div>
      </section>

    </main>
  `;
}

/* ---- Disclaimer Screen ---- */
function renderDisclaimer(container) {
  if (typeof document !== 'undefined') {
    document.title = "Disclaimer | Bio Rank — NEET Biology Prep";
  }

  container.innerHTML = `
    <main class="disclaimer-page-container" aria-label="Disclaimer">

      <!-- 1. HERO SECTION -->
      <section class="disclaimer-hero-card">
        <div class="disclaimer-hero-badge">
          <img src="logo-square.jpg" alt="Bio Rank" class="disclaimer-hero-logo" />
          <span>Legal &amp; Compliance</span>
        </div>
        <h1 class="disclaimer-hero-title">Disclaimer</h1>
        <p class="disclaimer-hero-subtitle">Important information about the use of Bio Rank.</p>
      </section>

      <!-- 2. INTRO OVERVIEW -->
      <div class="disclaimer-intro-box">
        <div class="disclaimer-intro-icon">⚖️</div>
        <div class="disclaimer-intro-content">
          <strong>Please Read Carefully:</strong> This Disclaimer governs your access to and use of Bio Rank. By accessing our platform, you acknowledge and agree to the guidelines, limitations, and informational policies detailed below.
        </div>
      </div>

      <!-- 3. MAIN CONTENT SECTIONS -->
      <div class="disclaimer-sections-stack">

        <!-- 1. Educational Purpose -->
        <section class="disclaimer-section-card">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">🎓</div>
            <h2 class="disclaimer-section-title">Educational Purpose</h2>
          </div>
          <p class="disclaimer-text">
            Bio Rank is an independent educational platform created to support students preparing for NEET Biology. The content and tools available on the website are intended for educational, practice, revision, and self-assessment purposes.
          </p>
          <p class="disclaimer-text">
            Bio Rank should be used as a supplementary learning resource and not as a substitute for official examination information, academic guidance, or instructions issued by the relevant authorities.
          </p>
        </section>

        <!-- 2. No Official Affiliation -->
        <section class="disclaimer-section-card disclaimer-card-highlight">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">🏛️</div>
            <h2 class="disclaimer-section-title">No Official Affiliation</h2>
          </div>
          <p class="disclaimer-text">
            Bio Rank is an independent educational platform and is not affiliated with, endorsed by, sponsored by, or officially associated with the National Testing Agency (NTA), NEET, or any government organization.
          </p>
          <p class="disclaimer-text">
            Any references to NEET, NTA, examination terminology, or related educational information are provided solely for educational and informational purposes.
          </p>
        </section>

        <!-- 3. Accuracy of Information -->
        <section class="disclaimer-section-card">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">🔍</div>
            <h2 class="disclaimer-section-title">Accuracy of Information</h2>
          </div>
          <p class="disclaimer-text">
            We make reasonable efforts to provide useful and accurate educational content. However, errors, omissions, or outdated information may occasionally occur.
          </p>
          <p class="disclaimer-text">
            Users should verify important examination-related information, dates, rules, eligibility requirements, and official announcements through the relevant official sources.
          </p>
          <p class="disclaimer-text">
            Bio Rank does not guarantee that all information on the website will always be complete, current, or error-free.
          </p>
        </section>

        <!-- 4. NEET Preparation and Results -->
        <section class="disclaimer-section-card">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">📈</div>
            <h2 class="disclaimer-section-title">Preparation and Results</h2>
          </div>
          <p class="disclaimer-text">
            Bio Rank provides tools such as Biology practice questions, PYQs, tests, revision resources, and performance-related features to support preparation.
          </p>
          <p class="disclaimer-text">
            Use of Bio Rank does not guarantee any particular marks, percentile, rank, admission, college, or examination result.
          </p>
          <p class="disclaimer-text">
            Individual results depend on many factors, including preparation, consistency, understanding, examination conditions, and performance.
          </p>
        </section>

        <!-- 5. Questions, PYQs and Educational Content -->
        <section class="disclaimer-section-card">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">📚</div>
            <h2 class="disclaimer-section-title">Questions and Educational Content</h2>
          </div>
          <p class="disclaimer-text">
            Questions, explanations, study material, and other educational resources available on Bio Rank are provided for learning and practice purposes.
          </p>
          <p class="disclaimer-text">
            Where content is based on publicly available examination information or references, users should verify important details with authoritative sources.
          </p>
          <p class="disclaimer-text">
            Bio Rank does not intend to misrepresent ownership of third-party copyrighted material.
          </p>
        </section>

        <!-- 6. External Links -->
        <section class="disclaimer-section-card">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">🔗</div>
            <h2 class="disclaimer-section-title">External Links</h2>
          </div>
          <p class="disclaimer-text">
            Bio Rank may contain links to external websites or services for reference or convenience.
          </p>
          <p class="disclaimer-text">
            Bio Rank does not control and is not responsible for the content, availability, security, or privacy practices of external websites.
          </p>
          <p class="disclaimer-text">
            Users should review the policies and terms of external websites before using them.
          </p>
        </section>

        <!-- 7. Advertisements -->
        <section class="disclaimer-section-card">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">📢</div>
            <h2 class="disclaimer-section-title">Advertisements</h2>
          </div>
          <p class="disclaimer-text">
            Bio Rank may display advertisements provided by third-party advertising services, including Google AdSense.
          </p>
          <p class="disclaimer-text">
            Advertisements may be selected or displayed based on factors determined by the advertising provider. Bio Rank does not necessarily endorse every product, service, or claim displayed in an advertisement.
          </p>
        </section>

        <!-- 8. Website Availability -->
        <section class="disclaimer-section-card">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">🌐</div>
            <h2 class="disclaimer-section-title">Website Availability</h2>
          </div>
          <p class="disclaimer-text">
            We aim to keep Bio Rank available and functional, but we cannot guarantee uninterrupted access to the website or that every feature will always be available.
          </p>
          <p class="disclaimer-text">
            Features, content, pages, and services may be updated, changed, suspended, or removed when necessary.
          </p>
        </section>

        <!-- 9. Changes to This Disclaimer -->
        <section class="disclaimer-section-card">
          <div class="disclaimer-section-header">
            <div class="disclaimer-section-icon">📝</div>
            <h2 class="disclaimer-section-title">Changes to This Disclaimer</h2>
          </div>
          <p class="disclaimer-text">
            Bio Rank may update this Disclaimer from time to time to reflect changes to the website, features, services, or applicable requirements.
          </p>
          <p class="disclaimer-text">
            Any updated version will be published on this page.
          </p>
          <div class="disclaimer-date-row">
            <span class="disclaimer-date-badge">📅 Last updated: August 17, 2026</span>
          </div>
        </section>

      </div>

      <!-- 10. CONTACT CTA -->
      <section class="disclaimer-cta-card">
        <h2 class="disclaimer-cta-heading">Questions About This Disclaimer?</h2>
        <p class="disclaimer-cta-text">If you have questions or concerns about this Disclaimer, please contact us.</p>
        <div class="disclaimer-cta-actions">
          <button class="btn btn-primary" onclick="App.navigate('contact')">Contact Us ✉️</button>
          <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home 🏠</button>
          <button class="btn btn-ghost" onclick="App.navigate('about')">About Bio Rank ℹ️</button>
        </div>
      </section>

    </main>
  `;
}

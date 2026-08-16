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
  const hasPassword = !!student.passwordUpdatedAt;

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
          <div style="font-size:var(--text-xl);font-weight:800;color:var(--neutral-900);">${name}</div>
          <div style="font-size:var(--text-sm);color:var(--neutral-500);font-weight:600;margin-top:2px;">@${username} &middot; Bio Rank #${perf.rank ?? '—'} &middot; 🔥 ${perf.currentStreak ?? 0} day streak</div>
          ${student.avatarDataUrl ? `<button class="btn btn-ghost btn-sm" style="padding-left:0;margin-top:var(--sp-1);" onclick="Profile.removePicture()">Remove photo</button>` : ''}
        </div>
        <button class="btn btn-outline btn-sm" onclick="App.navigate('config')">Edit Details</button>
      </div>

      <!-- Account Details: Username & Password -->
      <div class="card card-lg" style="margin-bottom:var(--sp-5);">
        <div class="section-title" style="font-size:var(--text-base);margin-bottom:var(--sp-1);">Account Details</div>
        <div class="section-subtitle" style="margin-bottom:var(--sp-4);">Local to this device for now — will sync once accounts go live</div>

        <div class="grid-2" style="gap:var(--sp-4);align-items:end;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" for="profile-username">Username</label>
            <input class="form-input" id="profile-username" type="text" value="${username}" placeholder="e.g. bio_aryan" autocomplete="username" />
          </div>
          <button class="btn btn-primary" style="height:44px;" onclick="Profile.saveUsername()">Save Username</button>
        </div>

        <div style="height:1px;background:var(--neutral-100);margin:var(--sp-5) 0;"></div>

        <div style="margin-bottom:var(--sp-3);">
          <div style="font-weight:700;color:var(--neutral-900);font-size:var(--text-sm);">Password</div>
          <div style="font-size:var(--text-xs);color:var(--neutral-500);margin-top:2px;">
            ${hasPassword ? '✓ Password is set on this device' : 'No password set yet'}
          </div>
        </div>
        <div class="grid-2" style="gap:var(--sp-4);">
          <div class="form-group">
            <label class="form-label" for="profile-pw-new">New Password</label>
            <input class="form-input" id="profile-pw-new" type="password" placeholder="At least 6 characters" autocomplete="new-password" />
          </div>
          <div class="form-group">
            <label class="form-label" for="profile-pw-confirm">Confirm Password</label>
            <input class="form-input" id="profile-pw-confirm" type="password" placeholder="Re-enter password" autocomplete="new-password" />
          </div>
        </div>
        <button class="btn btn-primary" onclick="Profile.savePassword()">Update Password</button>
        <div style="font-size:var(--text-xs);color:var(--neutral-400);margin-top:var(--sp-2);">
          This is stored locally as a placeholder for now — real password handling will move to the backend when it's connected.
        </div>
      </div>

      <!-- Study Info -->
      <div class="perf-stats-grid" style="margin-bottom:var(--sp-5);">
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

      <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="App.navigate('performance')">View Full Performance →</button>
        <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home</button>
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

  /* -- Profile picture: read the chosen file as a base64 data URL and
        preview + persist it locally (localStorage only). -- */
  onPictureSelected(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      App.showToast('Please choose an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      App.showToast('Image too large — please pick one under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const state = State.get();
      state.student = Object.assign({}, state.student, { avatarDataUrl: reader.result });
      State.save(state);
      App.showToast('✅ Profile picture updated');
      App.navigate('profile'); // re-render to show the new picture + Remove button
    };
    reader.onerror = () => App.showToast('Could not read that image — try another file');
    reader.readAsDataURL(file);
  },

  removePicture() {
    const state = State.get();
    state.student = Object.assign({}, state.student, { avatarDataUrl: null });
    State.save(state);
    App.showToast('Profile picture removed');
    App.navigate('profile');
  },

  /* -- Username: simple local validation + save -- */
  saveUsername() {
    const input = document.getElementById('profile-username');
    if (!input) return;
    const value = input.value.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(value)) {
      App.showToast('Username must be 3–20 characters: letters, numbers, underscore only');
      return;
    }

    const state = State.get();
    state.student = Object.assign({}, state.student, { username: value });
    State.save(state);
    App.showToast('✅ Username updated');
    App.navigate('profile');
  },

  /* -- Password: validate on the frontend, store only a "set" flag —
        never the real password — since real hashing/verification
        belongs on a backend that doesn't exist yet. -- */
  savePassword() {
    const pw = document.getElementById('profile-pw-new')?.value || '';
    const confirm = document.getElementById('profile-pw-confirm')?.value || '';

    if (pw.length < 6) {
      App.showToast('Password must be at least 6 characters');
      return;
    }
    if (pw !== confirm) {
      App.showToast('Passwords do not match');
      return;
    }

    const state = State.get();
    state.student = Object.assign({}, state.student, { passwordUpdatedAt: Date.now() });
    State.save(state);
    App.showToast('✅ Password updated (stored locally for now)');
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
        <a href="mailto:support@biorank.app" class="btn btn-primary" style="display:inline-flex;">✉️ Email support@biorank.app</a>
      </div>

      <button class="btn btn-secondary" onclick="App.navigate('home')">Back to Home</button>
    </div>
  `;
}

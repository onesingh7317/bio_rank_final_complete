/* ============================================================
   feedback.js — Three-level Feedback System & Platform Improvement
   Levels: 1. Question  2. Test  3. Product
   ============================================================ */

function renderFeedback(container) {
  container.innerHTML = `
    <div style="max-width:620px;">
      <div style="margin-bottom:var(--sp-6);">
        <div class="page-title">Feedback</div>
        <div class="page-subtitle">Help us cook better — every response hits different</div>
      </div>

      <!-- Level tabs -->
      <div class="feedback-tabs" role="tablist">
        <button class="feedback-tab active" role="tab" aria-selected="true"  id="tab-q"   onclick="switchFeedbackTab('question')">1. Question</button>
        <button class="feedback-tab"        role="tab" aria-selected="false" id="tab-t"   onclick="switchFeedbackTab('test')">2. Test</button>
        <button class="feedback-tab"        role="tab" aria-selected="false" id="tab-p"   onclick="switchFeedbackTab('product')">3. Product</button>
      </div>

      <div id="feedback-content">
        <!-- Rendered by switchFeedbackTab -->
      </div>
    </div>
  `;

  switchFeedbackTab('question');
}

window.switchFeedbackTab = function(level) {
  // Update tabs
  ['q','t','p'].forEach(id => document.getElementById('tab-' + id)?.classList.remove('active'));
  const map = { question: 'q', test: 't', product: 'p' };
  document.getElementById('tab-' + map[level])?.classList.add('active');

  const content = document.getElementById('feedback-content');
  if (!content) return;

  if (level === 'question') {
    content.innerHTML = `
      <div class="card">
        <div style="margin-bottom:var(--sp-5);">
          <div style="font-weight:700;font-size:var(--text-md);color:var(--neutral-900);margin-bottom:var(--sp-1);">Question-level Feedback</div>
          <div style="font-size:var(--text-sm);color:var(--neutral-500);">Spot a sus question? Report it here.</div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label">Question Number</label>
          <input class="form-input" type="number" id="q-fb-num" min="1" placeholder="e.g. 5" style="max-width:120px;" />
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label">Issue Type</label>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);" id="q-issue-type">
            ${['Incorrect answer key','Unclear wording','Typo or error','Wrong options','Other'].map(t =>
              `<button type="button" class="error-tag" data-issue="${t}" onclick="selectIssueType(this,'q-issue-type')">${t}</button>`
            ).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-5);">
          <label class="form-label">Additional Comments (optional)</label>
          <textarea class="form-input form-textarea" id="q-fb-comment" placeholder="Describe the issue in detail..."></textarea>
        </div>

        <button class="btn btn-primary" onclick="submitFeedback('question')">Submit Question Feedback</button>
      </div>
    `;
  }

  else if (level === 'test') {
    content.innerHTML = `
      <div class="card">
        <div style="margin-bottom:var(--sp-5);">
          <div style="font-weight:700;font-size:var(--text-md);color:var(--neutral-900);margin-bottom:var(--sp-1);">Test-level Feedback</div>
          <div style="font-size:var(--text-sm);color:var(--neutral-500);">Rate the vibe of the whole test</div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label">Overall Test Rating</label>
          <div class="star-rating" id="test-star-rating">
            ${[1,2,3,4,5].map(n => `<button type="button" class="star-btn" data-val="${n}" onclick="rateStars('test-star-rating',${n})">☆</button>`).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label">Difficulty Level</label>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);" id="t-difficulty">
            ${['Too easy','About right','Too hard','Mixed'].map(t =>
              `<button type="button" class="error-tag" data-issue="${t}" onclick="selectIssueType(this,'t-difficulty')">${t}</button>`
            ).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label">Question Quality</label>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);" id="t-quality">
            ${['Excellent','Good','Needs improvement','Had errors'].map(t =>
              `<button type="button" class="error-tag" data-issue="${t}" onclick="selectIssueType(this,'t-quality')">${t}</button>`
            ).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-5);">
          <label class="form-label">Comments (optional)</label>
          <textarea class="form-input form-textarea" id="t-fb-comment" placeholder="What did you think of this test?"></textarea>
        </div>

        <button class="btn btn-primary" onclick="submitFeedback('test')">Submit Test Feedback</button>
      </div>
    `;
  }

  else if (level === 'product') {
    content.innerHTML = `
      <div class="card">
        <div style="margin-bottom:var(--sp-5);">
          <div style="font-weight:700;font-size:var(--text-md);color:var(--neutral-900);margin-bottom:var(--sp-1);">Product Feedback</div>
          <div style="font-size:var(--text-sm);color:var(--neutral-500);">Tell us how to make Bio Rank more fire</div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label">Overall Platform Rating</label>
          <div class="star-rating" id="product-star-rating">
            ${[1,2,3,4,5].map(n => `<button type="button" class="star-btn" data-val="${n}" onclick="rateStars('product-star-rating',${n})">☆</button>`).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label">What are you most satisfied with?</label>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);" id="p-satisfy">
            ${['Question quality','Weakness tracking','Spaced re-tests','UI & design','Performance analytics'].map(t =>
              `<button type="button" class="error-tag" data-issue="${t}" onclick="selectIssueType(this,'p-satisfy',true)">${t}</button>`
            ).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-4);">
          <label class="form-label">What needs improvement?</label>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);" id="p-improve">
            ${['More questions','Faster loading','Better explanations','Bug fixes','More chapters'].map(t =>
              `<button type="button" class="error-tag" data-issue="${t}" onclick="selectIssueType(this,'p-improve',true)">${t}</button>`
            ).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--sp-5);">
          <label class="form-label">Anything else you'd like to share?</label>
          <textarea class="form-input form-textarea" id="p-fb-comment" placeholder="Feature requests, bugs, suggestions..."></textarea>
        </div>

        <button class="btn btn-primary" onclick="submitFeedback('product')">Submit Product Feedback</button>
      </div>
    `;
  }
};

window.selectIssueType = function(btn, groupId, multi = false) {
  if (!multi) {
    document.getElementById(groupId)?.querySelectorAll('.error-tag').forEach(b => b.classList.remove('selected'));
  }
  btn.classList.toggle('selected');
};

window.rateStars = function(groupId, rating) {
  const stars = document.getElementById(groupId)?.querySelectorAll('.star-btn');
  if (!stars) return;
  stars.forEach((s, i) => {
    s.textContent = i < rating ? '★' : '☆';
    s.classList.toggle('selected', i < rating);
  });
};

window.submitFeedback = function(level) {
  // Collect form values (structure for future backend integration)
  const feedback = {
    level,
    timestamp: new Date().toISOString(),
    data: {}
  };

  if (level === 'question') {
    feedback.data.questionNumber = document.getElementById('q-fb-num')?.value;
    feedback.data.issueType = document.querySelector('#q-issue-type .error-tag.selected')?.dataset.issue;
    feedback.data.comment = document.getElementById('q-fb-comment')?.value;
  } else if (level === 'test') {
    const stars = document.querySelectorAll('#test-star-rating .star-btn.selected');
    feedback.data.rating = stars.length;
    feedback.data.difficulty = document.querySelector('#t-difficulty .error-tag.selected')?.dataset.issue;
    feedback.data.quality = document.querySelector('#t-quality .error-tag.selected')?.dataset.issue;
    feedback.data.comment = document.getElementById('t-fb-comment')?.value;
  } else if (level === 'product') {
    const stars = document.querySelectorAll('#product-star-rating .star-btn.selected');
    feedback.data.rating = stars.length;
    feedback.data.satisfied = Array.from(document.querySelectorAll('#p-satisfy .error-tag.selected')).map(b => b.dataset.issue);
    feedback.data.improve = Array.from(document.querySelectorAll('#p-improve .error-tag.selected')).map(b => b.dataset.issue);
    feedback.data.comment = document.getElementById('p-fb-comment')?.value;
  }

  // Persist locally as fallback / offline cache
  try {
    const existing = JSON.parse(localStorage.getItem('bioready_feedback') || '[]');
    existing.push(feedback);
    localStorage.setItem('bioready_feedback', JSON.stringify(existing));
  } catch {}

  // Submit to live backend API if available
  if (window.ApiClient) {
    ApiClient.post('/feedback', feedback).catch(err => {
      console.warn('Could not post feedback to server:', err);
    });
  }

  App.navigate('platform-improvement', { level, feedback });
};

/* ---- Platform Improvement (final feedback state) ---- */
function renderPlatformImprovement(container, data) {
  const levelLabel = { question: 'Question', test: 'Test', product: 'Product' };
  const level = data?.level || 'product';

  container.innerHTML = `
    <div class="platform-screen">
      <div style="width:80px;height:80px;background:var(--success-100);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto var(--sp-6);font-size:40px;">
        📬
      </div>

      <h2 style="font-size:var(--text-2xl);font-weight:800;color:var(--neutral-900);margin-bottom:var(--sp-3);">Thanks for the feedback!</h2>
      <p style="color:var(--neutral-600);margin-bottom:var(--sp-5);">
        Your <strong>${levelLabel[level]} Feedback</strong> is in the bag. We read every single one to make Bio Rank less mid and more goat.
      </p>

      <div class="card" style="text-align:left;margin-bottom:var(--sp-6);">
        <div style="font-weight:600;color:var(--neutral-800);margin-bottom:var(--sp-4);">How your feedback helps</div>
        <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
          <div style="display:flex;gap:var(--sp-3);align-items:flex-start;">
            <div style="width:28px;height:28px;background:var(--primary-100);color:var(--primary-600);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">1</div>
            <div style="font-size:var(--text-sm);color:var(--neutral-700);">Question feedback helps us fix errors and improve content quality</div>
          </div>
          <div style="display:flex;gap:var(--sp-3);align-items:flex-start;">
            <div style="width:28px;height:28px;background:var(--teal-100);color:var(--teal-600);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">2</div>
            <div style="font-size:var(--text-sm);color:var(--neutral-700);">Test feedback improves difficulty calibration and question selection</div>
          </div>
          <div style="display:flex;gap:var(--sp-3);align-items:flex-start;">
            <div style="width:28px;height:28px;background:var(--success-100);color:var(--success-600);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">3</div>
            <div style="font-size:var(--text-sm);color:var(--neutral-700);">Product feedback shapes the platform roadmap and new features</div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
        <button class="btn btn-primary btn-lg btn-block" onclick="App.navigate('home')">
          Back to Home Base
        </button>
        <button class="btn btn-secondary btn-block" onclick="App.navigate('performance')">
          View Performance Stats
        </button>
      </div>
    </div>
  `;
}

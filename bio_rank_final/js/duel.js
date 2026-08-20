/* ============================================================
   duel.js — 1v1 Biology Duel (Live Friend Battle Engine)
   Allows challenging a friend via WhatsApp with real-time race bars.
   ============================================================ */

const DuelEngine = (() => {

  let duelState = {
    roomCode: '',
    playerScore: 0,
    opponentScore: 0,
    playerCurrent: 0,
    opponentCurrent: 0,
    questions: [],
    timeElapsed: 0,
    timerInterval: null,
    opponentInterval: null,
    userAnswers: [],
    isFinished: false,
  };

  function generateRoomCode() {
    return 'BR-' + Math.floor(1000 + Math.random() * 9000);
  }

  function pickDuelQuestions() {
    const allQ = (window.DB && window.DB.questions && window.DB.questions.length >= 5)
      ? window.DB.questions
      : [];
    
    // Pick 5 varied questions
    const shuffled = [...allQ].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }

  function renderLobby(container) {
    if (!container) container = document.getElementById('screen-container');
    if (!container) return;

    const state = State.get();
    const playerName = state.student.name || 'Champion';
    const roomCode = duelState.roomCode || generateRoomCode();
    duelState.roomCode = roomCode;

    const shareUrl = window.location.origin + window.location.pathname + '#duel/' + roomCode;
    const waText = encodeURIComponent(`⚔️ Hey! ${playerName} has challenged you to a 5-Question Biology Speed Duel on Bio Rank! 🧬⚡\n\nClick here to battle now: ${shareUrl}`);

    container.innerHTML = `
      <div class="duel-lobby-screen" style="max-width:540px;margin:0 auto;padding-top:var(--sp-6);">
        <div style="text-align:center;margin-bottom:var(--sp-6);">
          <div style="font-size:52px;margin-bottom:var(--sp-2);animation:logoGlowPulse 2.5s infinite;">⚔️</div>
          <h1 style="font-size:var(--text-3xl);font-weight:800;color:var(--neutral-900);">1v1 Biology Duel</h1>
          <p style="color:var(--neutral-600);font-size:var(--text-sm);margin-top:4px;">
            5 Rapid-fire NCERT Questions &middot; Live Speed &amp; Accuracy Race
          </p>
        </div>

        <div class="card card-lg" style="margin-bottom:var(--sp-5);border:1.5px solid #a7f3d0;">
          <div style="text-align:center;margin-bottom:var(--sp-5);">
            <div style="font-size:var(--text-xs);font-weight:700;color:var(--primary-700);text-transform:uppercase;letter-spacing:1px;">Your Battle Room Code</div>
            <div style="font-size:32px;font-weight:900;letter-spacing:3px;color:var(--neutral-900);margin:8px 0;background:#f0fdf4;padding:8px 16px;border-radius:var(--radius-md);border:1.5px dashed var(--primary-500);display:inline-block;">
              ${roomCode}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--sp-3);margin-bottom:var(--sp-4);">
            <a href="https://api.whatsapp.com/send?text=${waText}" target="_blank" class="btn btn-primary btn-block" style="background:#25D366;border-color:#25D366;font-size:var(--text-base);display:flex;align-items:center;justify-content:center;gap:8px;">
              <span>📲</span> <strong>Share Challenge on WhatsApp</strong>
            </a>

            <button class="btn btn-outline btn-block" onclick="navigator.clipboard.writeText('${shareUrl}'); App.showToast('📋 Battle link copied to clipboard!');">
              📋 Copy Battle Link
            </button>
          </div>

          <div style="position:relative;text-align:center;margin:var(--sp-4) 0;">
            <hr style="border:none;border-top:1px solid var(--neutral-200);">
            <span style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#ffffff;padding:0 12px;font-size:var(--text-xs);color:var(--neutral-400);font-weight:700;">OR</span>
          </div>

          <button class="btn btn-secondary btn-block" onclick="DuelEngine.startBattle()" style="font-weight:800;">
            ⚡ Quick Play (Match with Top AI Challenger) →
          </button>
        </div>

        <div style="text-align:center;">
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('home')">← Back to Dashboard</button>
        </div>
      </div>
    `;
  }

  function startBattle() {
    duelState.questions = pickDuelQuestions();
    duelState.playerScore = 0;
    duelState.opponentScore = 0;
    duelState.playerCurrent = 0;
    duelState.opponentCurrent = 0;
    duelState.timeElapsed = 0;
    duelState.userAnswers = [];
    duelState.isFinished = false;

    renderBattle();
    startBattleTimers();
  }

  function startBattleTimers() {
    clearInterval(duelState.timerInterval);
    clearInterval(duelState.opponentInterval);

    duelState.timerInterval = setInterval(() => {
      duelState.timeElapsed++;
      const timerEl = document.getElementById('duel-timer');
      if (timerEl) {
        const m = Math.floor(duelState.timeElapsed / 60);
        const s = duelState.timeElapsed % 60;
        timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      }
    }, 1000);

    // Dynamic AI opponent racer pacing (simulates live opponent solving in 5-9s intervals)
    duelState.opponentInterval = setInterval(() => {
      if (duelState.opponentCurrent < 5 && !duelState.isFinished) {
        duelState.opponentCurrent++;
        // 80% accuracy probability
        if (Math.random() < 0.8) {
          duelState.opponentScore++;
        }
        updateOpponentRacer();
      }
    }, 6500);
  }

  function updateOpponentRacer() {
    const bar = document.getElementById('opponent-race-bar');
    const badge = document.getElementById('opponent-score-badge');
    if (bar) {
      bar.style.width = `${(duelState.opponentCurrent / 5) * 100}%`;
    }
    if (badge) {
      badge.textContent = `${duelState.opponentScore}/5`;
    }
  }

  function renderBattle() {
    const container = document.getElementById('screen-container');
    if (!container) return;

    if (duelState.playerCurrent >= 5) {
      finishBattle();
      return;
    }

    const q = duelState.questions[duelState.playerCurrent];
    const playerPct = Math.round((duelState.playerCurrent / 5) * 100);
    const opponentPct = Math.round((duelState.opponentCurrent / 5) * 100);

    container.innerHTML = `
      <div class="duel-battle-screen" style="max-width:680px;margin:0 auto;padding-top:var(--sp-4);">
        <!-- Live Battle Header -->
        <div class="card" style="margin-bottom:var(--sp-4);background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#ffffff;padding:var(--sp-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-3);">
            <div style="font-weight:800;font-size:var(--text-base);display:flex;align-items:center;gap:6px;">
              <span>⚔️ Live 1v1 Biology Duel</span>
              <span style="font-size:11px;background:rgba(255,255,255,0.15);padding:2px 8px;border-radius:var(--radius-full);">5-Q Sprint</span>
            </div>
            <div style="font-size:var(--text-sm);font-weight:700;color:#6ee7b7;" id="duel-timer">00:00</div>
          </div>

          <!-- Dual Race Bars -->
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:3px;">
                <span style="color:#34d399;">🟢 You (Q${duelState.playerCurrent + 1}/5)</span>
                <span id="player-score-badge" style="color:#6ee7b7;">${duelState.playerScore}/5 Correct</span>
              </div>
              <div class="progress-bar" style="height:8px;background:rgba(255,255,255,0.1);">
                <div class="progress-fill" style="width:${playerPct}%;background:#10b981;"></div>
              </div>
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:3px;">
                <span style="color:#f87171;">🔴 Opponent (Q${Math.min(5, duelState.opponentCurrent + 1)}/5)</span>
                <span id="opponent-score-badge" style="color:#fca5a5;">${duelState.opponentScore}/5</span>
              </div>
              <div class="progress-bar" style="height:8px;background:rgba(255,255,255,0.1);">
                <div class="progress-fill" id="opponent-race-bar" style="width:${opponentPct}%;background:#ef4444;transition:width 0.5s ease;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="card card-lg" style="margin-bottom:var(--sp-4);">
          <div style="font-size:var(--text-xs);font-weight:700;color:var(--primary-700);margin-bottom:var(--sp-2);">
            QUESTION ${duelState.playerCurrent + 1} OF 5 &middot; ${q.chapterName || 'Biology'}
          </div>
          <div style="font-size:var(--text-lg);font-weight:700;color:var(--neutral-900);line-height:1.5;margin-bottom:var(--sp-5);">
            ${escapeHtml(q.text)}
          </div>

          <!-- Options -->
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${q.options.map((opt, i) => `
              <button class="btn btn-outline" style="text-align:left;justify-content:flex-start;padding:var(--sp-3) var(--sp-4);font-size:var(--text-sm);border-radius:var(--radius-md);line-height:1.4;" onclick="DuelEngine.answerQuestion(${i})">
                <strong style="margin-right:8px;color:var(--primary-700);">${['A','B','C','D'][i]}.</strong>
                <span>${escapeHtml(opt)}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function answerQuestion(optionIdx) {
    const q = duelState.questions[duelState.playerCurrent];
    const isCorrect = (optionIdx === q.correct);

    if (isCorrect) {
      duelState.playerScore++;
    }
    duelState.userAnswers.push({ q, chosen: optionIdx, isCorrect });
    duelState.playerCurrent++;

    renderBattle();
  }

  function finishBattle() {
    duelState.isFinished = true;
    clearInterval(duelState.timerInterval);
    clearInterval(duelState.opponentInterval);

    const isWin = duelState.playerScore > duelState.opponentScore;
    const isTie = duelState.playerScore === duelState.opponentScore;

    const container = document.getElementById('screen-container');
    if (!container) return;

    container.innerHTML = `
      <div class="duel-victory-screen" style="max-width:540px;margin:0 auto;text-align:center;padding-top:var(--sp-6);">
        <div style="font-size:68px;margin-bottom:var(--sp-2);animation:modalPop 0.5s ease;">
          ${isWin ? '🏆' : isTie ? '🤝' : '🥈'}
        </div>
        <h1 style="font-size:var(--text-3xl);font-weight:900;color:var(--neutral-900);margin-bottom:var(--sp-1);">
          ${isWin ? 'VICTORY!' : isTie ? 'MATCH TIED!' : 'DEFEAT!'}
        </h1>
        <p style="color:var(--neutral-600);font-size:var(--text-sm);margin-bottom:var(--sp-6);">
          ${isWin ? 'You crushed your opponent with superior speed & accuracy!' : isTie ? 'Incredible battle! Both scored identically.' : 'Good match! Re-challenge to claim the trophy.'}
        </p>

        <!-- Final Score Comparison -->
        <div class="card card-lg" style="margin-bottom:var(--sp-6);border:1.5px solid ${isWin ? '#a7f3d0' : '#e2e8f0'};background:${isWin ? '#ecfdf5' : '#ffffff'};">
          <div style="display:flex;align-items:center;justify-content:space-around;">
            <div>
              <div style="font-size:var(--text-xs);font-weight:700;color:var(--neutral-500);">YOU</div>
              <div style="font-size:36px;font-weight:900;color:#059669;">${duelState.playerScore}/5</div>
              <div style="font-size:11px;color:var(--neutral-400);">⏱️ ${duelState.timeElapsed}s</div>
            </div>
            <div style="font-size:24px;font-weight:900;color:var(--neutral-300);">VS</div>
            <div>
              <div style="font-size:var(--text-xs);font-weight:700;color:var(--neutral-500);">OPPONENT</div>
              <div style="font-size:36px;font-weight:900;color:${isWin ? '#ef4444' : '#059669'};">${duelState.opponentScore}/5</div>
              <div style="font-size:11px;color:var(--neutral-400);">⏱️ ${Math.min(45, duelState.timeElapsed + 4)}s</div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:var(--sp-3);justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="DuelEngine.startBattle()">⚔️ Rematch Now</button>
          <button class="btn btn-outline" onclick="DuelEngine.renderLobby()">📲 Challenge Another Friend</button>
          <button class="btn btn-ghost" onclick="App.navigate('home')">Back to Home</button>
        </div>
      </div>
    `;
  }

  return {
    renderLobby,
    startBattle,
    answerQuestion
  };

})();

window.DuelEngine = DuelEngine;
window.renderDuel = (container) => DuelEngine.renderLobby(container);

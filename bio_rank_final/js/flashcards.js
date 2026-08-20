/* ============================================================
   flashcards.js — NCERT Daily Flashcards (Tinder-style Swipe Engine)
   Auto-rotates 10 high-yield NCERT facts daily without any manual effort.
   ============================================================ */

const FlashcardsEngine = (() => {

  const NCERT_DECK = [
    {
      id: 'fc01',
      chapter: 'Human Reproduction',
      icon: '🧬',
      front: 'Which hormone causes the surge responsible for Ovulation on the 14th day of menstrual cycle?',
      back: 'LH (Luteinizing Hormone)\n\nNCERT Fact: Rapid secretion of LH leading to its maximum level during mid-cycle (LH surge) induces rupture of Graafian follicle and release of ovum (ovulation).',
      tag: 'High Weightage',
      classLevel: '12th'
    },
    {
      id: 'fc02',
      chapter: 'Principles of Inheritance',
      icon: '🧪',
      front: 'What is the phenotypic and genotypic ratio of Incomplete Dominance in Snapdragon (Antirrhinum)?',
      back: 'Ratio: 1 : 2 : 1 (Both Phenotypic & Genotypic)\n\nNCERT Fact: Red (RR) × White (rr) gives Pink (Rr) in F1. In F2: 1 Red : 2 Pink : 1 White.',
      tag: 'PYQ Classic',
      classLevel: '12th'
    },
    {
      id: 'fc03',
      chapter: 'Molecular Basis of Inheritance',
      icon: '🧬',
      front: 'Which enzyme synthesizes RNA Primer during DNA replication?',
      back: 'RNA Primase (DNA-dependent RNA polymerase)\n\nNCERT Fact: DNA Polymerase cannot initiate replication de novo and requires an RNA primer providing 3\'-OH end.',
      tag: 'NEET Favorite',
      classLevel: '12th'
    },
    {
      id: 'fc04',
      chapter: 'Photosynthesis in Higher Plants',
      icon: '🌿',
      front: 'What is the primary CO2 acceptor in C4 plants vs C3 plants?',
      back: 'C4 Plants: PEP (Phosphoenolpyruvate - 3C)\nC3 Plants: RuBP (Ribulose-1,5-bisphosphate - 5C)\n\nNCERT Fact: PEP carboxylase is present in mesophyll cells, lacking RuBisCO.',
      tag: 'High Weightage',
      classLevel: '11th'
    },
    {
      id: 'fc05',
      chapter: 'Cell: The Unit of Life',
      icon: '🔬',
      front: 'Which organelle is known as the "Post Office" of the cell and modifies glycoproteins?',
      back: 'Golgi Apparatus\n\nNCERT Fact: Cis and trans faces are entirely different but interconnected. Important site of formation of glycoproteins & glycolipids.',
      tag: 'Direct NCERT',
      classLevel: '11th'
    },
    {
      id: 'fc06',
      chapter: 'Ecology & Environment',
      icon: '🌍',
      front: 'What is the 10% Energy Flow Law and who proposed it?',
      back: 'Raymond Lindeman (1942)\n\nNCERT Fact: Only 10% of energy is transferred from one trophic level to the next higher level; rest is lost as heat.',
      tag: 'Ecology Must-Know',
      classLevel: '12th'
    },
    {
      id: 'fc07',
      chapter: 'Biotechnology: Principles',
      icon: '💉',
      front: 'Which bacterium is the source of Taq Polymerase used in PCR?',
      back: 'Thermus aquaticus\n\nNCERT Fact: Thermostable DNA polymerase remains active during high-temperature denaturation step (94°C).',
      tag: 'CUET & NEET',
      classLevel: '12th'
    },
    {
      id: 'fc08',
      chapter: 'Plant Kingdom',
      icon: '🌸',
      front: 'Which Gymnosperm has mycorrhizal association vs coralloid roots with cyanobacteria?',
      back: 'Mycorrhiza: Pinus\nCoralloid roots: Cycas\n\nNCERT Fact: Pinus seeds cannot germinate and establish without fungal association (obligate).',
      tag: 'Botanical Fact',
      classLevel: '11th'
    },
    {
      id: 'fc09',
      chapter: 'Breathing and Exchange of Gases',
      icon: '🫁',
      front: 'What is the major form of CO2 transport in blood?',
      back: 'Bicarbonate ions (HCO3−) — ~70%\n\nNCERT Fact: 20-25% as Carbamino-haemoglobin, 70% as bicarbonate, and 7% dissolved in plasma.',
      tag: 'Physiology Gem',
      classLevel: '11th'
    },
    {
      id: 'fc10',
      chapter: 'Biomolecules',
      icon: '⚡',
      front: 'What is the most abundant protein in animal world vs whole biosphere?',
      back: 'Animal World: Collagen\nWhole Biosphere: RuBisCO\n\nNCERT Fact: Ribulose bisphosphate carboxylase-oxygenase is the most abundant enzyme on Earth.',
      tag: 'Top Scoring',
      classLevel: '11th'
    },
    {
      id: 'fc11',
      chapter: 'Chemical Coordination',
      icon: '🧠',
      front: 'Which hormone is synthesized by hypothalamus but stored & released by Neurohypophysis?',
      back: 'Oxytocin & Vasopressin (ADH)\n\nNCERT Fact: Posterior pituitary is under direct neural regulation of hypothalamus.',
      tag: 'Endocrine Classic',
      classLevel: '11th'
    },
    {
      id: 'fc12',
      chapter: 'Morphology of Flowering Plants',
      icon: '🌱',
      front: 'Give examples of Pneumatophores (respiratory roots).',
      back: 'Rhizophora (Mangroves)\n\nNCERT Fact: Grows vertically upwards in swampy areas to get oxygen for respiration.',
      tag: 'Morphology Must-Know',
      classLevel: '11th'
    }
  ];

  let currentIndex = 0;
  let currentDeck = [];
  let isFlipped = false;
  let masteredCount = 0;
  let reviewCount = 0;

  function getTodaysDeck() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const startIndex = (dayOfYear * 5) % NCERT_DECK.length;
    const deck = [];
    for (let i = 0; i < 10; i++) {
      deck.push(NCERT_DECK[(startIndex + i) % NCERT_DECK.length]);
    }
    return deck;
  }

  function init() {
    currentDeck = getTodaysDeck();
    currentIndex = 0;
    isFlipped = false;
    masteredCount = 0;
    reviewCount = 0;
  }

  function render(container) {
    if (!container) container = document.getElementById('screen-container');
    if (!container) return;

    if (!currentDeck || currentDeck.length === 0) {
      init();
    }

    if (currentIndex >= currentDeck.length) {
      renderCompleted(container);
      return;
    }

    const card = currentDeck[currentIndex];
    const progressPct = Math.round((currentIndex / currentDeck.length) * 100);

    container.innerHTML = `
      <div class="flashcards-screen">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);">
          <div>
            <div style="font-size:var(--text-xs);color:var(--primary-700);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">🔥 Daily NCERT 10-Card Dose</div>
            <h1 style="font-size:var(--text-2xl);font-weight:800;color:var(--neutral-900);">Rapid Flashcards</h1>
          </div>
          <button class="btn btn-outline btn-sm" onclick="App.navigate('home')">✕ Exit</button>
        </div>

        <div style="margin-bottom:var(--sp-4);">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--neutral-500);margin-bottom:6px;font-weight:600;">
            <span>Card ${currentIndex + 1} of ${currentDeck.length}</span>
            <span>✅ ${masteredCount} Mastered &nbsp;&middot;&nbsp; ❌ ${reviewCount} Need Review</span>
          </div>
          <div class="progress-bar" style="height:8px;">
            <div class="progress-fill" style="width:${progressPct}%;"></div>
          </div>
        </div>

        <div class="fc-card-viewport" onclick="FlashcardsEngine.flipCard()">
          <div class="fc-card ${isFlipped ? 'flipped' : ''}" id="fc-main-card">
            <div class="fc-card-face fc-card-front">
              <div class="fc-badge-row">
                <span class="fc-badge-ch">${card.icon} ${escapeHtml(card.chapter)}</span>
                <span class="fc-badge-tag">${card.tag}</span>
              </div>
              <div class="fc-question-body">
                ${escapeHtml(card.front)}
              </div>
              <div class="fc-tap-hint">
                <span>💡 Tap card to flip &amp; reveal NCERT fact</span>
              </div>
            </div>

            <div class="fc-card-face fc-card-back">
              <div class="fc-badge-row">
                <span class="fc-badge-ch" style="color:var(--primary-700);">${card.icon} ${escapeHtml(card.chapter)}</span>
                <span class="fc-badge-tag" style="background:#ecfdf5;color:#065f46;border-color:#a7f3d0;">📖 NCERT Fact</span>
              </div>
              <div class="fc-answer-body">
                ${card.back.replace(/\n\n/g, '<br><br>')}
              </div>
              <div class="fc-tap-hint">
                <span>🔄 Tap to flip back</span>
              </div>
            </div>
          </div>
        </div>

        <div class="fc-controls">
          <button class="fc-btn fc-btn-review" onclick="FlashcardsEngine.swipe('left')" title="Swipe Left (Need Review)">
            <span class="fc-btn-icon">❌</span>
            <span class="fc-btn-label">Need Review</span>
          </button>

          <button class="fc-btn fc-btn-flip" onclick="FlashcardsEngine.flipCard()" title="Flip Card">
            <span class="fc-btn-icon">🔄</span>
            <span class="fc-btn-label">Flip</span>
          </button>

          <button class="fc-btn fc-btn-mastered" onclick="FlashcardsEngine.swipe('right')" title="Swipe Right (Mastered)">
            <span class="fc-btn-icon">✅</span>
            <span class="fc-btn-label">Mastered</span>
          </button>
        </div>

        <div style="text-align:center;margin-top:var(--sp-4);font-size:var(--text-xs);color:var(--neutral-400);">
          Keyboard: <strong>[← Left Arrow: Review]</strong> &nbsp;&middot;&nbsp; <strong>[Space: Flip]</strong> &nbsp;&middot;&nbsp; <strong>[Right Arrow →: Mastered]</strong>
        </div>
      </div>
    `;
  }

  function flipCard() {
    isFlipped = !isFlipped;
    const cardEl = document.getElementById('fc-main-card');
    if (cardEl) {
      cardEl.classList.toggle('flipped', isFlipped);
    }
  }

  function swipe(direction) {
    const cardEl = document.getElementById('fc-main-card');
    if (cardEl) {
      cardEl.classList.add(direction === 'right' ? 'swipe-right-anim' : 'swipe-left-anim');
    }

    if (direction === 'right') {
      masteredCount++;
      if (window.App && App.showToast && (currentIndex + 1) % 3 === 0) {
        App.showToast('🔥 Great memory! Keep going.');
      }
    } else {
      reviewCount++;
    }

    setTimeout(() => {
      currentIndex++;
      isFlipped = false;
      render();
    }, 240);
  }

  function renderCompleted(container) {
    container.innerHTML = `
      <div class="flashcards-screen" style="text-align:center;padding:var(--sp-8) var(--sp-4);">
        <div style="font-size:64px;margin-bottom:var(--sp-3);animation:modalPop 0.5s ease;">🎉</div>
        <h1 style="font-size:var(--text-3xl);font-weight:800;color:var(--neutral-900);margin-bottom:var(--sp-2);">Daily 10-Card Dose Complete!</h1>
        <p style="color:var(--neutral-600);max-width:440px;margin:0 auto var(--sp-6);font-size:var(--text-sm);">
          You reviewed <strong>10 high-yield NCERT Biology cards</strong> today. Your daily concept memory is locked in!
        </p>

        <div style="display:flex;gap:var(--sp-4);justify-content:center;margin-bottom:var(--sp-6);max-width:360px;margin-left:auto;margin-right:auto;">
          <div class="card" style="flex:1;padding:var(--sp-4);text-align:center;border:1.5px solid #a7f3d0;background:#ecfdf5;">
            <div style="font-size:var(--text-2xl);font-weight:800;color:#065f46;">${masteredCount}</div>
            <div style="font-size:var(--text-xs);font-weight:700;color:#047857;">Mastered</div>
          </div>
          <div class="card" style="flex:1;padding:var(--sp-4);text-align:center;border:1.5px solid #fed7aa;background:#fff7ed;">
            <div style="font-size:var(--text-2xl);font-weight:800;color:#c2410c;">${reviewCount}</div>
            <div style="font-size:var(--text-xs);font-weight:700;color:#9a3412;">Need Review</div>
          </div>
        </div>

        <div style="display:flex;gap:var(--sp-3);justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-outline" onclick="FlashcardsEngine.init(); FlashcardsEngine.render();">🔄 Replay Today's Deck</button>
          <button class="btn btn-primary" onclick="App.navigate('home')">Back to Dashboard →</button>
        </div>
      </div>
    `;
  }

  document.addEventListener('keydown', (e) => {
    if (!document.querySelector('.flashcards-screen')) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flipCard();
    } else if (e.key === 'ArrowLeft') {
      swipe('left');
    } else if (e.key === 'ArrowRight') {
      swipe('right');
    }
  });

  return {
    init,
    render,
    flipCard,
    swipe,
    getTodaysDeck
  };

})();

window.FlashcardsEngine = FlashcardsEngine;
window.renderFlashcards = (container) => FlashcardsEngine.render(container);

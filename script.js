/* ============================================================
   Nergis Valentine Game — script.js
   State machine: stage 0 (start) → 1-8 (NO path) → YES end
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM refs ----
  const photoEl      = document.getElementById('photo');
  const photoFlash   = document.getElementById('photoFlash');
  const photoWrap    = document.getElementById('photoWrap');
  const titleEl      = document.getElementById('title');
  const subtitleEl   = document.getElementById('subtitle');
  const messageEl    = document.getElementById('message');
  const btnYes       = document.getElementById('btnYes');
  const btnNo        = document.getElementById('btnNo');
  const btnArea      = document.getElementById('btnArea');
  const btnRestart   = document.getElementById('btnRestart');
  const celebration  = document.getElementById('celebration');
  const resetLink    = document.getElementById('resetLink');
  const card         = document.getElementById('card');
  const floatingH    = document.getElementById('floatingHearts');

  // ---- Stage data ----
  // Each stage defines: image, alt text, caption, yesLabel, noLabel
  const stages = [
    { // stage 0 — START
      img: '1.png',
      alt: 'Cem and Bıdık looking hopeful',
      caption: '',
      yesLabel: 'YES!',
      noLabel:  'NO!',
    },
    { // stage 1 — no1 (Bıdık alone)
      img: 'no1.png',
      alt: 'Bıdık looking sad',
      caption: 'Bıdık çeni duydu...! 🥺',
      yesLabel: 'Okay fine, YES!',
      noLabel:  'Hmm… nope',
    },
    { // stage 2 — no2 (Bıdık alone)
      img: 'no2.png',
      alt: 'Bıdık tilting head',
      caption: 'Bıdıkko ikinci kere hayır dediğini duydu bebiş! 😢',
      yesLabel: 'Alright, YES!',
      noLabel:  'Still no…',
      photoPos: 'center 25%',   // Bıdık is toward the top of this photo
    },
    { // stage 3 — no3 (Cem + Bıdık)
      img: 'no3.png',
      alt: 'Cem and Bıdık presenting their case',
      caption: 'Senin için puppy face yapıyovuz...🥺',
      yesLabel: 'Yes, you two win!',
      noLabel:  'Not yet…',
    },
    { // stage 4 — no4 (Bıdık alone)
      img: 'no4.png',
      alt: 'Bobalak being dramatic',
      caption: 'Bobalak sinirlenmeye başladı! 📝',
      yesLabel: 'Yes! I surrender!',
      noLabel:  'I resist…',
    },
    { // stage 5 — no5 (Cem + Bıdık)
      img: 'no5.png',
      alt: 'Cem and Bıdık looking extra hopeful',
      caption: 'Canımız sıkılmaya başladı habevin olsun yani ✨',
      yesLabel: 'YES already!',
      noLabel:  'No way…',
    },
    { // stage 6 — no6 (Nergis + Bıdık)
      img: 'no6.png',
      alt: 'Nergis and Bıdık together',
      caption: 'Babukko bile senin tarafında...💛',
      yesLabel: 'Yes, for Babukko!',
      noLabel:  'Nope!',
    },
    { // stage 7 — no7 (Bıdık alone)
      img: 'no7.png',
      alt: 'Dobalak giving the ultimate stare',
      caption: 'Dobalak sana bakış atıyor. Emin misin? 👀',
      yesLabel: 'YES! I can\'t resist!',
      noLabel:  'n-no…',
    },
    { // stage 8 — no8 (Bıdık alone) — FINAL
      img: 'no8.png',
      alt: 'Bıdık with maximum dramatic energy',
      caption: 'Bıdıkko sana savılavak tepkisini koydu avtık yani ayıp! 💖',
      yesLabel: 'Of course I will be your Valentine! 💕',
      noLabel:  '…no?',
    },
  ];

  let stage = 0;

  // ---- Floating hearts on page load ----
  function spawnFloatingHearts() {
    const hearts = ['♥', '❤', '💕', '🌼', '♡', '🤍'];
    for (let i = 0; i < 18; i++) {
      const span = document.createElement('span');
      span.classList.add('heart');
      span.textContent = hearts[i % hearts.length];
      span.style.left = Math.random() * 100 + '%';
      span.style.setProperty('--dur', (6 + Math.random() * 8) + 's');
      span.style.setProperty('--delay', (Math.random() * 10) + 's');
      span.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
      span.style.setProperty('--s', (.6 + Math.random() * .8).toFixed(2));
      floatingH.appendChild(span);
    }
  }

  // ---- Photo transition ----
  function setPhoto(src, alt, photoPos) {
    photoEl.classList.add('fade-out');
    setTimeout(() => {
      photoEl.src = src;
      photoEl.alt = alt;
      photoEl.style.objectPosition = photoPos || 'center center';
      photoEl.classList.remove('fade-out');
      // Flash
      photoFlash.classList.add('flash');
      setTimeout(() => photoFlash.classList.remove('flash'), 500);
    }, 350);
  }

  // ---- Update UI for current stage ----
  function renderStage() {
    const s = stages[stage];
    setPhoto(s.img, s.alt, s.photoPos);

    // Caption
    messageEl.textContent = s.caption;
    messageEl.classList.remove('tease');

    // Buttons
    btnYes.textContent = s.yesLabel;
    btnNo.textContent  = s.noLabel;

    // Show buttons, hide restart
    btnYes.classList.remove('hidden', 'irresistible');
    btnNo.classList.remove('hidden', 'shrink-1', 'shrink-2', 'shrink-3', 'shrink-4', 'dodging');
    btnNo.style.cssText = '';
    btnRestart.classList.add('hidden');
    celebration.classList.add('hidden');
    celebration.innerHTML = '';

    // Apply stage-specific difficulty
    applyDifficulty();
  }

  // ---- Difficulty scaling for NO button ----
  function applyDifficulty() {
    // Remove old listeners
    btnNo.onmouseenter = null;
    btnNo.onmouseleave = null;
    btnNo.ontouchstart  = null;

    if (stage >= 8) {
      // Irresistible YES
      btnYes.classList.add('irresistible');
      // Tiny, dodgy NO — fast teleport
      btnNo.classList.add('shrink-3', 'dodging');
      attachDodge('hard');
    } else if (stage >= 6) {
      btnNo.classList.add('shrink-3', 'dodging');
      attachDodge('medium-hard');
    } else if (stage >= 4) {
      btnNo.classList.add('shrink-2', 'dodging');
      attachDodge('medium');
    } else if (stage >= 2) {
      btnNo.classList.add('shrink-1', 'dodging');
      attachDodge('easy');
    }
    // stage 0-1: no dodge at all
  }

  // ---- Dodge logic ----
  function attachDodge(level) {
    const dodge = () => moveNoButton(level);
    btnNo.onmouseenter = dodge;
    // Also react to touch on mobile
    btnNo.ontouchstart = (e) => { e.preventDefault(); dodge(); };
    // Initial random position inside btn-area
    placeNoRandom();
  }

  function placeNoRandom() {
    const area = btnArea.getBoundingClientRect();
    const btn  = btnNo.getBoundingClientRect();
    const maxX = area.width - btn.width;
    const maxY = Math.max(area.height - btn.height, 60);
    btnNo.style.left = Math.random() * Math.max(maxX, 0) + 'px';
    btnNo.style.top  = Math.random() * Math.max(maxY, 0) + 'px';
  }

  function moveNoButton(level) {
    // Compute safe bounds (relative to card, not just btnArea)
    const cardRect = card.getBoundingClientRect();
    const btnRect  = btnNo.getBoundingClientRect();
    const safeW    = cardRect.width - btnRect.width - 20;
    const safeH    = 120; // keep within a reasonable vertical zone

    let newX, newY;

    if (level === 'extreme') {
      // Teleport far away, fast
      newX = Math.random() * Math.max(safeW, 40);
      newY = Math.random() * safeH;
      btnNo.style.transition = 'top .08s, left .08s';
    } else if (level === 'hard') {
      newX = Math.random() * Math.max(safeW, 40);
      newY = Math.random() * safeH;
      btnNo.style.transition = 'top .14s, left .14s';
    } else if (level === 'medium-hard') {
      // Random teleport like hard, but noticeably slower
      newX = Math.random() * Math.max(safeW, 40);
      newY = Math.random() * safeH;
      btnNo.style.transition = 'top .24s, left .24s';
    } else if (level === 'medium') {
      const offsetX = (Math.random() > .5 ? 1 : -1) * (60 + Math.random() * 80);
      const offsetY = (Math.random() > .5 ? 1 : -1) * (30 + Math.random() * 40);
      newX = Math.max(0, Math.min(safeW, parseFloat(btnNo.style.left || 0) + offsetX));
      newY = Math.max(0, Math.min(safeH, parseFloat(btnNo.style.top || 0) + offsetY));
      btnNo.style.transition = 'top .18s, left .18s';
    } else {
      // easy — small sidestep
      const offsetX = (Math.random() > .5 ? 1 : -1) * (30 + Math.random() * 40);
      newX = Math.max(0, Math.min(safeW, parseFloat(btnNo.style.left || 0) + offsetX));
      newY = parseFloat(btnNo.style.top || 0);
      btnNo.style.transition = 'top .22s, left .22s';
    }

    btnNo.style.left = newX + 'px';
    btnNo.style.top  = newY + 'px';
  }

  // ---- YES handler ----
  function onYes() {
    if (stage === 0) {
      // Tease — reset
      messageEl.textContent = 'THIS IS NOT THE BOYFRIEND YOU SIGNED UP FOR, TRY HARDER!';
      messageEl.classList.add('tease');
      // Brief pause, then reset to stage 0
      btnYes.classList.add('hidden');
      btnNo.classList.add('hidden');
      setTimeout(() => {
        stage = 0;
        renderStage();
      }, 2200);
      return;
    }

    // ---- Real YES → happy ending ----
    showEnding();
  }

  // ---- NO handler ----
  function onNo() {
    if (stage >= 8) return; // can't go past 8
    stage++;
    renderStage();
  }

  // ---- Ending ----
  function showEnding() {
    setPhoto('yes.png', 'Cem, Nergis, and Bıdık — all happy together');

    titleEl.innerHTML =
      '<span class="title-line">Yay!</span>' +
      '<span class="title-line title-question">Happy Valentine\'s Day, Nergis! 💐</span>';
    subtitleEl.textContent = 'Cem & Bıdık & Nergis — forever ♥';
    messageEl.textContent = 'We knew you\'d say yes! 🌸🐾';
    messageEl.classList.remove('tease');

    btnYes.classList.add('hidden');
    btnNo.classList.add('hidden');
    btnRestart.classList.remove('hidden');

    // Launch celebration
    launchCelebration();
  }

  // ---- Celebration particles ----
  function launchCelebration() {
    celebration.classList.remove('hidden');
    celebration.innerHTML = '';
    const colors = ['var(--cherry)', 'var(--cherry-light)', 'var(--gold)', 'var(--gold-light)', 'var(--leaf-light)'];
    const petals = ['🌼', '💛', '❤️', '🌸', '💐', '🤍', '🐾'];

    // Confetti squares
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('div');
      c.classList.add('confetti');
      c.style.left = Math.random() * 100 + '%';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--dur', (2 + Math.random() * 3) + 's');
      c.style.setProperty('--delay', (Math.random() * 1.5) + 's');
      c.style.setProperty('--rot', (Math.random() * 1080 - 540) + 'deg');
      c.style.width = (6 + Math.random() * 8) + 'px';
      c.style.height = (6 + Math.random() * 8) + 'px';
      celebration.appendChild(c);
    }

    // Emoji petals
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.classList.add('petal');
      p.textContent = petals[i % petals.length];
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--dur', (3 + Math.random() * 4) + 's');
      p.style.setProperty('--delay', (Math.random() * 2) + 's');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      celebration.appendChild(p);
    }
  }

  // ---- Reset / Play Again ----
  function resetGame() {
    stage = 0;
    titleEl.innerHTML =
      '<span class="title-line">Nergis,</span>' +
      '<span class="title-line title-question">Will you be my Valentine?</span>';
    subtitleEl.innerHTML = 'A little question from Cem & Bıdık&nbsp;&#x1F43E;';
    celebration.classList.add('hidden');
    celebration.innerHTML = '';
    renderStage();
  }

  // ---- Event listeners ----
  btnYes.addEventListener('click', onYes);
  btnNo.addEventListener('click', onNo);
  btnRestart.addEventListener('click', resetGame);
  resetLink.addEventListener('click', resetGame);

  // ---- Init ----
  spawnFloatingHearts();
  renderStage();
})();

/* =========================================================
   FALLING PETALS (Canvas)
========================================================= */
const fxCanvas = document.getElementById('fx');
const fxCtx    = fxCanvas.getContext('2d');

function sizeFx() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  fxCanvas.width  = Math.floor(innerWidth  * dpr);
  fxCanvas.height = Math.floor(innerHeight * dpr);
  fxCanvas.style.width  = innerWidth  + 'px';
  fxCanvas.style.height = innerHeight + 'px';
  fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
sizeFx();
window.addEventListener('resize', sizeFx);

const PETAL_COLORS = [
  'rgba(244,114,182,0.35)', 'rgba(251,207,232,0.4)',
  'rgba(253,164,175,0.3)',  'rgba(249,168,212,0.3)',
  'rgba(155,34,38,0.15)',
];

const petals = Array.from({ length: 34 }, () => ({
  x:     Math.random() * innerWidth,
  y:    -10 - Math.random() * innerHeight,
  r:      2 + Math.random() * 3.5,
  vx:    -0.3 + Math.random() * 0.6,
  vy:     0.45 + Math.random() * 0.65,
  rot:    Math.random() * Math.PI * 2,
  vr:    -0.012 + Math.random() * 0.024,
  color:  PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  alpha:  0.28 + Math.random() * 0.36,
}));

(function drawPetals() {
  fxCtx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of petals) {
    p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    if (p.y > innerHeight + 20) { p.y = -10; p.x = Math.random() * innerWidth; }
    if (p.x < -20) p.x = innerWidth + 20;
    if (p.x > innerWidth + 20) p.x = -20;
    fxCtx.save();
    fxCtx.translate(p.x, p.y);
    fxCtx.rotate(p.rot);
    fxCtx.globalAlpha = p.alpha;
    fxCtx.beginPath();
    fxCtx.ellipse(0, 0, p.r, p.r * 1.65, 0, 0, Math.PI * 2);
    fxCtx.fillStyle = p.color;
    fxCtx.fill();
    fxCtx.restore();
  }
  requestAnimationFrame(drawPetals);
})();

/* =========================================================
   BOUQUET ANIMATION
========================================================= */
const bouqCenter  = document.getElementById('bouqCenter');
const bouqLeft    = document.getElementById('bouqLeft');
const bouqRight   = document.getElementById('bouqRight');
const bouqCaption = document.getElementById('bouquetCaption');
const openBookBtn = document.getElementById('openBookBtn');

const BOUQS = [bouqLeft, bouqCenter, bouqRight];

let bouquetDone = false;

const bouquetObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !bouquetDone) {
    bouquetDone = true;
    bouquetObs.disconnect();
    animateBouquets();
  }
}, { threshold: 0.2 });

bouquetObs.observe(document.getElementById('bouquetSection'));

function animateBouquets() {
  // Center grows first, then sides staggered
  const delays = [200, 0, 400]; // left, center, right

  BOUQS.forEach((svg, i) => {
    setTimeout(() => {
      svg.classList.add('growing');
      svg.addEventListener('animationend', function onDone() {
        svg.removeEventListener('animationend', onDone);
        svg.classList.remove('growing');
        svg.style.opacity    = '1';
        svg.style.transform  = 'scaleY(1)';
        setTimeout(() => svg.classList.add('swaying'), 80);
      }, { once: true });
    }, delays[i]);
  });

  setTimeout(() => {
    bouqCaption.classList.add('show');
    openBookBtn.classList.add('show');
  }, 1200);
}

/* =========================================================
   BOOK PAGES DATA (10 pages = like a real book)
========================================================= */
const PAGES = [

  /* ── Page 1: Cover ── */
  `<div class="page-inner is-deco">
    <div class="page-orn">❧</div>
    <div class="page-eyebrow">23 de Abril · 2026</div>
    <div class="page-rule wide"></div>
    <div class="page-big-title">Para<br>Linn</div>
    <div class="page-rule wide"></div>
    <div class="page-deco-text">Día del Libro</div>
    <div class="page-orn sm" style="margin-top:auto">✿</div>
    <span class="page-num">1</span>
  </div>`,

  /* ── Page 2: Opening letter ── */
  `<div class="page-inner">
    <div class="page-chapter">Carta de apertura</div>
    <h3 class="page-heading">Querida Linn,</h3>
    <div class="page-rule-sm"></div>
    <p class="page-body">Hoy, en este dia donde se conmemoran los libros y las palabras, quise escribirte las mías propias.

No soy escritor ni nada de eso, pero hay cosas que merecen ser dichas. Así que te escribí este libro teniéndote en mente.

Y me disculpo de antemano por la cursilería de hacer esto, pero como sé que es algo que te gusta y lo mucho que te gusta leer, entonces bueno, 
que menos que darte una sorpresita.</p>
    <span class="page-num">2</span>
  </div>`,

  /* ── Page 3 ── */
  `<div class="page-inner">
    <div class="page-chapter">Página I</div>
    <h3 class="page-heading">Lo que sé de vos</h3>
    <div class="page-rule-sm"></div>
    <p class="page-body">Sé que amás leer, que te perdés entre páginas y salís con los ojos brillando. Sé que las flores te hacen feliz.

Sé que cuando algo te emociona, lo contás con todo el entusiasmo. Sos de esas personas que hacen que estar cerca ya se sienta bien y divertido, 
esa sensación cálida de tener tu compañía y siempre estaré agradecido por conocerte.</p>
    <span class="page-num">3</span>
  </div>`,

  /* ── Page 4 ── */
  `<div class="page-inner">
    <div class="page-chapter">Página II</div>
    <h3 class="page-heading">Lo que me gusta de vos</h3>
    <div class="page-rule-sm"></div>
    <p class="page-body">Me agrada cómo sos, la forma en que ves las cosas, la energía que tenés, la risa que aparece cuando menos la espero y 
    tus frases que siempre me divierten.

Me parece tierno tu forma de ser muchas veces, cuando tratas de ser seria, pero tu ternura lo opaca completamente, es algo que es tan vos.</p>
    <span class="page-num">4</span>
  </div>`,

  /* ── Page 5 ── */
  `<div class="page-inner">
    <div class="page-chapter">Página III</div>
    <h3 class="page-heading">Lo que pienso cuando<br>pienso en vos</h3>
    <div class="page-rule-sm"></div>
    <p class="page-body">Pienso en que tenés un mundo propio, lleno de cosas lindas. Pienso en que la gente que está cerca tuyo tiene tanta suerte, 
    aunque no lo diga o lo demuestre, es lindo estar a tu lado incluso por llamada.

Ojalá sepas cuánto valen esas cositas que hacés sin darte cuenta, esos pequeños cumplidos que decís, que aunque sean pocos, igual siempre 
son lindos de escuchar.</p>
    <span class="page-num">5</span>
  </div>`,

  /* ── Page 6 ── */
  `<div class="page-inner">
    <div class="page-chapter">Página IV</div>
    <h3 class="page-heading">Lo que te quiero decir</h3>
    <div class="page-rule-sm"></div>
    <p class="page-body">Sos especial. No de forma genérica, sino de verdad. Sos de esas personas que dejan huella sin intentarlo, como vos dejaste una en mí..

Y yo, que tengo la suerte de conocerte, quería que lo supieras: hay alguien que lo ve, que lo aprecia, que se alegra de que existas y que sobretodo 
estés bien.</p>
    <span class="page-num">6</span>
  </div>`,

  /* ── Page 7 ── */
  `<div class="page-inner">
    <div class="page-chapter">Página V</div>
    <h3 class="page-heading">Lo que te deseo</h3>
    <div class="page-rule-sm"></div>
    <p class="page-body">Que siempre tengas algo que te entretenga, te divierta, un libro que te atrape, que las flores te sigan haciendo sonreír. Que el mundo te trate bien, aunque sea porque vos ya lo tratás bien a él.

Que cada día tengas al menos una cosita que haga que valga la pena, y que nada en el mundo te haga sentir mal ni triste, porque no 
te mereces nada de eso.</p>
    <span class="page-num">7</span>
  </div>`,

  /* ── Page 8 ── */
  `<div class="page-inner">
    <div class="page-chapter">Página VI</div>
    <h3 class="page-heading">El final<br><em style="font-size:0.88em;font-weight:400">(que no es un final)</em></h3>
    <div class="page-rule-sm"></div>
    <p class="page-body">Los libros terminan, pero las palabras se quedan, y espero que estas que te digo se queden al menos un poco con vos.

    Que cuando leas en algún otro momento esto, que sepas y te dés cuenta que hay alguien que, de alguna manera, te adora.

Escribí esto porque te lo merecés: un libro tuyo, para vos, sobre lo mucho que te quiero.</p>
    <span class="page-num">8</span>
  </div>`,

  /* ── Page 9 ── */
  `<div class="page-inner">
    <div class="page-chapter">Cierre</div>
    <h3 class="page-heading">Gracias corazón.</h3>
    <div class="page-rule-sm"></div>
    <p class="page-body">Gracias por ser parte de mis días. Por los momentos buenos, los juegos, las charlas, todo lo que compartimos.

No siempre digo estas cosas en voz alta porque se que no te gusta el no saber reaccionar, pero acá, en estas páginas, están. Estas palabras y páginas 
son todas tuyas.</p>
    <span class="page-num">9</span>
  </div>`,

  /* ── Page 10: Closing ── */
  `<div class="page-inner is-closing">
    <div class="page-orn sm" style="position:absolute;top:22px;right:20px;opacity:0.3">❧</div>
    <div class="page-sign">
      Con todo el cariño y amor<br>del mundo,
      <div class="page-sign-name">Yo, Gon 💕</div>
    </div>
    <div class="page-sign-date">Abril · 2026</div>
    <span class="page-num">10</span>
  </div>`,

];

/* =========================================================
   BOOK ENGINE
========================================================= */
const bookSection = document.getElementById('bookSection');
const flipPage    = document.getElementById('flipPage');
const pageDots    = document.getElementById('pageDots');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');

const TOTAL = PAGES.length;
let currentPage = 0;
let turning     = false;

/* Build dots */
for (let i = 0; i < TOTAL; i++) {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Página ${i + 1}`);
  dot.addEventListener('click', () => {
    if (!turning && i !== currentPage) goTo(i, i > currentPage ? 1 : -1);
  });
  pageDots.appendChild(dot);
}

function updateUI() {
  prevBtn.disabled = (currentPage === 0);
  nextBtn.disabled = (currentPage === TOTAL - 1);
  pageDots.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentPage);
  });
}

function renderPage(idx) {
  flipPage.innerHTML = PAGES[idx];
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function goTo(newIdx, dir) {
  if (turning) return;
  turning = true;

  const exitClass  = dir > 0 ? 'exit-forward'  : 'exit-back';
  const enterClass = dir > 0 ? 'enter-forward' : 'enter-back';

  flipPage.classList.add(exitClass);
  await wait(320);
  flipPage.classList.remove(exitClass);

  currentPage = newIdx;
  renderPage(currentPage);
  updateUI();

  flipPage.classList.add(enterClass);
  await wait(320);
  flipPage.classList.remove(enterClass);

  turning = false;

  // 🎉 Celebration when reaching the last page
  if (newIdx === TOTAL - 1) {
    setTimeout(triggerCelebration, 180);
  }
}

/* =========================================================
   CELEBRATION BURST (final page)
========================================================= */
const BURST_EMOJIS = ['🌸', '🌹', '💕', '💖', '💗', '🌷', '🌺', '💐', '❤️', '💝', '✨', '🌼'];

function triggerCelebration() {
  // Build layer
  const layer = document.createElement('div');
  layer.className = 'burst-layer';
  document.body.appendChild(layer);

  // Soft glow flash
  const flash = document.createElement('div');
  flash.className = 'burst-flash';
  layer.appendChild(flash);

  // — PHASE 1: Radial burst from center —
  const RADIAL_COUNT = 64;
  for (let i = 0; i < RADIAL_COUNT; i++) {
    spawnRadial(layer, i, RADIAL_COUNT);
  }

  // — PHASE 2: Second smaller burst (delayed) for extra magic —
  setTimeout(() => {
    for (let i = 0; i < 30; i++) spawnRadial(layer, i, 30, 0.75);
  }, 450);

  // — PHASE 3: Gentle rain from top —
  for (let i = 0; i < 55; i++) {
    setTimeout(() => spawnRain(layer), 300 + Math.random() * 3500);
  }

  // Cleanup after everything finishes
  setTimeout(() => layer.remove(), 7500);
}

function spawnRadial(layer, i, total, scaleBias = 1) {
  const p = document.createElement('div');
  p.className = 'burst-particle burst-radial';
  p.textContent = BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)];

  // Spread around the circle with some jitter
  const angle = (i / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
  const dist  = (180 + Math.random() * 480) * scaleBias;
  const tx    = Math.cos(angle) * dist;
  const ty    = Math.sin(angle) * dist + 220 + Math.random() * 120; // gravity pulls down

  p.style.setProperty('--tx',    tx + 'px');
  p.style.setProperty('--ty',    ty + 'px');
  p.style.setProperty('--size',  (1.2 + Math.random() * 1.8) * scaleBias + 'rem');
  p.style.setProperty('--dur',   (2.4 + Math.random() * 1.6) + 's');
  p.style.setProperty('--rot',   ((Math.random() - 0.5) * 900) + 'deg');
  p.style.animationDelay = (Math.random() * 250) + 'ms';

  layer.appendChild(p);
}

function spawnRain(layer) {
  const p = document.createElement('div');
  p.className = 'burst-particle burst-rain';
  p.textContent = BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)];

  p.style.left = (Math.random() * 100) + '%';
  p.style.setProperty('--size',  (1 + Math.random() * 1.5) + 'rem');
  p.style.setProperty('--dur',   (3.5 + Math.random() * 2.5) + 's');
  p.style.setProperty('--drift', ((Math.random() - 0.5) * 180) + 'px');
  p.style.setProperty('--rot',   ((Math.random() - 0.5) * 540) + 'deg');

  layer.appendChild(p);
  setTimeout(() => p.remove(), 6500);
}

/* Navigation buttons */
prevBtn.addEventListener('click', () => {
  if (!turning && currentPage > 0) goTo(currentPage - 1, -1);
});
nextBtn.addEventListener('click', () => {
  if (!turning && currentPage < TOTAL - 1) goTo(currentPage + 1, 1);
});

/* Keyboard */
document.addEventListener('keydown', (e) => {
  if (!bookSection.classList.contains('visible')) return;
  if (e.key === 'ArrowRight' && currentPage < TOTAL - 1) goTo(currentPage + 1,  1);
  if (e.key === 'ArrowLeft'  && currentPage > 0)         goTo(currentPage - 1, -1);
});

/* Touch / swipe */
let touchStartX = 0;
let touchStartY = 0;

const flipStage = document.getElementById('flipStage');
flipStage.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

flipStage.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
    if (dx < 0 && currentPage < TOTAL - 1) goTo(currentPage + 1,  1);
    if (dx > 0 && currentPage > 0)         goTo(currentPage - 1, -1);
  }
}, { passive: true });

/* =========================================================
   AUDIO ENGINE — background song (MP3)
========================================================= */
const bgMusic = document.getElementById('bgMusic');
const MUSIC_VOLUME = 0.35; // ajustá entre 0 y 1 al gusto
let isMuted = false;
if (bgMusic) {
  bgMusic.loop = true;
  bgMusic.volume = MUSIC_VOLUME;
}

function ensureAudio() { /* no-op: audio element ready on load */ }

function startMusic() {
  if (!bgMusic) return;
  bgMusic.muted = isMuted;
  // fade-in suave
  bgMusic.volume = 0;
  const target = MUSIC_VOLUME;
  const playPromise = bgMusic.play();
  if (playPromise && playPromise.catch) playPromise.catch(() => {});
  let v = 0;
  const step = () => {
    v = Math.min(target, v + 0.03);
    bgMusic.volume = isMuted ? 0 : v;
    if (v < target) setTimeout(step, 80);
  };
  step();
}

function stopMusic() {
  if (!bgMusic) return;
  // fade-out suave y pausa
  const start = bgMusic.volume;
  let t = 0;
  const step = () => {
    t += 0.08;
    const v = Math.max(0, start * (1 - t));
    bgMusic.volume = v;
    if (t < 1) setTimeout(step, 60);
    else { try { bgMusic.pause(); } catch (e) {} }
  };
  step();
}

/* =========================================================
   MUTE TOGGLE
========================================================= */
const muteBtn = document.getElementById('muteBtn');

function setMuted(muted) {
  isMuted = muted;
  muteBtn.classList.toggle('muted', muted);
  if (bgMusic) bgMusic.muted = muted;
  try { localStorage.setItem('libroMuted', muted ? '1' : '0'); } catch (e) {}
}

muteBtn.addEventListener('click', () => setMuted(!isMuted));

/* Restore mute preference */
try {
  if (localStorage.getItem('libroMuted') === '1') {
    isMuted = true;
    muteBtn.classList.add('muted');
  }
} catch (e) {}

/* =========================================================
   ENVELOPE FLOW
========================================================= */
const envelopeOverlay = document.getElementById('envelopeOverlay');
const envelope        = document.getElementById('envelope');
const envFlap         = document.getElementById('envFlap');
const envSeal         = document.getElementById('envSeal');
const envHint         = document.getElementById('envHint');

function showEnvelope() {
  envelopeOverlay.classList.remove('fading');
  envelopeOverlay.classList.add('visible');
  envelopeOverlay.setAttribute('aria-hidden', 'false');
}

function hideEnvelope() {
  envelopeOverlay.classList.add('fading');
  setTimeout(() => {
    envelopeOverlay.classList.remove('visible');
    envelopeOverlay.classList.remove('fading');
    envelopeOverlay.setAttribute('aria-hidden', 'true');
    // Reset for potential reopen (unlikely but clean)
    envSeal.classList.remove('cracking');
    envFlap.classList.remove('open');
    envelope.classList.remove('opening');
    envHint.classList.remove('hidden');
  }, 550);
}

envSeal.addEventListener('click', () => {
  if (envSeal.classList.contains('cracking')) return;

  envSeal.classList.add('cracking');
  envHint.classList.add('hidden');
  playSealCrack();

  // Open the flap after the crack
  setTimeout(() => {
    envFlap.classList.add('open');
  }, 380);

  // Lift the envelope as it dissolves
  setTimeout(() => {
    envelope.classList.add('opening');
  }, 1050);

  // Fade overlay and reveal book
  setTimeout(() => {
    hideEnvelope();
    revealBook();
  }, 1500);
});

/* Sonido de crack del sello — eliminado junto con el sintetizador */
function playSealCrack() { /* no-op */ }

/* =========================================================
   OPEN BOOK BUTTON
========================================================= */
openBookBtn.addEventListener('click', () => {
  ensureAudio();
  startMusic();
  muteBtn.hidden = false;
  requestAnimationFrame(() => muteBtn.classList.add('visible'));
  showEnvelope();
});

function revealBook() {
  renderPage(0);
  updateUI();
  bookSection.classList.add('visible');
  setTimeout(() => {
    bookSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

/* =========================================================
   GOODBYE OVERLAY (intercept back link)
========================================================= */
const backLink       = document.getElementById('backLink');
const goodbyeOverlay = document.getElementById('goodbyeOverlay');

backLink.addEventListener('click', (e) => {
  e.preventDefault();
  const href = backLink.getAttribute('href');
  goodbyeOverlay.classList.add('visible');
  goodbyeOverlay.setAttribute('aria-hidden', 'false');
  stopMusic();
  setTimeout(() => { window.location.href = href; }, 1900);
});

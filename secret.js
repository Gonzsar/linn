// Wish diario (con rareza)
const wishBtn = document.getElementById("wishBtn");
const wishResult = document.getElementById("wishResult");

const pool = [
  { r: 0.01, text: "5⭐ Recompensa: Hago lo que vos quieras 😓" },
  { r: 0.04, text: "4⭐ Recompensa: Te digo corazón 💗" },
  { r: 0.10, text: "3⭐ Recompensa: Te debo una flor 🌸" },
  { r: 0.25, text: "2⭐ Recompensa: Te doy un halago 🙄" },
  { r: 0.60, text: "2⭐ Recompensa: No tenes nada 👻" },
];

function pickWish(){
  const x = Math.random();
  let acc = 0;
  for (const item of pool){
    acc += item.r;
    if (x <= acc) return item.text;
  }
  return pool[pool.length - 1].text;
}

wishBtn.addEventListener("click", () => {
  const prize = pickWish();
  const now = new Date();
  const text = `${prize}\n\n🗓️ ${now.toLocaleString()}`;
  wishResult.textContent = text;
  localStorage.setItem("linn_wish_last", text);
});

const saved = localStorage.getItem("linn_wish_last");
if (saved) wishResult.textContent = saved;

// Mensajes bonitos
const msgBtn = document.getElementById("msgBtn");
const msgResult = document.getElementById("msgResult");

const msgs = [
  "Tan tierna soss",
  "Que tengas un dia bonito",
  "Ojala no te dé hoy dolor de cabeza",
  "Jugamos?",
  "Cuando jugaremos algo aparte de Genshin?",
  "Hola mi haterrrr",
  "Sé que muuuyy en el fondo me querés",
  "Aunque me trates mal yo te quiero",
  "Cuando leas esto me tenes que decir una palabra random de la nada",
  "Me llevas al mundial?",
];

msgBtn.addEventListener("click", () => {
  msgResult.textContent = msgs[Math.floor(Math.random() * msgs.length)];
});

// Atrapa estrellitas (10s)
const starsBtn = document.getElementById("starsBtn");
const starsResult = document.getElementById("starsResult");
const arena = document.getElementById("arena");

let playing = false;
let score = 0;
let timer = null;
let spawner = null;

function spawnStar(){
  const s = document.createElement("div");
  s.className = "star";

  const pad = 10;
  const w = arena.clientWidth - 34 - pad;
  const h = arena.clientHeight - 34 - pad;

  s.style.left = (pad + Math.random() * w) + "px";
  s.style.top = (pad + Math.random() * h) + "px";

  s.addEventListener("click", () => {
    if (!playing) return;
    score++;
    s.remove();
  });

  arena.appendChild(s);

  // Se va sola
  setTimeout(() => s.remove(), 900);
}

function endGame(){
  playing = false;
  clearInterval(timer);
  clearInterval(spawner);

  const msg =
    score >= 25 ? "Pero que pro" :
    score >= 20  ? "Uyyy casi" :
    score >= 5  ? "Mmm otra vez" :
                  "Te guardo mas para luego";

  starsResult.textContent = `Puntaje: ${score} — ${msg}`;
  starsBtn.disabled = false;
}

starsBtn.addEventListener("click", () => {
  if (playing) return;
  playing = true;
  score = 0;
  starsResult.textContent = "¡Ya!";

  arena.classList.add("on");
  arena.innerHTML = "";

  starsBtn.disabled = true;

  // spawnea cada 350ms
  spawner = setInterval(spawnStar, 350);

  // cuenta 10s
  let t = 10;
  timer = setInterval(() => {
    t--;
    if (t <= 0) endGame();
  }, 1000);
});



/* =========================================================
   REGALO 3D (reemplaza al oráculo)
========================================================= */
const giftBox = document.getElementById("giftBox");
const giftOpen = document.getElementById("giftOpen");
const giftReset = document.getElementById("giftReset");
const giftResult = document.getElementById("giftResult");

const giftItems = [
  "Premio: Elegis un juego y no me quejo 😌",
  "Premio: 1 halago obligatorio (sin sarcasmo)",
  "Premio: Genshin & Chill ⭐",
  "Premio: Me elegis los personajes con que jugar",
  "Premio: Jugas con Qiqi por 20 minutos",
  "Premio Chilango: Ahora tenes que imitar el chilango"
];

function pickGift(){
  return giftItems[Math.floor(Math.random() * giftItems.length)];
}

function openGift(){
  giftBox.classList.add("bump");
  setTimeout(() => giftBox.classList.remove("bump"), 260);

  giftBox.classList.add("open");
  const text = pickGift();
  giftResult.textContent = text;
  localStorage.setItem("linn_gift_last", text);
}

giftOpen.addEventListener("click", openGift);
giftBox.addEventListener("click", openGift);

giftReset.addEventListener("click", () => {
  giftBox.classList.remove("open");
  giftResult.textContent = "—";
  localStorage.removeItem("linn_gift_last");
});

const giftSaved = localStorage.getItem("linn_gift_last");
if (giftSaved) {
  giftBox.classList.add("open");
  giftResult.textContent = giftSaved;
}


/* =========================================================
   3) CAJITA DE MÚSICA (WebAudio + step sequencer)
========================================================= */
const musicToggle = document.getElementById("musicToggle");
const musicRandom = document.getElementById("musicRandom");
const musicClear = document.getElementById("musicClear");
const seq = document.getElementById("seq");
const musicResult = document.getElementById("musicResult");

const ROWS = 4;   // 4 notas
const COLS = 8;   // 8 pasos
let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
let playingStep = -1;
let audioOn = false;

let audioCtx = null;

const notesHz = [523.25, 659.25, 783.99, 987.77]; // C5 E5 G5 B5 (suave)

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function beep(freq, time=0.08) {
  if (!audioOn) return;
  ensureAudio();

  const t0 = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + time);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(t0);
  osc.stop(t0 + time + 0.02);
}

function saveSeq() {
  localStorage.setItem("linn_seq_grid", JSON.stringify(grid));
}

function loadSeq() {
  const raw = localStorage.getItem("linn_seq_grid");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === ROWS) grid = parsed;
  } catch (_) {}
}

function renderSeq() {
  seq.innerHTML = "";

  const label = document.createElement("div");
  label.className = "seq-label";
  label.innerHTML = `<span>Notas (arriba agudo)</span><span>Paso: ${playingStep >= 0 ? (playingStep+1) : "-"}</span>`;
  seq.appendChild(label);

  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("div");
    row.className = "seq-grid";

    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "step";
      if (grid[r][c]) cell.classList.add("on");
      if (c === playingStep) cell.classList.add("playing");

      cell.addEventListener("click", async () => {
        // si está en iOS/Chrome, esto habilita el audio por gesto
        if (audioCtx && audioCtx.state === "suspended") await audioCtx.resume();

        grid[r][c] = !grid[r][c];
        saveSeq();
        renderSeq();

        // preview
        if (grid[r][c]) beep(notesHz[r], 0.06);
      });

      row.appendChild(cell);
    }
    seq.appendChild(row);
  }
}

let interval = null;

function startLoop() {
  if (interval) return;
  playingStep = -1;
  interval = setInterval(async () => {
    playingStep = (playingStep + 1) % COLS;

    // tocar notas activas
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][playingStep]) beep(notesHz[r], 0.08);
    }
    renderSeq();
  }, 220);
}

function stopLoop() {
  clearInterval(interval);
  interval = null;
  playingStep = -1;
  renderSeq();
}

musicToggle.addEventListener("click", async () => {
  audioOn = !audioOn;

  if (audioOn) {
    ensureAudio();
    if (audioCtx.state === "suspended") await audioCtx.resume();
    musicToggle.textContent = "Sonido: ON";
    musicResult.textContent = "Tip: activá algunos cuadritos y escuchá";
    startLoop();
  } else {
    musicToggle.textContent = "Sonido: OFF";
    musicResult.textContent = "Sonido apagado. Igual podés armar el patrón y guardarlo.";
    stopLoop();
  }
});

musicRandom.addEventListener("click", () => {
  // patrón lindo, no caos: 18% de probabilidad
  grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.random() < 0.18)
  );
  saveSeq();
  renderSeq();
});

musicClear.addEventListener("click", () => {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  saveSeq();
  renderSeq();
});

loadSeq();
renderSeq();













/* =========================================================
   PORTAL + PARTÍCULAS + AINO (NIVEL DIOS)
========================================================= */
const portal = document.getElementById("portal");
const enterBtn = document.getElementById("enterBtn");

const fx = document.getElementById("fx");
const fctx = fx.getContext("2d");

const ainoLayer = document.getElementById("ainoLayer");
const ainoBubble = document.getElementById("ainoBubble");
const ainoBubbleText = document.getElementById("ainoBubbleText");

function sizeFX(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  fx.width = Math.floor(innerWidth * dpr);
  fx.height = Math.floor(innerHeight * dpr);
  fx.style.width = innerWidth + "px";
  fx.style.height = innerHeight + "px";
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", sizeFX);
sizeFX();

// Partículas rosas suaves
let petals = [];
function initPetals(){
  petals = Array.from({length: 46}, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: 1.2 + Math.random() * 2.4,
    vx: -0.15 + Math.random() * 0.30,
    vy: 0.25 + Math.random() * 0.55,
    a: 0.22 + Math.random() * 0.35
  }));
}
initPetals();

function drawFX(){
  fctx.clearRect(0,0,innerWidth,innerHeight);

  for (const p of petals){
    p.x += p.vx;
    p.y += p.vy;
    if (p.y > innerHeight + 20) { p.y = -10; p.x = Math.random() * innerWidth; }
    if (p.x < -20) p.x = innerWidth + 20;
    if (p.x > innerWidth + 20) p.x = -20;

    fctx.globalAlpha = p.a;
    fctx.beginPath();
    fctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    fctx.fillStyle = "rgba(255,95,161,1)";
    fctx.fill();
  }

  requestAnimationFrame(drawFX);
}
requestAnimationFrame(drawFX);

// Mensajes de Aino para Linn
const ainoMsgs = [
  "Linn ✨\nHola Linn!\nQue te vaya bonito hoy.",
  "Linn 💮\nNo le hables mal a Gon.\nO sino me voy a enojar.",
  "Linn 💗\nEs verdad eso de que me cambiaste?\nPor una tal... Columbina??",
  "Linn 🌙\nIneffa me dijo que la gente ya no me usa.\nTE ODIO MIHOYO!",
  "Linn ⭐\nTengo mucha hambreeee.\nMe compras un taco?"
];

let bubbleTimer = null;
function showAinoBubble(text){
  ainoBubbleText.textContent = text;
  ainoBubble.classList.add("show");
  ainoBubble.setAttribute("aria-hidden","false");
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    ainoBubble.classList.remove("show");
    ainoBubble.setAttribute("aria-hidden","true");
  }, 2800);
}
ainoBubble.addEventListener("click", () => {
  ainoBubble.classList.remove("show");
  ainoBubble.setAttribute("aria-hidden","true");
});

// AINO: 1 sprite que se mueve por destinos random (lento y continuo)
let ainoEl = null;
let ainoMoveTimer = null;

function placeAinoAtRandom(slow = true){
  if (!ainoEl) return;  

  const size = 56;
  const pad = 10;

  // límites: que no tape mucho la burbuja de abajo
  const maxX = Math.max(pad, innerWidth - size - pad);
  const maxY = Math.max(pad, innerHeight - size - 110); // deja espacio a la bubble

  const x = Math.floor(pad + Math.random() * (maxX - pad));
  const y = Math.floor(80 + Math.random() * (maxY - 80)); // evita muy arriba

  // duración de movimiento (más lenta)
  const moveSeconds = slow ? (7 + Math.random() * 6) : (4 + Math.random() * 3);
  ainoEl.style.setProperty("--move", moveSeconds.toFixed(1) + "s");

  ainoEl.style.setProperty("--x", x + "px");
  ainoEl.style.setProperty("--y", y + "px");
}

function startAinoWander(){
  if (!ainoEl) return;
  clearInterval(ainoMoveTimer);

  // primer destino
  placeAinoAtRandom(true);

  // cada ~8–12s nuevo destino
  ainoMoveTimer = setInterval(() => {
    placeAinoAtRandom(true);
  }, 8500);
}

function spawnAinoSprites(){
  ainoLayer.innerHTML = "";

  ainoEl = document.createElement("div");
  ainoEl.className = "aino-float";

  const img = document.createElement("img");
  img.src = "assets/aino.png";
  img.alt = "Aino";
  ainoEl.appendChild(img);

  ainoEl.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const msg = ainoMsgs[Math.floor(Math.random() * ainoMsgs.length)];
    showAinoBubble(msg);

    // pequeño "salto" y cambia destino (se siente vivo)
    ainoEl.style.transform = "scale(1.06)";
    setTimeout(() => ainoEl.style.transform = "scale(1)", 140);
    placeAinoAtRandom(false);
  });

  ainoLayer.appendChild(ainoEl);

  startAinoWander();
}

spawnAinoSprites();
window.addEventListener("resize", () => {
  // cuando rota pantalla, reubica
  placeAinoAtRandom(true);
});

// Portal: tocar para entrar (y para habilitar audio en móvil si luego querés)
function enterPortal(){
  portal.classList.remove("show");
  portal.setAttribute("aria-hidden","true");
  // mensajito inicial
  showAinoBubble("Linn 💗\nAino te da la bienvenida a la Sala Protogema.");
}
enterBtn.addEventListener("click", enterPortal);
portal.addEventListener("click", (e) => {
  if (e.target === portal) enterPortal();
});






/* =========================================================
   CARTA POPUP (HALAGOS A LINN)
========================================================= */
const openLetter = document.getElementById("openLetter");
const letterModal = document.getElementById("letterModal");
const closeLetter = document.getElementById("closeLetter");
const letterText = document.getElementById("letterText");
const newLetter = document.getElementById("newLetter");
const copyLetter = document.getElementById("copyLetter");

const letters = [
  "Linn 💮\nFuera de todas las bromas.\nSos una persona increible de verdad.",
  "Linn ✨\nMe entretenes como pocas personas lo hacen.\nTenes un don te juro.",
  "Linn 🌸\nCada dia contigo.\nSé que va a ser un dia divertido.",
  "Linn 💗\nSin que tu lo sepas.\nMejoras siempre mis ánimos.",
  "Linn ⭐\nConocerte fue una de las cosas que más agradezco.\nQue haya pasado en el 2025."
];

function pickLetter(){
  return letters[Math.floor(Math.random() * letters.length)];
}

function showLetter(){
  const msg = pickLetter();
  letterText.textContent = msg;
  localStorage.setItem("linn_letter_last", msg);
  letterModal.classList.add("show");
  letterModal.setAttribute("aria-hidden", "false");
}

function hideLetter(){
  letterModal.classList.remove("show");
  letterModal.setAttribute("aria-hidden", "true");
}

if (openLetter && letterModal && closeLetter && letterText && newLetter && copyLetter){
  openLetter.addEventListener("click", showLetter);
  newLetter.addEventListener("click", () => {
    const msg = pickLetter();
    letterText.textContent = msg;
    localStorage.setItem("linn_letter_last", msg);
  });

  copyLetter.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(letterText.textContent);
      // feedback suave
      showAinoBubble("Linn 💗\nCopiado. Ahora es oficial ✨");
    }catch(_){
      showAinoBubble("Ups 😅\nNo se pudo copiar en este navegador.");
    }
  });

  closeLetter.addEventListener("click", hideLetter);
  letterModal.addEventListener("click", (e) => {
    if (e.target === letterModal) hideLetter();
  });

  const last = localStorage.getItem("linn_letter_last");
  if (last) letterText.textContent = last;
}
// Helpers
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
const rand = (a, b) => Math.random() * (b - a) + a;

// Float hearts (menos en móvil)
const floatLayer = $("#floatLayer");
function makeFloatHearts() {
  const isMobile = window.matchMedia("(max-width: 520px)").matches;
  const count = isMobile ? 14 : 22;

  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "fheart";

    const left = rand(0, 100);
    const dur = rand(11, 24);
    const delay = rand(-24, 0);
    const size = rand(14, isMobile ? 28 : 36);

    h.style.left = left + "vw";
    h.style.animationDuration = dur + "s";
    h.style.animationDelay = delay + "s";
    h.style.width = size + "px";
    h.style.height = size + "px";
    h.style.opacity = rand(0.12, 0.26).toFixed(2);

    floatLayer.appendChild(h);
  }
}
makeFloatHearts();

// Cursor glow (solo desktop)
const glow = $("#glow");
const hasFinePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
if (hasFinePointer) {
  window.addEventListener("pointermove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
} else {
  glow.style.display = "none";
}

// Top progress
const meterFill = $("#meterFill");
const pct = $("#pct");
function updateScrollMeter() {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const p = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
  meterFill.style.width = p + "%";
  pct.textContent = p + "%";
}
window.addEventListener("scroll", updateScrollMeter, { passive: true });
updateScrollMeter();

// Reveal
const revealEls = $$(".reveal");
const io = new IntersectionObserver(
  (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("in")),
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));

// Toast (centrado)
const toast = $("#toast");
let toastTimer = null;
function showToast(msg, ms = 3600) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), ms);
}

// Big love overlay
let bigLoveEl = document.createElement("div");
bigLoveEl.className = "big-love";
bigLoveEl.innerHTML = `
  <div class="panel">
    <div class="title">Me encantas mucho mi niña</div>
  </div>
`;
document.body.appendChild(bigLoveEl);

function showBigLove() {
  bigLoveEl.classList.add("show");
  setTimeout(() => bigLoveEl.classList.remove("show"), 2200);
}


// Pop hearts
function popHearts(x, y, n = 10) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    p.className = "pop";

    const dx = (Math.random() * 2 - 1) * rand(36, 120);
    const dy = (Math.random() * 2 - 1) * rand(36, 150) - rand(10, 60);

    p.style.left = x + rand(-8, 8) + "px";
    p.style.top = y + rand(-8, 8) + "px";
    p.style.setProperty("--dx", dx.toFixed(0) + "px");
    p.style.setProperty("--dy", dy.toFixed(0) + "px");

    const shades = ["#ffffff", "#ffe3ef", "#ffd1e6", "#ff9ac4"];
    p.style.background = shades[Math.floor(Math.random() * shades.length)];

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

// Spark hello
const spark = $("#spark");
setTimeout(() => spark.classList.add("show"), 600);
setTimeout(() => spark.classList.remove("show"), 2600);

// ===== Música MP3 de fondo =====
const bgMusic = $("#bgMusic");
const soundBtn = $("#soundBtn");

// Estado real: audio ON/OFF
let musicOn = false;

// Ajustes recomendados (volumen suave)
if (bgMusic) {
  bgMusic.volume = 0.55;
}

// Actualiza UI del botón
function updateSoundUI() {
  soundBtn.textContent = musicOn ? "🔊 ON" : "🔈 OFF";
}

// Intenta reproducir (solo funciona tras gesto del usuario por políticas del navegador)
async function playMusic() {
  if (!bgMusic) return;
  try {
    await bgMusic.play();
    musicOn = true;
    updateSoundUI();
    showToast("🎵 Música activada");
  } catch (e) {
    // Si el navegador bloquea, se activará cuando el usuario vuelva a tocar.
    musicOn = false;
    updateSoundUI();
    showToast("Toque otra vez para activar música 🎵");
  }
}

function stopMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  bgMusic.currentTime = bgMusic.currentTime; // mantiene posición
  musicOn = false;
  updateSoundUI();
  showToast("Música desactivada");
}

// Toggle desde botón
soundBtn.addEventListener("click", async () => {
  if (!bgMusic) return;
  if (!musicOn) await playMusic();
  else stopMusic();
});

// ===== Beeps opcionales (si quiere, los dejo apagados cuando hay música) =====
let audioCtx = null;
function beep(freq = 880, dur = 0.06) {
  // Si hay música ON, no meto beeps (queda más prolijo)
  if (musicOn) return;

  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime;

    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.10, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    o.connect(g).connect(audioCtx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  } catch (_) {}
}

// Chips (mensajes al centro)
$$(".chip").forEach((ch) => {
  ch.addEventListener("click", (e) => {
    const msg = ch.getAttribute("data-msg") || "💗";
    const r = ch.getBoundingClientRect();
    popHearts(r.left + r.width / 2, r.top + r.height / 2, 10);
    showToast(msg);
    beep(880, 0.06);
  });
});

// Botones “Un poquito de magia”
// Ahora SIEMPRE muestran: corazones + mensaje.
const magicMsgs = {
  "💗": "💗 Tan tierna corazoncito",
  "💕": "💕 Me gustás mucho",
  "💘": "💘 Ayy que inteligente mi niñaa",
  "💞": "💞 Que linda como lees, holaaa"
};

$$(".hbtn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const n = parseInt(btn.getAttribute("data-pop") || "10", 10);
    popHearts(e.clientX, e.clientY, n);

    const t = (btn.textContent || "").trim();
    if (btn.id === "loveUp") {
      // lo maneja abajo
    } else {
      showToast(magicMsgs[t] || "💗");
    }

    beep(660, 0.06);
  });
});

// Love meter
const loveFill = $("#loveFill");
const loveTag = $("#loveTag");
const loveUp = $("#loveUp");
let love = 18;

let loveUnlocked = false;

function setLove(val) {
  love = Math.max(0, Math.min(100, val));
  loveFill.style.width = love + "%";
  loveTag.textContent = "AMOR: " + love + "%";

  if (love === 100 && !loveUnlocked) {
    loveUnlocked = true;
    showBigLove();
    popHearts(window.innerWidth / 2, window.innerHeight / 2, 26);
    beep(988, 0.08);
  }
}

setLove(love);

loveUp.addEventListener("click", (e) => {
  const inc = Math.random() < 0.2 ? 12 : 8;

  const nextLove = Math.min(100, love + inc);
  setLove(nextLove);

  popHearts(e.clientX, e.clientY, 12);

  // “Subiendo amor…” muy corto
  if (nextLove < 100) {
    showToast("💓 Subiendo amor...", 450);
  }

  beep(740, 0.06);
});


// Final buttons
const yesBtn = $("#yesBtn");
const obvioBtn = $("#obvioBtn");

yesBtn.addEventListener("click", (e) => {
    runFireworks(4600);
  popHearts(e.clientX, e.clientY, 26);
  showToast("💗 Me hiciste aun mas feliz.", 6000);
setTimeout(() => showToast("Entonces… Genshin juntitos?? sisisi", 6000), 1400);
  beep(1046, 0.09);
});

// “Obvio microbio”
// En móvil NO se mueve; en desktop puede ser juguetón con hover real.
const playfulDesktop = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

let dodge = 0;
function moveButton() {
  const b = obvioBtn.getBoundingClientRect();
  const pad = 12;

  const maxX = window.innerWidth - b.width - pad;
  const maxY = window.innerHeight - b.height - pad;

  const nx = Math.max(pad, Math.min(maxX, rand(pad, maxX)));
  const ny = Math.max(pad + 70, Math.min(maxY, rand(pad + 70, maxY)));

  obvioBtn.style.position = "fixed";
  obvioBtn.style.left = nx + "px";
  obvioBtn.style.top = ny + "px";
  obvioBtn.style.zIndex = 80;
}

if (playfulDesktop) {
  obvioBtn.addEventListener("mouseenter", () => {
    dodge++;
    if (dodge <= 3) moveButton();
  });
}

obvioBtn.addEventListener("click", (e) => {
    runFireworks(4600);
  popHearts(e.clientX, e.clientY, 28);
  showToast("💘 OPIO MICROPIOO", 6000);
setTimeout(() => showToast("Entonces… Genshin juntitos?? sisisi", 6000), 1400);
  beep(1174, 0.10);
});

// Toques suaves al azar (menos en móvil para que no “ensucie”)
const isMobile = window.matchMedia("(max-width: 520px)").matches;
let lastClick = 0;
window.addEventListener("click", (e) => {
  const now = Date.now();
  if (now - lastClick < 260) return;
  lastClick = now;

  const chance = isMobile ? 0.06 : 0.10;
  if (Math.random() < chance) {
    popHearts(e.clientX, e.clientY, 10);
    beep(520, 0.05);
  }
});






// ===== Fireworks (celebración) =====
const fw = $("#fireworks");
const fctx = fw ? fw.getContext("2d") : null;

function resizeFW(){
  if(!fw) return;
  fw.width = Math.floor(window.innerWidth * devicePixelRatio);
  fw.height = Math.floor(window.innerHeight * devicePixelRatio);
  fw.style.width = window.innerWidth + "px";
  fw.style.height = window.innerHeight + "px";
  if (fctx) fctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeFW);
resizeFW();

let fwRunning = false;
let particles = [];
let fwEndAt = 0;

function burst(x, y){
  const count = 52;
  for(let i=0;i<count;i++){
    const a = Math.random() * Math.PI * 2;
    const sp = rand(1.8, 5.4);
    particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: rand(40, 70),
      size: rand(1.4, 3.0),
      // tonos rosados/blancos (sin fijar colores “raros”)
      col: ["rgba(255,255,255,.95)","rgba(255,210,230,.95)","rgba(255,154,196,.95)"][Math.floor(Math.random()*3)]
    });
  }
}

function runFireworks(ms = 2200){
  if(!fw || !fctx) return;
  fw.classList.add("on");
  fwRunning = true;
  fwEndAt = performance.now() + ms;

  // 2-3 explosiones iniciales
  burst(rand(80, window.innerWidth-80), rand(80, window.innerHeight*0.55));
  burst(rand(80, window.innerWidth-80), rand(80, window.innerHeight*0.55));

  requestAnimationFrame(tickFW);
}

function tickFW(t){
  if(!fwRunning) return;

  // limpiar con transparencia para “estela”
  fctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // disparar nuevas explosiones suaves
  if (t < fwEndAt && Math.random() < 0.10){
    burst(rand(80, window.innerWidth-80), rand(80, window.innerHeight*0.55));
  }

  // actualizar partículas
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.life -= 1;
    p.vy += 0.06;          // gravedad
    p.vx *= 0.985;         // fricción
    p.vy *= 0.985;
    p.x += p.vx;
    p.y += p.vy;

    if(p.life <= 0){
      particles.splice(i,1);
      continue;
    }

    fctx.globalAlpha = Math.max(0, p.life / 70);
    fctx.fillStyle = p.col;
    fctx.beginPath();
    fctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fctx.fill();
  }

  fctx.globalAlpha = 1;

  // cortar
  if (t >= fwEndAt && particles.length === 0){
    fwRunning = false;
    fw.classList.remove("on");
    fctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    return;
  }

  requestAnimationFrame(tickFW);
}

// 1) Pegue su endpoint de Formspree:
const FORMSPREE_URL = "https://formspree.io/f/xnjbrkob ";

const statusMsg = document.getElementById("statusMsg");
const modal = document.getElementById("messageModal");
const modalText = document.getElementById("modalText");

const acceptBtn = document.getElementById("acceptBtn");
const rejectBtn = document.getElementById("rejectBtn");

function showModal(message) {
  modalText.textContent = message;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function lockButtons() {
  acceptBtn.disabled = true;
  rejectBtn.disabled = true;
  acceptBtn.style.opacity = "0.7";
  rejectBtn.style.opacity = "0.7";
}

async function notify(choice) {
  if (!FORMSPREE_URL || FORMSPREE_URL.includes("abcdwxyz")) return;

  // Formspree funciona muy bien con FormData (simple y compatible)
  const data = new FormData();
  data.append("respuesta", choice);
  data.append("fecha", new Date().toISOString());
  data.append("pagina", "Para Linn");
  // Esto ayuda a identificar el origen (sin IP ni nada sensible)
  data.append("origen", location.href);

  // Enviar sin molestar la experiencia de ella
  try {
    await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: data
    });
  } catch (_) {
    // silencioso
  }
}

acceptBtn.addEventListener("click", () => {
  const message =
    "Me pone muy contento que hayas dicho que si :), cuando la web me avise que dijiste que si, te envio soli en Genshin. Y si podés desbloqueame de Discord para hablar en algun momento";

  lockButtons();
  notify("aceptar");
  statusMsg.textContent = ""; // no mostrar nada técnico
  showModal(message);
});

rejectBtn.addEventListener("click", () => {
  const message =
    "Entiendo completamente tu decision, lamento haberte molestado de vuelta, ya no lo haré mas. Te deseo lo mejor enserio Linn, sos una gran persona y te mereces lo más bonito.";

  lockButtons();
  notify("rechazar");
  statusMsg.textContent = "";
  showModal(message);
});

document.getElementById("closeModalBtn").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});


// Botón de Protogema (Sala secreta)
const secretFab = document.getElementById("secretFab");
const sparkles = document.getElementById("sparkles");

function spawnSparkles(x, y) {
  sparkles.classList.add("on");
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";

    const dx = (Math.random() * 240 - 120).toFixed(0) + "px";
    const dy = (Math.random() * 200 - 160).toFixed(0) + "px";
    s.style.setProperty("--dx", dx);
    s.style.setProperty("--dy", dy);

    s.style.left = x + "px";
    s.style.top = y + "px";

    sparkles.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }
  setTimeout(() => sparkles.classList.remove("on"), 420);
}

secretFab.addEventListener("click", (e) => {
  const rect = secretFab.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  spawnSparkles(x, y);

  // mini-pop
  secretFab.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(0.96)" }, { transform: "scale(1)" }],
    { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)" }
  );

  // transición y redirección
  document.body.classList.add("leaving");
  setTimeout(() => {
    window.location.href = "secret.html";
  }, 280);
});


// Nuevo botón - Zona de Diversión
const funFab = document.getElementById("funFab");

funFab.addEventListener("click", (e) => {
  const rect = funFab.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  spawnSparkles(x, y);

  // mini-pop
  funFab.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(0.96)" }, { transform: "scale(1)" }],
    { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)" }
  );

  // transición y redirección
  document.body.classList.add("leaving");
  setTimeout(() => {
    window.location.href = "games.html";
  }, 280);
});
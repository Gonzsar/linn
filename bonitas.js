// Formspree endpoint
const FORMSPREE_URL = "https://formspree.io/f/xnjbrkob";

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
  acceptBtn.style.opacity = "0.5";
  rejectBtn.style.opacity = "0.5";
  acceptBtn.style.cursor = "default";
  rejectBtn.style.cursor = "default";
}

async function notify(choice) {
  if (!FORMSPREE_URL) return;

  const data = new FormData();
  data.append("respuesta", choice);
  data.append("fecha", new Date().toISOString());
  data.append("pagina", "Para Linn");
  data.append("origen", location.href);

  try {
    await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    });
  } catch (_) {
    // silent
  }
}

acceptBtn.addEventListener("click", () => {
  const message =
    "Me pone muy contento que hayas dicho que si :), cuando la web me avise que dijiste que si, te envio soli en Genshin. Y si podés desbloqueame de Discord para hablar en algun momento";

  lockButtons();
  notify("aceptar");
  statusMsg.textContent = "";
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

// Particles (same system as landing)
(function () {
  const container = document.getElementById("particles");
  if (!container) return;

  const COUNT = 24;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement("div");
    p.className = "particle";

    const size = 3 + Math.random() * 8;
    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 18;
    const delay = Math.random() * duration;

    p.style.cssText =
      "width:" + size + "px;" +
      "height:" + size + "px;" +
      "left:" + left + "%;" +
      "bottom:-20px;" +
      "animation-duration:" + duration + "s;" +
      "animation-delay:-" + delay + "s;";

    container.appendChild(p);
  }
})();

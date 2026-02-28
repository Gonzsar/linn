// 1) Pegue su endpoint de Formspree:
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
    "Me pone muy contento que hayas dicho que si :), cuando la web me avise que dijiste que si, te envio soli en Genshin. Y desbloqueame de ds porfa";

  lockButtons();
  notify("aceptar");
  statusMsg.textContent = ""; // no mostrar nada técnico
  showModal(message);
});

rejectBtn.addEventListener("click", () => {
  const message =
    "Entiendo completamente tu decision, lamento haberte molestado de vuelta, ya no lo haré mas. Te deseo lo mejor enserio Linn, sos una gran mujer.";

  lockButtons();
  notify("rechazar");
  statusMsg.textContent = "";
  showModal(message);
});

document.getElementById("closeModalBtn").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
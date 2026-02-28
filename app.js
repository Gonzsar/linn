// URL del Apps Script (Web App) que guarda los logs en Google Sheets
const LOG_ENDPOINT = "https://script.google.com/macros/s/AKfycby0RTemcH7WlLHOxLjOK7Md-O_d0UZ3qKkUD1yBNbJ07cI_u5zbVhvzSL89uYSFNTHC/exec";

const statusMsg = document.getElementById("statusMsg");
const modal = document.getElementById("messageModal");
const modalText = document.getElementById("modalText");

function showModal(message) {
  modalText.textContent = message;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

// Enviar log SIN afectar la experiencia de ella.
// Si falla, no pasa nada visible.
async function logChoice(choice) {
  if (!LOG_ENDPOINT || LOG_ENDPOINT.includes("PEGAR_AQUI")) return;

  try {
    // mode:no-cors evita bloqueos del navegador por CORS.
    // OJO: con no-cors no podés leer si falló o no, pero el envío se intenta igual.
    await fetch(LOG_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        respuesta: choice,
        fecha: new Date().toISOString()
      })
    });
  } catch (_) {
    // Silencioso
  }
}

document.getElementById("acceptBtn").addEventListener("click", () => {
  const message =
    "Me pone muy contento que hayas dicho que si :), cuando la web me avise que dijiste que si, te envio soli en Genshin. Y desbloqueame de ds porfa";

  logChoice("aceptar");
  showModal(message);
});

document.getElementById("rejectBtn").addEventListener("click", () => {
  const message =
    "Entiendo completamente tu decision, lamento haberte molestado de vuelta, ya no lo haré mas. Te deseo lo mejor enserio Linn, sos una gran mujer.";

  logChoice("rechazar");
  showModal(message);
});

document.getElementById("closeModalBtn").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
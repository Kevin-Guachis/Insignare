import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../styles/alerts.css";

const appAlert = Swal.mixin({
  customClass: { popup: "app-alert", confirmButton: "app-alert-confirm", cancelButton: "app-alert-cancel" },
  buttonsStyling: false,
  confirmButtonText: "Aceptar",
  cancelButtonText: "Cancelar",
  heightAuto: false,
  returnFocus: true,
});

export const showWarning = (title, text, options = {}) => appAlert.fire({ ...options, icon: "warning", title, text });
export const showError = (text = "No fue posible completar la operación.") => appAlert.fire({ icon: "error", title: "Ocurrió un problema", text });
export const showSuccess = (title, text) => appAlert.fire({ icon: "success", title, text, timer: 2200, timerProgressBar: true });
export const showInfo = (title, text) => appAlert.fire({ icon: "info", title, text });

export async function confirmAction(title, text, confirmButtonText = "Confirmar") {
  const result = await appAlert.fire({ icon: "warning", title, text, showCancelButton: true, confirmButtonText, focusCancel: true });
  return result.isConfirmed;
}

export function showPdfLoading() {
  return appAlert.fire({ title: "Generando informe", text: "Estamos preparando tu informe PDF.", allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
}

export function showPdfUploadProgress(file) {
  let stage = 0;
  let percent = 0;
  let popup;
  let closed = false;
  const titles = ["Subiendo PDF", "Validando PDF", "Guardando cambios"];
  const descriptions = [
    "Estamos enviando tu archivo. El tiempo depende de su tamaño y de tu conexión.",
    "Archivo enviado. El servidor está comprobando y almacenando el PDF.",
    "El PDF está listo. Estamos guardando los cambios del formulario.",
  ];
  function render() {
    if (closed || !popup || Swal.getPopup() !== popup) return;
    popup.querySelector(".swal2-title").textContent = titles[stage];
    popup.querySelector(".pdf-upload__file").textContent = file.name;
    popup.querySelector(".pdf-upload__description").textContent = descriptions[stage];
    popup.querySelector(".pdf-upload__percent").textContent = stage === 0 ? `${percent}%` : "Un momento…";
    const progress = popup.querySelector("progress");
    if (stage === 0) progress.value = percent;
    else progress.removeAttribute("value");
    popup.querySelectorAll(".pdf-upload__step").forEach((step, index) => {
      step.classList.toggle("is-current", index === stage);
      step.classList.toggle("is-complete", index < stage);
      if (index === stage) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
  }
  appAlert.fire({
    title: titles[0],
    html: `<div class="pdf-upload">
      <div class="pdf-upload__icon" aria-hidden="true"><i class="bi bi-file-earmark-pdf" ></i></div>
      <p class="pdf-upload__file"></p>
      <p class="pdf-upload__description" role="status" aria-live="polite"></p>
      <div class="pdf-upload__meter"><span>Progreso del envío</span><strong class="pdf-upload__percent">0%</strong></div>
      <progress class="pdf-upload__bar" max="100" value="0" aria-label="Progreso de subida del PDF"></progress>
      <ol class="pdf-upload__steps" aria-label="Etapas de la subida">
        <li class="pdf-upload__step">Subiendo</li><li class="pdf-upload__step">Validando</li><li class="pdf-upload__step">Guardando</li>
      </ol>
      <p class="pdf-upload__hint">Mantén esta página abierta hasta que finalice.</p>
    </div>`,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    timer: undefined,
    didOpen: () => { popup = Swal.getPopup(); render(); },
  });
  popup = Swal.getPopup();
  render();
  return {
    update(value) { percent = Math.max(0, Math.min(100, value)); stage = percent >= 100 ? 1 : 0; render(); },
    saving() { stage = 2; render(); },
    close() { if (closed) return; closed = true; if (popup && Swal.getPopup() === popup) Swal.close(); },
  };
}

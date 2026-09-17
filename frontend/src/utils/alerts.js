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

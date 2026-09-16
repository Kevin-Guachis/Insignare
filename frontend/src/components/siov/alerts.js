import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../../styles/siov-alerts.css";
export const siovAlert = Swal.mixin({
 customClass: { popup: "siov-alert", confirmButton: "siov-alert-confirm", cancelButton: "siov-alert-cancel" },
 confirmButtonText: "Aceptar", cancelButtonText: "Cancelar",
 confirmButtonColor: "#1B4F82", cancelButtonColor: "#64748b",
 heightAuto: false, returnFocus: true,
});
export const siovWarning = (title, text) => siovAlert.fire({ icon: "warning", title, text });
export const siovError = text => siovAlert.fire({ icon: "error", title: "Ocurrió un problema", text });
export const siovSuccess = (title, text) => siovAlert.fire({ icon: "success", title, text });
export async function siovConfirm(title, text, confirmButtonText) {
 const result = await siovAlert.fire({ icon: "warning", title, text, showCancelButton: true, confirmButtonText, focusCancel: true });
 return result.isConfirmed;
}
export function siovPdfLoading() {
 return siovAlert.fire({ title: "Generando informe", text: "Estamos preparando tu informe PDF.", allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
}

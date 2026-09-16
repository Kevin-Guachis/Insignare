import { api } from "./api";
export const getContacto = () => api("/api/contact/get.php");
export const getAdminContacto = () => api("/api/contact/admin.php");
export async function saveContacto(values) {
 const result = await api("/api/contact/update.php", { method: "POST", body: values });
 window.dispatchEvent(new Event("contacto-updated"));
 return result;
}
export function telephoneLink(value) {
 const clean = value.replace(/[^+0-9]/g, "");
 return "tel:" + (clean.startsWith("0") ? "+593" + clean.slice(1) : clean);
}

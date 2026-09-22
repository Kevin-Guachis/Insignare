import { api } from "./api";

const base = "/api/leveling/";
export const listAcademicCatalog = (id, admin = false) => api(base + (admin ? "admin.php" : "list.php") + "?university_id=" + encodeURIComponent(id));
function notify() {
 window.dispatchEvent(new Event("leveling-updated"));
 if ("BroadcastChannel" in window) {
  const channel = new BroadcastChannel("leveling");
  channel.postMessage("updated");
  channel.close();
 }
}
export async function saveAcademicCatalogEntry(values) {
 const row = await api(base + "save.php", { method: "POST", body: values });
 notify();
 return row;
}
export async function deleteAcademicCatalogEntry(type, id, university_id) {
 await api(base + "delete.php", { method: "DELETE", body: { type, id, university_id } });
 notify();
}

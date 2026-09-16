import { api } from "./api";
const base = "/api/material-resources/";
export const listMaterialResources = () => api(base + "index.php");
export const listAdminMaterialResources = () => api(base + "admin.php");
export const saveMaterialResource = body => api(base + "index.php", { method: body.id ? "PUT" : "POST", body });
export const deleteMaterialResource = id => api(base + "index.php", { method: "DELETE", body: { id } });
export async function uploadMaterialPdf(file) {
 const body = new FormData(); body.append("documento", file);
 const row = await api(base + "upload.php", { method: "POST", body });
 return { file_path: row.documento, file_name: row.documento_nombre };
}
export const materialFileUrl = (id, download = false) => base + "file.php?id=" + encodeURIComponent(id) + (download ? "&download=1" : "");
export function filterMaterials(rows, filters) {
 return rows.filter(row => (!filters.university_id || String(row.university_id) === filters.university_id)
  && (!filters.type || row.type === filters.type) && (!filters.subject || row.subject === filters.subject)
  && (!filters.year || String(row.year) === filters.year));
}

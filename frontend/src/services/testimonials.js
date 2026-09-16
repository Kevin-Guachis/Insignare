import { api } from "./api";
const path = kind => "/api/" + (kind === "reviews" ? "reviews" : "testimonials") + "/";
export const listTestimonials = (kind, page = 1) => api(path(kind) + "index.php?page=" + page);
export const listAdminTestimonials = kind => api(path(kind) + "admin.php");
export const saveTestimonial = (kind, body) => api(path(kind) + "index.php", { method: body.id ? "PUT" : "POST", body });
export const deleteTestimonial = (kind, id) => api(path(kind) + "index.php", { method: "DELETE", body: { id } });
export async function uploadTestimonialPhoto(file) {
 const body = new FormData(); body.append("imagen", file);
 return api(path("testimonials") + "upload.php", { method: "POST", body });
}

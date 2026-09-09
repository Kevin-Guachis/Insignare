import { api } from "./api";
const base = "/api/footer-services/";
export const listFooterServices = () => api(base + "list.php");
export const listAdminFooterServices = () => api(base + "admin.php");
function notify() {
 window.dispatchEvent(new Event("footer-services-updated"));
 if ("BroadcastChannel" in window) {
  const channel=new BroadcastChannel("footer-services");channel.postMessage("updated");channel.close();
 }
}
export async function saveFooterService(values) {
 const row=await api(base+(values.id ? "update.php" : "create.php"),{method:values.id ? "PUT" : "POST",body:values});
 notify();return row;
}
export async function deleteFooterService(id) {
 await api(base+"delete.php",{method:"DELETE",body:{id}});notify();
}

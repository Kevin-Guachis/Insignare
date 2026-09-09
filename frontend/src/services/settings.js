import { api } from "./api";
export const getSiteSettings = () => api("/api/settings/get.php");
export const getAdminSettings = () => api("/api/settings/admin.php");
export async function saveSiteSettings(values) {
  const saved = await api("/api/settings/update.php", { method: "POST", body: values });
  window.dispatchEvent(new Event("site-settings-updated"));
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("site-settings");
    channel.postMessage("updated");
    channel.close();
  }
  return saved;
}

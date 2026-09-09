import { api } from "./api";
import { toNewsStory } from "../data/news";

const listeners = new Set();
let snapshot = { news: [], loading: true, error: "" };
let request = null;
let interval = null;
let channel = null;

function publish(next) {
  if (JSON.stringify(snapshot) === JSON.stringify(next)) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function refreshNews() {
  if (request) return request;
  request = api("/api/news/list.php")
    .then((rows) => publish({ news: rows.map(toNewsStory), loading: false, error: "" }))
    .catch((error) => publish({ ...snapshot, loading: false, error: error.message }))
    .finally(() => { request = null; });
  return request;
}

export function subscribeNews(listener) {
  listeners.add(listener);
  if (listeners.size === 1) {
    refreshNews();
    interval = window.setInterval(() => {
      if (!document.hidden) refreshNews();
    }, 30000);
    window.addEventListener("focus", refreshNews);
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("insignare-news");
      channel.onmessage = refreshNews;
    }
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshNews);
      channel?.close();
      channel = null;
    }
  };
}

export const getNewsSnapshot = () => snapshot;

export async function notifyNewsChanged() {
  if (request) await request;
  await refreshNews();
  if ("BroadcastChannel" in window) {
    const sender = new BroadcastChannel("insignare-news");
    sender.postMessage("updated");
    sender.close();
  }
}

export const listAdminNews = () => api("/api/news/admin_list.php");
export const saveNews = (data) => api(`/api/news/${data.id ? "update" : "create"}.php`, { method: "POST", body: data });
export const hideNews = (id) => api("/api/news/delete.php", { method: "POST", body: { id } });
export function uploadNewsImage(file) {
  const body = new FormData();
  body.append("imagen", file);
  return api("/api/news/upload.php", { method: "POST", body });
}

export function uploadNewsDocument(file) {
  const body = new FormData();
  body.append("documento", file);
  return api("/api/news/upload_document.php", { method: "POST", body });
}


export const destroyNews = (id) => api("/api/news/destroy.php", { method: "POST", body: { id, confirm: true } });


import { useEffect, useState } from "react";
import { listAcademicCatalog } from "../services/leveling";

export function useAcademicCatalog(universityId, admin = false) {
 const [state, setState] = useState({ rows: [], loading: true, error: "" });
 const [retry, setRetry] = useState(0);
 useEffect(() => {
  if (!universityId) return;
  let active = true;
  let request = 0;
  const refresh = async () => {
   const current = ++request;
   try {
    const rows = await listAcademicCatalog(universityId, admin);
    if (active && current === request) setState({ rows, loading: false, error: "" });
   } catch (error) {
    if (active && current === request) setState({ rows: [], loading: false, error: error.message });
   }
  };
  refresh();
  const timer = setInterval(refresh, 30000);
  window.addEventListener("focus", refresh);
  window.addEventListener("leveling-updated", refresh);
  const channel = "BroadcastChannel" in window ? new BroadcastChannel("leveling") : null;
  if (channel) channel.onmessage = refresh;
  return () => {
   active = false;
   clearInterval(timer);
   channel?.close();
   window.removeEventListener("focus", refresh);
   window.removeEventListener("leveling-updated", refresh);
  };
 }, [universityId, admin, retry]);
 return { ...state, reload: () => setRetry(value => value + 1) };
}

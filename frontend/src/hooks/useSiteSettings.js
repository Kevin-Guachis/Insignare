import { useEffect, useState } from "react";
import { getSiteSettings } from "../services/settings";
import { defaultFooterSettings } from "../config/footerSettings";
export function useSiteSettings() {
  const [settings, setSettings] = useState(defaultFooterSettings);
  useEffect(() => {
    let active = true;
    const refresh = () => getSiteSettings().then((data) => { if (active) setSettings(data); }).catch(() => {});
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("site-settings-updated", refresh);
    const channel = "BroadcastChannel" in window ? new BroadcastChannel("site-settings") : null;
    if (channel) channel.onmessage = refresh;
    return () => {
      active = false; clearInterval(timer); channel?.close();
      window.removeEventListener("focus", refresh);
      window.removeEventListener("site-settings-updated", refresh);
    };
  }, []);
  return settings;
}

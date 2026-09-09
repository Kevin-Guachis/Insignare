import { useEffect, useState } from "react";
import { listFooterServices } from "../services/footerServices";
export function useFooterServices() {
 const [services,setServices]=useState([]);
 useEffect(()=>{
  let active=true;
  const refresh=()=>listFooterServices().then(rows=>{if(active)setServices(rows);}).catch(()=>{});
  refresh();const timer=setInterval(refresh,30000);
  window.addEventListener("focus",refresh);window.addEventListener("footer-services-updated",refresh);
  const channel="BroadcastChannel" in window ? new BroadcastChannel("footer-services") : null;
  if(channel)channel.onmessage=refresh;
  return()=>{active=false;clearInterval(timer);channel?.close();window.removeEventListener("focus",refresh);window.removeEventListener("footer-services-updated",refresh);};
 },[]);
 return services;
}

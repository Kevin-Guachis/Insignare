import { useEffect, useState } from "react";
import { listUniversities } from "../services/universities";
export function useUniversities() {
 const [state,setState]=useState({universities:[],loading:true,error:""});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  const refresh=()=>listUniversities().then(rows=>{if(active)setState({universities:rows,loading:false,error:""});}).catch(e=>{if(active)setState(current=>({...current,loading:false,error:e.message}));});
  refresh();const timer=setInterval(refresh,30000);
  window.addEventListener("focus",refresh);window.addEventListener("universities-updated",refresh);
  const channel="BroadcastChannel" in window?new BroadcastChannel("universities"):null;
  if(channel)channel.onmessage=refresh;
  return()=>{active=false;clearInterval(timer);channel?.close();window.removeEventListener("focus",refresh);window.removeEventListener("universities-updated",refresh);};
 },[retry]);
 return {...state,reload:()=>setRetry(current=>current+1)};
}

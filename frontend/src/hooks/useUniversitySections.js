import { useEffect, useState } from "react";
import { listUniversitySections } from "../services/universitySections";
export function useUniversitySections(universityId) {
 const [state,setState]=useState({id:null,sections:[],loading:true,error:""});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!universityId)return;
  let active=true;
  const refresh=()=>listUniversitySections(universityId).then(rows=>{if(active)setState({id:universityId,sections:rows,loading:false,error:""});}).catch(e=>{if(active)setState({id:universityId,sections:[],loading:false,error:e.message});});
  refresh();const timer=setInterval(refresh,30000);
  window.addEventListener("focus",refresh);window.addEventListener("university-sections-updated",refresh);
  const channel="BroadcastChannel" in window?new BroadcastChannel("university-sections"):null;
  if(channel)channel.onmessage=refresh;
  return()=>{active=false;clearInterval(timer);channel?.close();window.removeEventListener("focus",refresh);window.removeEventListener("university-sections-updated",refresh);};
 },[universityId,retry]);
 return {...(state.id===universityId?state:{sections:[],loading:!!universityId,error:""}),reload:()=>setRetry(n=>n+1)};
}

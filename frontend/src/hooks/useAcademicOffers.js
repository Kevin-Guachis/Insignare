import { useEffect, useState } from "react";
import { listAcademicOffers } from "../services/academicOffers";
export function useAcademicOffers(universityId) {
 const [state,setState]=useState({id:null,offers:[],loading:true,error:""});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!universityId)return;
  let active=true;
  const refresh=()=>listAcademicOffers(universityId).then(rows=>{if(active)setState({id:universityId,offers:rows,loading:false,error:""});}).catch(e=>{if(active)setState({id:universityId,offers:[],loading:false,error:e.message});});
  refresh();const timer=setInterval(refresh,30000);
  window.addEventListener("focus",refresh);window.addEventListener("academic-offers-updated",refresh);
  const channel="BroadcastChannel" in window?new BroadcastChannel("academic-offers"):null;
  if(channel)channel.onmessage=refresh;
  return()=>{active=false;clearInterval(timer);channel?.close();window.removeEventListener("focus",refresh);window.removeEventListener("academic-offers-updated",refresh);};
 },[universityId,retry]);
 return {...(state.id===universityId?state:{offers:[],loading:!!universityId,error:""}),reload:()=>setRetry(n=>n+1)};
}

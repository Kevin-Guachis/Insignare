import { useEffect, useState } from "react";
import { getAdmission } from "../services/admissions";
export function useAdmission(universityId) {
 const [state,setState]=useState({id:null,admission:null,steps:[],loading:true,error:""});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  const refresh=()=>getAdmission(universityId).then(data=>{if(active)setState({...data,id:universityId,loading:false,error:""});}).catch(e=>{if(active)setState({id:universityId,admission:null,steps:[],loading:false,error:e.message});});
  refresh();const timer=setInterval(refresh,30000);
  window.addEventListener("focus",refresh);window.addEventListener("admissions-updated",refresh);
  const channel="BroadcastChannel" in window?new BroadcastChannel("admissions"):null;if(channel)channel.onmessage=refresh;
  return()=>{active=false;clearInterval(timer);channel?.close();window.removeEventListener("focus",refresh);window.removeEventListener("admissions-updated",refresh);};
 },[universityId,retry]);
 return {...(state.id===universityId?state:{admission:null,steps:[],loading:true,error:""}),reload:()=>setRetry(n=>n+1)};
}

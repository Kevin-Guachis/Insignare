import { useEffect, useState } from "react";
import { listUniversityDocuments } from "../services/universityDocuments";
export function useUniversityDocuments(universityId) {
 const [state,setState]=useState({id:null,documents:[],loading:true,error:""});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!universityId)return;
  let active=true;
  const refresh=()=>listUniversityDocuments(universityId).then(rows=>{if(active)setState({id:universityId,documents:rows,loading:false,error:""});}).catch(e=>{if(active)setState({id:universityId,documents:[],loading:false,error:e.message});});
  refresh();const timer=setInterval(refresh,30000);
  window.addEventListener("focus",refresh);window.addEventListener("university-documents-updated",refresh);
  const channel="BroadcastChannel" in window?new BroadcastChannel("university-documents"):null;
  if(channel)channel.onmessage=refresh;
  return()=>{active=false;clearInterval(timer);channel?.close();window.removeEventListener("focus",refresh);window.removeEventListener("university-documents-updated",refresh);};
 },[universityId,retry]);
 return {...(state.id===universityId?state:{documents:[],loading:!!universityId,error:""}),reload:()=>setRetry(n=>n+1)};
}

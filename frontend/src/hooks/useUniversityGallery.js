import { useEffect, useState } from "react";
import { listUniversityGallery } from "../services/universityGallery";
export function useUniversityGallery(universityId) {
 const [state,setState]=useState({id:null,images:[],loading:true,error:""});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!universityId)return;
  let active=true;
  const refresh=()=>listUniversityGallery(universityId).then(rows=>{if(active)setState({id:universityId,images:rows,loading:false,error:""});}).catch(e=>{if(active)setState({id:universityId,images:[],loading:false,error:e.message});});
  refresh();const timer=setInterval(refresh,30000);
  window.addEventListener("focus",refresh);window.addEventListener("university-gallery-updated",refresh);
  const channel="BroadcastChannel" in window?new BroadcastChannel("university-gallery"):null;
  if(channel)channel.onmessage=refresh;
  return()=>{active=false;clearInterval(timer);channel?.close();window.removeEventListener("focus",refresh);window.removeEventListener("university-gallery-updated",refresh);};
 },[universityId,retry]);
 return {...(state.id===universityId?state:{images:[],loading:!!universityId,error:""}),reload:()=>setRetry(n=>n+1)};
}

import { useEffect, useState } from "react";
import { getExam } from "../services/exams";
export function useExam(universityId) {
 const [state,setState]=useState({id:null,exam:null,categories:[],loading:true,error:""});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  const refresh=()=>getExam(universityId).then(data=>{if(active)setState({...data,id:universityId,loading:false,error:""});}).catch(e=>{if(active)setState({id:universityId,exam:null,categories:[],loading:false,error:e.message});});
  refresh();const timer=setInterval(refresh,30000);
  window.addEventListener("focus",refresh);window.addEventListener("exams-updated",refresh);
  const channel="BroadcastChannel" in window?new BroadcastChannel("exams"):null;if(channel)channel.onmessage=refresh;
  return()=>{active=false;clearInterval(timer);channel?.close();window.removeEventListener("focus",refresh);window.removeEventListener("exams-updated",refresh);};
 },[universityId,retry]);
 return {...(state.id===universityId?state:{exam:null,categories:[],loading:true,error:""}),reload:()=>setRetry(n=>n+1)};
}

import { useEffect } from "react";
import { loadSiovLibraries } from "./libraries";
export default function SiovCharts({ results,barRef,radarRef,onReady,onError }){
 useEffect(()=>{
  let active=true,bar,radar;
  loadSiovLibraries().then(()=>{
   if(!active)return;
   const labels=results.map(a=>a.nombre),data=results.map(a=>a.porcentaje);
   bar=new window.Chart(barRef.current,{type:"bar",data:{labels,datasets:[{label:"Afinidad (%)",data,backgroundColor:results.map(a=>a.color)}]},options:{animation:{onComplete:onReady},plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100}}}});
   radar=new window.Chart(radarRef.current,{type:"radar",data:{labels,datasets:[{label:"Perfil vocacional",data,backgroundColor:"rgba(27,79,130,.25)",borderColor:"#1B4F82"}]},options:{scales:{r:{beginAtZero:true,max:100}}}});
  }).catch(e=>{if(active)onError(e.message);});
  return()=>{active=false;bar?.destroy();radar?.destroy();};
 },[results,barRef,radarRef,onReady,onError]);
 return <div className="card-panel mb-4"><h3 className="font-display mb-3">Perfil Vocacional</h3><div className="charts-grid"><div><canvas id="chart-bar" ref={barRef} height="220" role="img" aria-label="Gráfico de barras de afinidad"/></div><div><canvas id="chart-radar" ref={radarRef} height="220" role="img" aria-label="Gráfico radar del perfil"/></div></div></div>;
}

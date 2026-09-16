import { useEffect } from "react";
import { loadSiovLibraries } from "./libraries";
import { chartConfig } from "./chartConfig";
export default function SiovCharts({ results,barRef,radarRef,onReady,onError }){
 useEffect(()=>{
  let active=true,bar,radar;
  loadSiovLibraries().then(()=>{
   if(!active)return;
   bar=new window.Chart(barRef.current,chartConfig(results,"bar"));
   radar=new window.Chart(radarRef.current,chartConfig(results,"radar"));
   onReady();
  }).catch(e=>{if(active)onError(e.message);});
  return()=>{active=false;bar?.destroy();radar?.destroy();};
 },[results,barRef,radarRef,onReady,onError]);
 return <div className="card-panel mb-4"><h3 className="font-display mb-3">Perfil Vocacional</h3><div className="charts-grid"><div className="siov-chart"><canvas id="chart-bar" ref={barRef} role="img" aria-label="Gráfico de barras de afinidad"/></div><div className="siov-chart"><canvas id="chart-radar" ref={radarRef} role="img" aria-label="Gráfico radar del perfil"/></div></div></div>;
}

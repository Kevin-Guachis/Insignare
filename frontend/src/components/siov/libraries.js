let loading;
export function loadSiovLibraries(){
 if(!loading)loading=Promise.all([
  load("/siov/vendor/chart.umd.min.js","Chart"),
  load("/siov/vendor/jspdf.umd.min.js","jspdf"),
 ]).catch(error=>{loading=null;throw error;});
 return loading;
}
function load(src,key){
 if(window[key])return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const script=document.createElement("script");script.src=src;
  script.onload=()=>resolve();script.onerror=()=>{script.remove();reject(new Error("No se pudieron cargar los gráficos o el PDF. Reintenta la descarga."));};
  document.head.appendChild(script);
 });
}

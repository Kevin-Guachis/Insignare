import { api } from "./api";
export const getSiovContent=()=>api("/api/siov/content.php");
export const getSiovAdmin=()=>api("/api/siov/admin.php");
export const saveSiov=(type,values)=>api("/api/siov/save.php",{method:values.id?"PUT":"POST",body:{type,...values}});
export const deleteSiov=(type,id)=>api("/api/siov/delete.php",{method:"DELETE",body:{type,id}});
// Metrics use a separate allowlisted payload and never carry authentication cookies.
export function recordSiovMetric(evento,dimension_id,minutos){
 const body={evento,...(dimension_id!==undefined?{dimension_id}:{}),...(minutos!==undefined?{minutos}:{})};
 return fetch("/api/siov/metrics.php",{method:"POST",credentials:"omit",referrerPolicy:"no-referrer",headers:{"Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"},body:JSON.stringify(body)}).then(r=>r.ok).catch(()=>false);
}

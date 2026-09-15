export function prepareContent(raw){
 const areas=raw.areas.filter(a=>a.activo===1);
 const areaIds=new Set(areas.map(a=>a.id));
 const questions=raw.questions.filter(q=>q.activo===1&&areaIds.has(q.area_id));
 if(areas.length<3||areas.some(a=>!questions.some(q=>q.area_id===a.id)))throw new Error("El SIOV necesita al menos tres áreas activas con preguntas. Revisa la configuración.");
 const careers=raw.careers.filter(c=>c.activo===1&&areaIds.has(c.area_id));
 const universities=raw.universities.filter(u=>u.activo===1);
 const AREAS=Object.fromEntries(areas.map(a=>[a.codigo,{...a,preguntas:questions.map((q,i)=>q.area_id===a.id?i+1:null).filter(Boolean),profesiones:careers.filter(c=>c.area_id===a.id&&c.relacionada===1).map(c=>c.nombre)}]));
 const UNIVERSIDADES=Object.fromEntries(universities.map(u=>[u.codigo,u]));
 const OFERTA_CARRERAS=raw.career_universities.filter(r=>r.activo===1).flatMap(r=>{
  const c=careers.find(c=>c.id===r.career_id),u=universities.find(u=>u.id===r.university_id);
  return c&&u?[{...r,area:areas.find(a=>a.id===c.area_id).codigo,uni:u.codigo,carrera:c.nombre}]:[];
 });
 return {questions,AREAS,UNIVERSIDADES,OFERTA_CARRERAS,careers};
}
export function calculateResults(AREAS,respuestas){
 return Object.entries(AREAS).map(([codigo,a])=>{
  const puntaje=a.preguntas.filter(p=>respuestas[p]===true).length;
  return {codigo,id:a.id,nombre:a.nombre,puntaje,total:a.preguntas.length,porcentaje:Math.round(puntaje/a.preguntas.length*100),color:a.color};
 }).sort((a,b)=>b.porcentaje-a.porcentaje);
}
export function topCareers(results,offers){
 const top=results.slice(0,2).map(a=>a.codigo);
 return offers.filter(c=>top.includes(c.area)).sort((a,b)=>results.find(r=>r.codigo===b.area).porcentaje-results.find(r=>r.codigo===a.area).porcentaje).slice(0,10);
}

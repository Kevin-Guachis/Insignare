import { useState } from "react";
import { topCareers } from "./model";
import { recordSiovMetric } from "../../services/siov";
export default function SiovCareer({ results,content,onCompare,relatedOnly=false }){
 const [selected,setSelected]=useState(["","",""]);
 const [comparison,setComparison]=useState([]);
 const first=results[0];
 const fields=[["Universidad",c=>content.UNIVERSIDADES[c.uni].nombre],["Facultad",c=>c.facultad],["Carrera",c=>c.carrera],["Título",c=>c.titulo],["Duración",c=>c.duracion],["Modalidad",c=>c.modalidad],["Campo Laboral",c=>c.campoLaboral]];
 const related = <>
 <div className="card-panel mb-4"><h3 className="font-display mb-3">Carreras Relacionadas (Área Predominante)</h3><div className="d-flex flex-column gap-2">{content.AREAS[first.codigo].profesiones.map((name,i)=><div className="career-card d-flex justify-content-between align-items-center gap-2" key={name}><div><div className="fw-semibold">{name}</div><small className="text-muted">Campo laboral según área: {first.nombre}</small></div><span className="badge" style={{background:first.color}}>{Math.max(first.porcentaje-i*1.5,40).toFixed(0)}%</span></div>)}</div></div>
 </>;
 if(relatedOnly)return related;
 return <>
 <div className="card-panel mb-4 no-print"><h3 className="font-display mb-3">Comparador de Carreras (hasta 3)</h3><div className="row">{selected.map((value,i)=><div className="col-md-4" key={i}><select aria-label={"Carrera "+(i+1)} className="form-select" value={value} onChange={e=>setSelected(old=>old.map((v,j)=>i===j?e.target.value:v))}><option value="">-- Selecciona una carrera --</option>{content.OFERTA_CARRERAS.map((c,index)=><option value={index} key={c.id}>{c.carrera} ({c.uni})</option>)}</select></div>)}</div>
 <button className="btn btn-outline-brand mt-3" onClick={()=>{const indices=selected.filter(v=>v!=="").map(Number);if(indices.length<2){window.alert("Selecciona al menos 2 carreras para comparar.");return;}setComparison(indices);onCompare(indices);[...new Set(indices.map(i=>content.OFERTA_CARRERAS[i].career_id))].forEach(id=>recordSiovMetric("career",id));}}>Comparar</button>
 {!!comparison.length&&<div className="table-responsive mt-3"><table className="table uni-table"><thead><tr><th>Característica</th>{comparison.map((_,i)=><th key={i}>Opción {i+1}</th>)}</tr></thead><tbody>{fields.map(([label,fn])=><tr key={label}><th>{label}</th>{comparison.map((index,i)=><td key={i}>{fn(content.OFERTA_CARRERAS[index])}</td>)}</tr>)}</tbody></table></div>}
 </div>
 <div className="card-panel mb-4"><h3 className="font-display mb-3">TOP 10 Carreras Recomendadas</h3><div className="d-flex flex-column gap-2">{topCareers(results,content.OFERTA_CARRERAS).map((c,i)=><div className="top10-item" key={c.id}><div className="top10-medal">{["🥇","🥈","🥉"][i]||(i+1)+"."}</div><div className="flex-grow-1"><strong>{c.carrera}</strong> — {content.UNIVERSIDADES[c.uni].nombre}</div><span className="badge bg-secondary">{results.find(a=>a.codigo===c.area).porcentaje}%</span></div>)}</div></div>
 </>;
}

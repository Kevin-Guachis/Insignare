import { recordSiovMetric } from "../../services/siov";
export default function SiovUniversities({ results,content }){
 const top=results.slice(0,2).map(a=>a.codigo);
 return <div className="card-panel mb-4"><h3 className="font-display mb-1">Oferta Universitaria</h3><p className="text-muted small mb-3">Referencial — {Object.keys(content.UNIVERSIDADES).join(", ")}. Verifica siempre la información oficial vigente con el botón "Oferta Académica".</p>
 {Object.entries(content.UNIVERSIDADES).map(([code,uni])=>{
 const rows=content.OFERTA_CARRERAS.filter(c=>c.uni===code&&top.includes(c.area));
 return <div className="uni-block mb-4" key={code}><div className="uni-block-header d-flex justify-content-between align-items-center flex-wrap gap-2"><div><h4 className="font-display mb-0">{uni.nombre}</h4><small className="text-muted">Tipo de prueba de admisión: <strong>{uni.tipoPrueba}</strong></small></div><a className="btn btn-outline-brand" target="_blank" rel="noopener noreferrer" href={uni.url} onClick={()=>recordSiovMetric("university",uni.id)}>Ver Oferta Académica Oficial →</a></div>
 {rows.length?<div className="table-responsive mt-2"><table className="table uni-table"><thead><tr>{["Facultad","Carrera","Título","Duración","Modalidad","Campo Laboral"].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{rows.map(c=><tr key={c.id}>{["facultad","carrera","titulo","duracion","modalidad","campoLaboral"].map(k=><td key={k}>{c[k]}</td>)}</tr>)}</tbody></table></div>:<div className="alert mt-2">⚠️ {uni.nombre} no cuenta actualmente con carreras vinculadas a las áreas predominantes identificadas. Se recomienda verificar directamente en su portal oficial.</div>}
 </div>;
 })}</div>;
}

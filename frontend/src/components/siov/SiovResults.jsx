import { siovPdfLoading,siovSuccess,siovError } from "./alerts";
import { useCallback,useRef,useState } from "react";
import SiovCharts from "./SiovCharts";
import SiovUniversities from "./SiovUniversities";
import SiovCareer from "./SiovCareer";
import SiovContact from "./SiovContact";
import { generarInformePDF } from "./report";
export default function SiovResults({ results,content,student,onReset }){
 const [comparison,setComparison]=useState([]);
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const barRef=useRef(null),radarRef=useRef(null);
 const handleChartError=useCallback(message=>{setError(message);siovError(message);},[]);
 const markReady=useCallback(()=>setReady(true),[]);
 const [p,s,t]=results;
 const nombre="El/La estudiante";
 return <section id="screen-resultados">
 <div className="card-panel mb-4"><div className="step-eyebrow">Resultados</div><h2 className="font-display mb-3">Ranking de Áreas Vocacionales</h2>{results.map((a,i)=><div className="area-row" key={a.codigo}><div className="area-rank">{i+1}</div><div className="area-name fw-semibold">{a.nombre}</div><div className="area-bar-track"><div className="area-bar-fill" style={{width:a.porcentaje+"%",background:a.color}}/></div><div className="area-score text-end fw-semibold">{a.puntaje}/{a.total} · {a.porcentaje}%</div></div>)}</div>
 <SiovCharts results={results} barRef={barRef} radarRef={radarRef} onReady={markReady} onError={handleChartError}/>
 <div className="card-panel mb-4"><h3 className="font-display mb-3">Interpretación Automática</h3><p id="texto-interpretacion" className="mb-0">Según los resultados del Sistema Inteligente de Orientación Vocacional (SIOV), <strong>{nombre}</strong> obtuvo su mayor afinidad en el área de <strong>{p.nombre}</strong>, con un puntaje de {p.puntaje} sobre {p.total} preguntas ({p.porcentaje}%), lo que indica {content.AREAS[p.codigo].descripcion} En segundo lugar se ubica el área de <strong>{s.nombre}</strong> ({s.puntaje}/{s.total} · {s.porcentaje}%), seguida de <strong>{t.nombre}</strong> ({t.porcentaje}%), lo que sugiere intereses complementarios que pueden enriquecer la decisión profesional. Con base en este perfil, se recomienda profundizar la exploración vocacional en las dos áreas de mayor puntaje, idealmente mediante conversaciones con orientadores académicos, docentes y profesionales en ejercicio antes de tomar una decisión final.</p></div>
 <SiovCareer results={results} content={content} onCompare={setComparison} relatedOnly/>
 <SiovUniversities results={results} content={content}/>
 <SiovCareer results={results} content={content} onCompare={setComparison}/>
 <SiovContact/>
 <div className="download-section no-print mb-4"><h3 className="font-display mb-1">¡Tu informe está listo!</h3><p className="text-muted mb-3">Descarga tu informe completo de orientación vocacional en PDF con todos tus resultados, interpretación profesional y oferta académica personalizada.</p>
 {error&&<p role="alert">{error}</p>}
 <button className="btn-download-primary download-pulse" disabled={!ready||busy} onClick={async()=>{setBusy(true);setError("");siovPdfLoading();try{await generarInformePDF({state:{estudiante:student,comparador:comparison},resultadoAreas:results,...content,barCanvas:barRef.current,radarCanvas:radarRef.current});await siovSuccess("Informe generado","Tu informe se ha generado correctamente.");}catch(e){setError(e.message||"No se pudo generar el PDF.");await siovError(e.message||"No se pudo generar el PDF.");}finally{setBusy(false);}}}>{busy?"Generando informe...":"⬇️ Descargar Informe PDF"}</button>
 <div className="mt-3"><button className="btn btn-outline-secondary" onClick={onReset}>🔄 Realizar Nuevo Test</button></div></div>
 </section>;
}

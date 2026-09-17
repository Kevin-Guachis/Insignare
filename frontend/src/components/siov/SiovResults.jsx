import { confirmAction,showPdfLoading,showSuccess,showError,showWarning } from "../../utils/alerts";
import { useCallback,useRef,useState } from "react";
import SiovCharts from "./SiovCharts";
import SiovUniversities from "./SiovUniversities";
import SiovCareer from "./SiovCareer";
import SiovContact from "./SiovContact";
import { generarInformePDF } from "./report";
import { siteConfig } from "../../config/siteConfig";
import { recordSiovMetric } from "../../services/siov";
export default function SiovResults({ results,content,student,onReset }){
 const [comparison,setComparison]=useState([]);
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 // Results unmount on a new test, so this flag never survives a restart.
 const [pdfGenerated,setPdfGenerated]=useState(false);
 const barRef=useRef(null),radarRef=useRef(null);
 const handleChartError=useCallback(message=>{setError(message);showError(message);},[]);
 const markReady=useCallback(()=>setReady(true),[]);
 const [p,s,t]=results;
 const nombre="El/La estudiante";
 async function downloadReport(){
  if(!ready||busy)return;
  setBusy(true);setError("");showPdfLoading();
  try{
   await generarInformePDF({state:{estudiante:student,comparador:comparison},resultadoAreas:results,...content,barCanvas:barRef.current,radarCanvas:radarRef.current});
   setPdfGenerated(true);
   await showSuccess("Informe generado","Tu informe se ha generado correctamente. Ya puedes solicitar asesoría sobre tus resultados.");
  }catch(e){
   setError(e.message||"No se pudo generar el PDF.");
   await showError(e.message||"No se pudo generar el PDF.");
  }finally{setBusy(false);}
 }
 async function requestOrientation(){
  if(busy)return;
  if(!pdfGenerated){
   if(await confirmAction("Descarga primero tu informe","Tu informe contiene el detalle de tus resultados. Descárgalo antes de solicitar asesoría para que puedas compartirlo con nuestro orientador.","Descargar informe"))await downloadReport();
   return;
  }
  const phone=siteConfig.whatsapp.phone;
  if(!/^[1-9][0-9]{6,14}$/.test(phone||"")){
   await showWarning("WhatsApp no disponible","Por favor, comunícate mediante los datos de contacto de Insignare.");
   return;
  }
  const message=`Hola, soy ${student.nombres.trim()} \n\nAcabo de realizar el SIOV de Insignare.\n\nMi principal área de afinidad fue ${p.nombre} (${p.porcentaje}%).\n\nYa descargué mi informe y quisiera recibir asesoría para comprender mejor mis resultados, conocer carreras relacionadas, universidades y alternativas de ingreso.\n\n¿Me pueden ayudar con mi orientación?`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
  recordSiovMetric("orientation_requested");
 }
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
 <button className="btn-download-primary download-pulse" disabled={!ready||busy} onClick={downloadReport}>{busy?"Generando informe...":"⬇️ Descargar Informe PDF"}</button>
 </div>
 <section className="card-panel no-print mb-4 siov-orientation" aria-labelledby="siov-orientation-title">
  <h3 id="siov-orientation-title" className="font-display mb-3">¿Quieres asesoría sobre tus resultados?</h3>
  <p className="text-muted mb-3">Nuestro equipo puede ayudarte a interpretar tu perfil vocacional, conocer carreras relacionadas, universidades y alternativas de ingreso.</p>
  <button type="button" className="btn btn-brand" disabled={!ready||busy} onClick={requestOrientation}>💬 Quiero asesoría sobre mis resultados</button>
  <p className="text-muted mt-3 mb-0">Se abrirá WhatsApp con un mensaje para que tú lo envíes. Puedes compartir el PDF manualmente si el orientador te lo solicita.</p>
 </section>
 <div className="text-center no-print mb-4"><button className="btn btn-outline-secondary" disabled={busy} onClick={onReset}>🔄 Realizar Nuevo Test</button></div>
 </section>;
}

import { showWarning } from "../../utils/alerts";
import { useEffect,useRef,useState } from "react";
export default function SiovTest({ questions,answers,setAnswers,onFinish }){
 const [current,setCurrent]=useState(1);
 const timer=useRef(null);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 function go(n){clearTimeout(timer.current);setCurrent(n);}
 function select(value){
  clearTimeout(timer.current);setAnswers(old=>({...old,[current]:value}));
  if(current<questions.length)timer.current=setTimeout(()=>setCurrent(n=>Math.min(n+1,questions.length)),180);
 }
 const pct=Math.round(current/questions.length*100);
 function finish(){
  clearTimeout(timer.current);
  const missing=questions.map((_,i)=>i+1).filter(n=>answers[n]===undefined);
  if(missing.length){showWarning("Preguntas pendientes","Faltan por responder las preguntas: "+missing.join(", "));go(missing[0]);return;}
  onFinish();
 }
 return <section id="screen-test" className="card-panel">
 <div className="d-flex justify-content-between align-items-center mb-2"><span className="step-eyebrow">Pregunta <span id="preg-actual">{current}</span> de {questions.length}</span><span>{pct}%</span></div>
 <div className="progress mb-4"><div className="progress-bar" role="progressbar" aria-label="Progreso del test" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{width:pct+"%"}}/></div>
 <p className="pregunta-numero mb-4" id="preg-texto">{questions[current-1].texto}</p>
 <div className="row mb-4">{[[true,"✅ Me Interesa","opt-si"],[false,"🚫 No Me Interesa","opt-no"]].map(([v,label,id])=><div className="col-md-6" key={id}><button type="button" id={id} className={"opcion-interes text-center fw-semibold"+(answers[current]===v?" selected"+(!v?" no-interesa":""):"")} aria-pressed={answers[current]===v} onClick={()=>select(v)}>{label}</button></div>)}</div>
 <div className="d-flex justify-content-between gap-2"><button className="btn btn-outline-brand" disabled={current===1} onClick={()=>go(current-1)}>← Anterior</button>
 {current===questions.length?<button className="btn btn-brand" onClick={finish}>Ver Resultados →</button>:<button className="btn btn-brand" onClick={()=>{if(answers[current]===undefined){showWarning("Pregunta pendiente","Debes responder esta pregunta antes de continuar.");return;}go(current+1);}}>Siguiente →</button>}
 </div></section>;
}

import { studentError } from "../components/siov/studentValidation";
import { showWarning,confirmAction,showSuccess,showError } from "../utils/alerts";
import { useEffect,useRef,useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import SiovIntro from "../components/siov/SiovIntro";
import SiovStudent from "../components/siov/SiovStudent";
import SiovTest from "../components/siov/SiovTest";
import SiovResults from "../components/siov/SiovResults";
import { prepareContent,calculateResults } from "../components/siov/model";
import { getSiovContent,recordSiovMetric } from "../services/siov";
import "../styles/siov.css";
export default function Siov(){
 const [content,setContent]=useState(null),[error,setError]=useState(""),[retry,setRetry]=useState(0);
 const [screen,setScreen]=useState("intro"),[student,setStudent]=useState({}),[answers,setAnswers]=useState({}),[results,setResults]=useState([]);
 const started=useRef(0),completed=useRef(false);
 useEffect(()=>{let active=true;getSiovContent().then(raw=>{const data=prepareContent(raw);if(active){setContent(data);setError("");}}).catch(e=>{if(active){setError(e.message);showError(e.message);}});return()=>{active=false;};},[retry]);
 function go(next){setScreen(next);window.scrollTo({top:0,behavior:"smooth"});}
 async function start(data){const invalid=studentError(data);if(invalid){await showWarning("Datos incompletos",invalid.message);document.getElementById("inp-"+invalid.field)?.focus();return;}setStudent(Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.trim()])));started.current=performance.now();completed.current=false;recordSiovMetric("started");go("test");}
 async function finish(){if(completed.current)return;completed.current=true;const ranked=calculateResults(content.AREAS,answers);setResults(ranked);recordSiovMetric("completed",undefined,Math.min(240,Math.round((performance.now()-started.current)/60000)));recordSiovMetric("area",ranked[0].id);await showSuccess("Evaluación completada","Tu evaluación ha finalizado y tus resultados están listos.");go("results");}
 async function reset(){if(!await confirmAction("¿Reiniciar evaluación?","Se perderá el progreso actual de la evaluación.","Sí, reiniciar"))return;setStudent({});setAnswers({});setResults([]);completed.current=false;setContent(null);setRetry(n=>n+1);go("intro");}
 return <><Header/><main className="siov-page"><div className="siov-shell">
 {error?<p role="alert">{error} <button className="btn btn-brand" onClick={()=>setRetry(n=>n+1)}>Reintentar</button></p>:!content?<p role="status">Cargando SIOV...</p>:<>
 {screen==="intro"&&<SiovIntro content={content} onContinue={()=>go("student")}/>}
 {screen==="student"&&<SiovStudent initialStudent={student} onBack={data=>{setStudent(data);go("intro");}} onStart={start}/>}
 {screen==="test"&&<SiovTest questions={content.questions} answers={answers} setAnswers={setAnswers} onFinish={finish}/>}
 {screen==="results"&&<SiovResults results={results} content={content} student={student} onReset={reset}/>}
 </>}
 </div></main><Footer/></>;
}

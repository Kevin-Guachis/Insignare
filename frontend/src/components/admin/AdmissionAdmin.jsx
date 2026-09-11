import { useEffect, useState } from "react";
import { getAdminAdmission, saveAdmission, deleteAdmission, saveAdmissionStep, deleteAdmissionStep } from "../../services/admissions";
import AdmissionStepForm from "./AdmissionStepForm";
const blank={titulo:"Proceso de admisión",descripcion_general:"",orden:0,activo:1};
const blankStep={titulo:"",descripcion:"",fecha:"",imagen:"",boton_texto:"",boton_url:"",orden:0,activo:1};
const sorted=rows=>[...rows].sort((a,b)=>a.orden-b.orden||a.id-b.id);
export default function AdmissionAdmin({ university, onClose }) {
 const [process,setProcess]=useState(blank);
 const [steps,setSteps]=useState([]);
 const [editor,setEditor]=useState(null);
 const [confirmation,setConfirmation]=useState(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  getAdminAdmission(university.id).then(data=>{if(active){setProcess(data.admission||{...blank});setSteps(data.steps);setError("");}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[university.id,retry]);
 async function saveProcess(e){
  e.preventDefault();setBusy(true);setError("");setMessage("");
  try{setProcess(await saveAdmission({...process,university_id:university.id}));setMessage("Proceso guardado correctamente.");}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function toggle(step){
  setBusy(true);setError("");
  try{const row=await saveAdmissionStep({...step,activo:step.activo?0:1,admission_id:process.id,university_id:university.id});setSteps(current=>sorted(current.map(item=>item.id===row.id?row:item)));}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function remove(){
  setBusy(true);setError("");setMessage("");
  try{
   if(confirmation.kind==="process"){await deleteAdmission(process.id,university.id);setProcess({...blank});setSteps([]);setEditor(null);}
   else{await deleteAdmissionStep(confirmation.step.id,process.id,university.id);setSteps(current=>current.filter(row=>row.id!==confirmation.step.id));}
   setConfirmation(null);setMessage("Eliminado correctamente.");
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 if(loading)return <p role="status">Cargando admisión...</p>;
 return <section className="admin-news__card admission-admin" aria-labelledby="admission-admin-title">
  <div className="admin-news__toolbar"><div><h2 id="admission-admin-title">Proceso de admisión</h2><p>{university.nombre}</p></div><button type="button" className="admin-news-secondary" disabled={busy} onClick={onClose}>Volver a secciones</button></div>
  {error&&<p className="admin-login__error" role="alert">{error} <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Reintentar</button></p>}
  {message&&<p className="admin-news-message" role="status">{message}</p>}
  <form className="admin-news-form" onSubmit={saveProcess}><fieldset disabled={busy||!!editor}>
   <div className="admin-news-field"><label htmlFor="admission-title">Título</label><input id="admission-title" maxLength={190} required value={process.titulo} onChange={e=>setProcess({...process,titulo:e.target.value})}/></div>
   <div className="admin-news-field"><label htmlFor="admission-description">Descripción general</label><textarea id="admission-description" rows="5" maxLength={8000} value={process.descripcion_general} onChange={e=>setProcess({...process,descripcion_general:e.target.value})}/></div>
   <div className="admin-news-field"><label htmlFor="admission-order">Orden</label><input id="admission-order" type="number" min="0" max="2147483647" step="1" required value={process.orden} onChange={e=>setProcess({...process,orden:e.target.value===""?"":Number(e.target.value)})}/><small>La posición del bloque en la página se administra desde Secciones.</small></div>
   <label className="admin-news-check"><input type="checkbox" checked={process.activo===1} onChange={e=>setProcess({...process,activo:e.target.checked?1:0})}/>Activo</label>
   <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar proceso"}</button>
    {process.id&&<button type="button" className="admin-news-secondary" title="Eliminar proceso" aria-label="Eliminar proceso" onClick={()=>setConfirmation({kind:"process"})}><i className="bi bi-trash" aria-hidden="true"/></button>}
   </div>
  </fieldset></form>
  {confirmation&&<div className="admin-news-confirm" role="alert"><p>{confirmation.kind==="process"?"¿Eliminar el proceso de admisión y todas sus etapas?":"¿Eliminar la etapa “"+confirmation.step.titulo+"”?"}</p><div className="admin-news-actions"><button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirmation(null)}>Cancelar</button><button type="button" className="admin-news-primary" disabled={busy} onClick={remove}>Confirmar eliminar</button></div></div>}
  {process.id?<div className="admission-admin__steps">
   <div className="admin-news__toolbar"><h3>Etapas</h3><button type="button" className="admin-news-primary" disabled={busy||!!editor} onClick={()=>{setEditor({...blankStep});setConfirmation(null);}}>Nueva etapa</button></div>
   {editor?<AdmissionStepForm key={editor.id||"new"} step={editor} admissionId={process.id} universityId={university.id} onCancel={()=>setEditor(null)} onSaved={row=>{setSteps(current=>sorted([...current.filter(item=>item.id!==row.id),row]));setEditor(null);setMessage("Etapa guardada correctamente.");}}/>:
   <div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Imagen</th><th>Título</th><th>Fecha</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    {steps.map(step=><tr key={step.id}><td data-label="Imagen">{step.imagen?<img src={step.imagen} alt="" width="56" height="56"/>:"—"}</td><td data-label="Título">{step.titulo}</td><td data-label="Fecha">{step.fecha||"Sin fecha"}</td><td data-label="Orden">{step.orden}</td><td data-label="Estado">{step.activo?"Activo":"Inactivo"}</td><td data-label="Acciones"><div className="admin-news-actions">
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>{setEditor({...step});setConfirmation(null);}} title="Editar etapa" aria-label="Editar etapa"><i className="bi bi-pencil" aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>toggle(step)} title={step.activo?"Desactivar etapa":"Activar etapa"} aria-label={step.activo?"Desactivar etapa":"Activar etapa"}><i className={step.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirmation({kind:"step",step})} title="Eliminar etapa" aria-label="Eliminar etapa"><i className="bi bi-trash" aria-hidden="true"/></button>
    </div></td></tr>)}
    {!steps.length&&<tr><td colSpan="6">Todavía no hay etapas.</td></tr>}
   </tbody></table></div>}
  </div>:<p>Guarda el proceso para agregar etapas.</p>}
 </section>;
}

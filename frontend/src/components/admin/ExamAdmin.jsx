import { useEffect, useState } from "react";
import { getAdminExam, saveExam, deleteExam, saveExamCategory, deleteExamCategory } from "../../services/exams";
import ExamCategoryForm from "./ExamCategoryForm";
const blank={titulo:"Estructura del examen",descripcion_general:"",duracion:"",cantidad_preguntas:"",activo:1};
const blankCategory={nombre:"",descripcion:"",cantidad_preguntas:"",imagen:"",orden:0,activo:1};
const sorted=rows=>[...rows].sort((a,b)=>a.orden-b.orden||a.id-b.id);
export default function ExamAdmin({ university, onClose }) {
 const [exam,setExam]=useState(blank);
 const [categories,setCategories]=useState([]);
 const [editor,setEditor]=useState(null);
 const [confirmation,setConfirmation]=useState(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  getAdminExam(university.id).then(data=>{if(active){setExam(data.exam||{...blank});setCategories(data.categories);setError("");}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[university.id,retry]);
 async function handleSaveExam(e){
  e.preventDefault();setBusy(true);setError("");setMessage("");
  try{setExam(await saveExam({...exam,university_id:university.id}));setMessage("Examen guardado correctamente.");}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function toggle(category){
  setBusy(true);setError("");
  try{const row=await saveExamCategory({...category,activo:category.activo?0:1,exam_id:exam.id,university_id:university.id});setCategories(current=>sorted(current.map(item=>item.id===row.id?row:item)));}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function remove(){
  setBusy(true);setError("");setMessage("");
  try{
   if(confirmation.kind==="exam"){await deleteExam(exam.id,university.id);setExam({...blank});setCategories([]);setEditor(null);}
   else{await deleteExamCategory(confirmation.category.id,exam.id,university.id);setCategories(current=>current.filter(row=>row.id!==confirmation.category.id));}
   setConfirmation(null);setMessage("Eliminado correctamente.");
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 if(loading)return <p role="status">Cargando examen...</p>;
 return <section className="admin-news__card exam-admin" aria-labelledby="exam-admin-title">
  <div className="admin-news__toolbar"><div><h2 id="exam-admin-title">Estructura del examen</h2><p>{university.nombre}</p></div><button type="button" className="admin-news-secondary" disabled={busy} onClick={onClose}>Volver a secciones</button></div>
  {error&&<p className="admin-login__error" role="alert">{error} <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Reintentar</button></p>}
  {message&&<p className="admin-news-message" role="status">{message}</p>}
  <form className="admin-news-form" onSubmit={handleSaveExam}><fieldset disabled={busy||!!editor}>
   <div className="admin-news-field"><label htmlFor="exam-title">Título</label><input id="exam-title" maxLength={190} required value={exam.titulo} onChange={e=>setExam({...exam,titulo:e.target.value})}/></div>
   <div className="admin-news-field"><label htmlFor="exam-description">Descripción general</label><textarea id="exam-description" rows="5" maxLength={8000} value={exam.descripcion_general} onChange={e=>setExam({...exam,descripcion_general:e.target.value})}/></div>

   <div className="admin-news-form__grid">
    <div className="admin-news-field"><label htmlFor="exam-duration">Duración (opcional)</label><input id="exam-duration" maxLength={100} value={exam.duracion??""} placeholder="60 minutos" onChange={e=>setExam({...exam,duracion:e.target.value})}/></div>
    <div className="admin-news-field"><label htmlFor="exam-count">Cantidad de preguntas (opcional)</label><input id="exam-count" type="number" min="0" max="2147483647" step="1" value={exam.cantidad_preguntas??""} onChange={e=>setExam({...exam,cantidad_preguntas:e.target.value===""?"":Number(e.target.value)})}/></div>
   </div>
   <label className="admin-news-check"><input type="checkbox" checked={exam.activo===1} onChange={e=>setExam({...exam,activo:e.target.checked?1:0})}/>Activo</label>
   <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar examen"}</button>
    {exam.id&&<button type="button" className="admin-news-secondary" title="Eliminar examen" aria-label="Eliminar examen" onClick={()=>setConfirmation({kind:"exam"})}><i className="bi bi-trash" aria-hidden="true"/></button>}
   </div>
  </fieldset></form>
  {confirmation&&<div className="admin-news-confirm" role="alert"><p>{confirmation.kind==="exam"?"¿Eliminar el examen y todas sus categorías?":"¿Eliminar la categoría “"+confirmation.category.nombre+"”?"}</p><div className="admin-news-actions"><button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirmation(null)}>Cancelar</button><button type="button" className="admin-news-primary" disabled={busy} onClick={remove}>Confirmar eliminar</button></div></div>}
  {exam.id?<div className="exam-admin__categories">
   <div className="admin-news__toolbar"><h3>Categorías</h3><button type="button" className="admin-news-primary" disabled={busy||!!editor} onClick={()=>{setEditor({...blankCategory});setConfirmation(null);}}>Nueva categoría</button></div>
   {editor?<ExamCategoryForm key={editor.id||"new"} category={editor} examId={exam.id} universityId={university.id} onCancel={()=>setEditor(null)} onSaved={row=>{setCategories(current=>sorted([...current.filter(item=>item.id!==row.id),row]));setEditor(null);setMessage("Categoría guardada correctamente.");}}/>:
   <div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Imagen</th><th>Nombre</th><th>Preguntas</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    {categories.map(category=><tr key={category.id}><td data-label="Imagen">{category.imagen?<img src={category.imagen} alt="" width="56" height="56"/>:"—"}</td><td data-label="Nombre">{category.nombre}</td><td data-label="Preguntas">{category.cantidad_preguntas??"—"}</td><td data-label="Orden">{category.orden}</td><td data-label="Estado">{category.activo?"Activo":"Inactivo"}</td><td data-label="Acciones"><div className="admin-news-actions">
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>{setEditor({...category});setConfirmation(null);}} title="Editar categoría" aria-label="Editar categoría"><i className="bi bi-pencil" aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>toggle(category)} title={category.activo?"Desactivar categoría":"Activar categoría"} aria-label={category.activo?"Desactivar categoría":"Activar categoría"}><i className={category.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirmation({kind:"category",category})} title="Eliminar categoría" aria-label="Eliminar categoría"><i className="bi bi-trash" aria-hidden="true"/></button>
    </div></td></tr>)}
    {!categories.length&&<tr><td colSpan="6">Todavía no hay categorías.</td></tr>}
   </tbody></table></div>}
  </div>:<p>Guarda el examen para agregar categorías.</p>}
 </section>;
}

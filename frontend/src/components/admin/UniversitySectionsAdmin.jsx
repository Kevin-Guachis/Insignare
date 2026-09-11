import UniversityGalleryAdmin from "./UniversityGalleryAdmin";
import UniversityDocumentsAdmin from "./UniversityDocumentsAdmin";
import AcademicOffersAdmin from "./AcademicOffersAdmin";
import ExamAdmin from "./ExamAdmin";
import AdmissionAdmin from "./AdmissionAdmin";
import { useEffect, useState } from "react";
import { universitySectionTypes } from "../../config/universitySectionTypes";
import { listAdminUniversitySections, saveUniversitySection, deleteUniversitySection } from "../../services/universitySections";
const sorted=rows=>[...rows].sort((a,b)=>a.orden-b.orden||a.id-b.id);
export default function UniversitySectionsAdmin({ university }) {
 const [galleryOpen,setGalleryOpen]=useState(false);
 const [documentsOpen,setDocumentsOpen]=useState(false);
 const [offersOpen,setOffersOpen]=useState(false);
 const [examOpen,setExamOpen]=useState(false);
 const [admissionOpen,setAdmissionOpen]=useState(false);
 const [rows,setRows]=useState([]);
 const [form,setForm]=useState(null);
 const [confirm,setConfirm]=useState(null);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  listAdminUniversitySections(university.id).then(data=>{if(active){setRows(data);setError("");}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[university.id,retry]);
 async function save(values,editing=false) {
  setBusy(true);setError("");setMessage("");
  try {
   const row=await saveUniversitySection({...values,university_id:university.id});
   setRows(current=>sorted([...current.filter(item=>item.id!==row.id),row]));
   if(editing)setForm(null);setMessage("Sección guardada correctamente.");
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function remove(){
  setBusy(true);setError("");
  try{await deleteUniversitySection(confirm.id,university.id);setRows(current=>current.filter(row=>row.id!==confirm.id));setConfirm(null);setMessage("Sección eliminada.");}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 if(galleryOpen)return <UniversityGalleryAdmin university={university} onClose={()=>setGalleryOpen(false)}/>;
 if(documentsOpen)return <UniversityDocumentsAdmin university={university} onClose={()=>setDocumentsOpen(false)}/>;
 if(offersOpen)return <AcademicOffersAdmin university={university} onClose={()=>setOffersOpen(false)}/>;
 if(examOpen)return <ExamAdmin university={university} onClose={()=>setExamOpen(false)}/>;
 if(admissionOpen)return <AdmissionAdmin university={university} onClose={()=>setAdmissionOpen(false)}/>;
 return <section className="admin-news__card" aria-labelledby="university-sections-admin-title">
  <div className="admin-news__toolbar"><div><h2 id="university-sections-admin-title">Secciones</h2><p>Universidad: {university.nombre}</p></div>
   <button type="button" className="admin-news-primary" disabled={busy||!!form} onClick={()=>{setForm({tipo:"admission",titulo:"Proceso de admisión",orden:0,activo:1});setConfirm(null);setMessage("");}}>Nueva sección</button>
  </div>
  {error&&<p className="admin-login__error" role="alert">{error} <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Reintentar</button></p>}
  {message&&<p className="admin-news-message" role="status">{message}</p>}
  {form?<form className="admin-news-form" onSubmit={e=>{e.preventDefault();save(form,true);}}>
   <fieldset disabled={busy}>
    <div className="admin-news-field"><label htmlFor="section-type">Tipo</label><select id="section-type" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>{Object.entries(universitySectionTypes).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
    <div className="admin-news-field"><label htmlFor="section-title">Título</label><input id="section-title" required maxLength={190} value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/></div>
    <div className="admin-news-field"><label htmlFor="section-order">Orden</label><input id="section-order" type="number" min="0" max="2147483647" step="1" required value={form.orden} onChange={e=>setForm({...form,orden:e.target.value===""?"":Number(e.target.value)})}/></div>
    <label className="admin-news-check"><input type="checkbox" checked={form.activo===1} onChange={e=>setForm({...form,activo:e.target.checked?1:0})}/>Activo</label>
    <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar sección"}</button><button type="button" className="admin-news-secondary" onClick={()=>setForm(null)}>Cancelar</button></div>
   </fieldset>
  </form>:<>
   {confirm&&<div className="admin-news-confirm" role="alert"><p>¿Eliminar la sección “{confirm.titulo}”?</p><div className="admin-news-actions"><button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirm(null)}>Cancelar</button><button type="button" className="admin-news-primary" disabled={busy} onClick={remove}>Eliminar sección</button></div></div>}
   {loading?<p role="status">Cargando secciones...</p>:<div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Título</th><th>Tipo</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    {rows.map(row=><tr key={row.id}><td data-label="Título">{row.titulo}</td><td data-label="Tipo">{universitySectionTypes[row.tipo]||row.tipo}</td><td data-label="Orden">{row.orden}</td><td data-label="Estado">{row.activo?"Activo":"Inactivo"}</td><td data-label="Acciones"><div className="admin-news-actions">
     {row.tipo==="gallery"&&<button type="button" className="admin-news-secondary" disabled={busy} title="Administrar galería" aria-label="Administrar galería" onClick={()=>setGalleryOpen(true)}><i className="bi bi-images" aria-hidden="true"/></button>}
     {row.tipo==="documents"&&<button type="button" className="admin-news-secondary" disabled={busy} title="Administrar documentos" aria-label="Administrar documentos" onClick={()=>setDocumentsOpen(true)}><i className="bi bi-file-earmark-pdf" aria-hidden="true"/></button>}
     {row.tipo==="academic_offer"&&<button type="button" className="admin-news-secondary" disabled={busy} title="Administrar oferta académica" aria-label="Administrar oferta académica" onClick={()=>setOffersOpen(true)}><i className="bi bi-list-ol" aria-hidden="true"/></button>}
     {row.tipo==="exam"&&<button type="button" className="admin-news-secondary" disabled={busy} title="Administrar estructura del examen" aria-label="Administrar estructura del examen" onClick={()=>setExamOpen(true)}><i className="bi bi-list-ol" aria-hidden="true"/></button>}
     {row.tipo==="admission"&&<button type="button" className="admin-news-secondary" disabled={busy} title="Administrar proceso de admisión" aria-label="Administrar proceso de admisión" onClick={()=>setAdmissionOpen(true)}><i className="bi bi-list-ol" aria-hidden="true"/></button>}
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>{setForm({...row});setConfirm(null);}} title="Editar sección" aria-label="Editar sección"><i className="bi bi-pencil" aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>save({...row,activo:row.activo?0:1})} title={row.activo?"Desactivar sección":"Activar sección"} aria-label={row.activo?"Desactivar sección":"Activar sección"}><i className={row.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirm(row)} title="Eliminar sección" aria-label="Eliminar sección"><i className="bi bi-trash" aria-hidden="true"/></button>
    </div></td></tr>)}
    {!rows.length&&<tr><td colSpan="5">Esta universidad no tiene secciones.</td></tr>}
   </tbody></table></div>}
  </>}
 </section>;
}

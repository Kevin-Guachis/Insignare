import { useEffect, useState } from "react";
import { listAdminUniversityDocuments, saveUniversityDocument, deleteUniversityDocument } from "../../services/universityDocuments";
import UniversityDocumentForm from "./UniversityDocumentForm";
const blank={titulo:"",descripcion:"",archivo:"",documento_nombre:"",orden:0,activo:1};
const sorted=rows=>[...rows].sort((a,b)=>a.orden-b.orden||a.id-b.id);
export default function UniversityDocumentsAdmin({ university,onClose }){
 const [rows,setRows]=useState([]);
 const [editor,setEditor]=useState(null);
 const [confirmation,setConfirmation]=useState(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  listAdminUniversityDocuments(university.id).then(data=>{if(active){setRows(data);setError("");}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[university.id,retry]);
 async function toggle(row){
  setBusy(true);setError("");
  try{const updated=await saveUniversityDocument({...row,activo:row.activo?0:1,university_id:university.id});setRows(current=>sorted(current.map(item=>item.id===updated.id?updated:item)));}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function remove(){
  setBusy(true);setError("");
  try{await deleteUniversityDocument(confirmation.id,university.id);setRows(current=>current.filter(row=>row.id!==confirmation.id));setConfirmation(null);setMessage("Documento eliminado.");}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <section className="admin-news__card" aria-labelledby="university-documents-admin-title">
  <div className="admin-news__toolbar"><div><h2 id="university-documents-admin-title">Documentos</h2><p>{university.nombre}</p></div><button type="button" className="admin-news-secondary" disabled={busy} onClick={onClose}>Volver a secciones</button></div>
  {error&&<p className="admin-login__error" role="alert">{error} <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Reintentar</button></p>}
  {message&&<p className="admin-news-message" role="status">{message}</p>}
  {editor?<UniversityDocumentForm key={editor.id||"new"} document={editor} universityId={university.id} onCancel={()=>setEditor(null)} onSaved={row=>{setRows(current=>sorted([...current.filter(item=>item.id!==row.id),row]));setEditor(null);setMessage("Documento guardado correctamente.");}}/>:<>
   <div className="admin-news__toolbar"><button type="button" className="admin-news-primary" disabled={busy||loading} onClick={()=>{setEditor({...blank});setConfirmation(null);setMessage("");}}>Nuevo documento</button></div>
   {confirmation&&<div className="admin-news-confirm" role="alert"><p>¿Eliminar el documento “{confirmation.titulo}”?</p><div className="admin-news-actions"><button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirmation(null)}>Cancelar</button><button type="button" className="admin-news-primary" disabled={busy} onClick={remove}>Confirmar eliminar</button></div></div>}
   {loading?<p role="status">Cargando documentos...</p>:<div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Documento</th><th>Estado</th><th>Orden</th><th>Acciones</th></tr></thead><tbody>
    {rows.map(row=><tr key={row.id}><td data-label="Documento"><p>{row.titulo}</p><small>{row.documento_nombre}</small></td><td data-label="Estado">{row.activo?"Activo":"Inactivo"}</td><td data-label="Orden">{row.orden}</td><td data-label="Acciones"><div className="admin-news-actions">
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>{setEditor({...row});setConfirmation(null);}} title="Editar documento" aria-label="Editar documento"><i className="bi bi-pencil" aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>toggle(row)} title={row.activo?"Desactivar documento":"Activar documento"} aria-label={row.activo?"Desactivar documento":"Activar documento"}><i className={row.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirmation(row)} title="Eliminar documento" aria-label="Eliminar documento"><i className="bi bi-trash" aria-hidden="true"/></button>
    </div></td></tr>)}
    {!rows.length&&<tr><td colSpan="4">Todavía no hay documentos.</td></tr>}
   </tbody></table></div>}
  </>}
 </section>;
}

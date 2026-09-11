import { useEffect, useState } from "react";
import { listAdminUniversityGallery, saveUniversityGalleryImage, deleteUniversityGalleryImage } from "../../services/universityGallery";
import GalleryImageForm from "./GalleryImageForm";
const blank={titulo:"",descripcion:"",imagen:"",orden:0,activo:1};
const sorted=rows=>[...rows].sort((a,b)=>a.orden-b.orden||a.id-b.id);
export default function UniversityGalleryAdmin({ university,onClose }){
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
  listAdminUniversityGallery(university.id).then(data=>{if(active){setRows(data);setError("");}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[university.id,retry]);
 async function toggle(row){
  setBusy(true);setError("");
  try{const updated=await saveUniversityGalleryImage({...row,activo:row.activo?0:1,university_id:university.id});setRows(current=>sorted(current.map(item=>item.id===updated.id?updated:item)));}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function remove(){
  setBusy(true);setError("");
  try{await deleteUniversityGalleryImage(confirmation.id,university.id);setRows(current=>current.filter(row=>row.id!==confirmation.id));setConfirmation(null);setMessage("Imagen eliminada.");}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <section className="admin-news__card" aria-labelledby="university-gallery-admin-title">
  <div className="admin-news__toolbar"><div><h2 id="university-gallery-admin-title">Galería</h2><p>{university.nombre}</p></div><button type="button" className="admin-news-secondary" disabled={busy} onClick={onClose}>Volver a secciones</button></div>
  {error&&<p className="admin-login__error" role="alert">{error} <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Reintentar</button></p>}
  {message&&<p className="admin-news-message" role="status">{message}</p>}
  {editor?<GalleryImageForm key={editor.id||"new"} image={editor} universityId={university.id} onCancel={()=>setEditor(null)} onSaved={row=>{setRows(current=>sorted([...current.filter(item=>item.id!==row.id),row]));setEditor(null);setMessage("Imagen guardada correctamente.");}}/>:<>
   <div className="admin-news__toolbar"><button type="button" className="admin-news-primary" disabled={busy||loading} onClick={()=>{setEditor({...blank});setConfirmation(null);setMessage("");}}>Nueva imagen</button></div>
   {confirmation&&<div className="admin-news-confirm" role="alert"><p>¿Eliminar la imagen “{confirmation.titulo}”?</p><div className="admin-news-actions"><button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirmation(null)}>Cancelar</button><button type="button" className="admin-news-primary" disabled={busy} onClick={remove}>Confirmar eliminar</button></div></div>}
   {loading?<p role="status">Cargando imágenes...</p>:<div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Imagen</th><th>Título</th><th>Estado</th><th>Orden</th><th>Acciones</th></tr></thead><tbody>
    {rows.map(row=><tr key={row.id}><td data-label="Imagen"><img className="gallery-admin-thumbnail" src={row.imagen} alt={row.titulo||"Imagen de galería"}/></td><td data-label="Título">{row.titulo||"Sin título"}</td><td data-label="Estado">{row.activo?"Activo":"Inactivo"}</td><td data-label="Orden">{row.orden}</td><td data-label="Acciones"><div className="admin-news-actions">
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>{setEditor({...row});setConfirmation(null);}} title="Editar imagen" aria-label="Editar imagen"><i className="bi bi-pencil" aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>toggle(row)} title={row.activo?"Desactivar imagen":"Activar imagen"} aria-label={row.activo?"Desactivar imagen":"Activar imagen"}><i className={row.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirmation(row)} title="Eliminar imagen" aria-label="Eliminar imagen"><i className="bi bi-trash" aria-hidden="true"/></button>
    </div></td></tr>)}
    {!rows.length&&<tr><td colSpan="5">Todavía no hay imágenes.</td></tr>}
   </tbody></table></div>}
  </>}
 </section>;
}

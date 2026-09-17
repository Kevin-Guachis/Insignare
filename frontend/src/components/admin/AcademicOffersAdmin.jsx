import { confirmAction, showSuccess, showError } from "../../utils/alerts";
import { useEffect, useState } from "react";
import { listAdminAcademicOffers, saveAcademicOffer, deleteAcademicOffer } from "../../services/academicOffers";
import AcademicOfferForm from "./AcademicOfferForm";
const blank={titulo:"Oferta académica",descripcion:"",imagen:"",documento:"",documento_nombre:"",boton_texto:"",boton_url:"",orden:0,activo:1};
const sorted=rows=>[...rows].sort((a,b)=>a.orden-b.orden||a.id-b.id);
export default function AcademicOffersAdmin({ university,onClose }){
 const [rows,setRows]=useState([]);
 const [editor,setEditor]=useState(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  listAdminAcademicOffers(university.id).then(data=>{if(active){setRows(data);setError("");}}).catch(e=>{if(active){setError("No se pudo cargar la información.");showError(e.message);}}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[university.id,retry]);
 async function toggle(row){
  setBusy(true);setError("");
  try{const updated=await saveAcademicOffer({...row,activo:row.activo?0:1,university_id:university.id});setRows(current=>sorted(current.map(item=>item.id===updated.id?updated:item)));}
  catch(e){showError(e.message);}finally{setBusy(false);}
 }
 async function remove(target) {
  if (busy || !await confirmAction("¿Eliminar oferta?", `La oferta “${target.titulo}” se eliminará definitivamente.\n\nEsta acción no se puede deshacer.`, "Eliminar")) return;
  setBusy(true);setError("");
  try{await deleteAcademicOffer(target.id,university.id);setRows(current=>current.filter(row=>row.id!==target.id));showSuccess("Oferta eliminada.");}
  catch(e){showError(e.message);}finally{setBusy(false);}
 }
 return <section className="admin-news__card" aria-labelledby="academic-offers-admin-title">
  <div className="admin-news__toolbar"><div><h2 id="academic-offers-admin-title">Oferta académica</h2><p>{university.nombre}</p></div><button type="button" className="admin-news-secondary" disabled={busy} onClick={onClose}>Volver a secciones</button></div>
  {error&&<p className="admin-login__error" role="alert">{error} <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Reintentar</button></p>}

  {editor?<AcademicOfferForm key={editor.id||"new"} offer={editor} universityId={university.id} onCancel={()=>setEditor(null)} onSaved={row=>{setRows(current=>sorted([...current.filter(item=>item.id!==row.id),row]));setEditor(null);showSuccess("Oferta guardada correctamente.");}}/>:<>
   <div className="admin-news__toolbar"><button type="button" className="admin-news-primary" disabled={busy||loading} onClick={()=>{setEditor({...blank});}}>Nueva oferta</button></div>
   {loading?<p role="status">Cargando ofertas...</p>:<div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Título</th><th>Estado</th><th>Orden</th><th>Acciones</th></tr></thead><tbody>
    {rows.map(row=><tr key={row.id}><td data-label="Título">{row.titulo}</td><td data-label="Estado"><span className={row.activo ? "admin-status admin-status--active" : "admin-status admin-status--inactive"}>{row.activo ? "Activo" : "Inactivo"}</span></td><td data-label="Orden">{row.orden}</td><td data-label="Acciones"><div className="admin-news-actions">
     <button type="button" className="admin-news-secondary admin-icon-button" disabled={busy} onClick={()=>{setEditor({...row});}} title="Editar oferta" aria-label="Editar oferta"><i className="bi bi-pencil" aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary admin-icon-button" disabled={busy} onClick={()=>toggle(row)} title={row.activo?"Desactivar oferta":"Activar oferta"} aria-label={row.activo?"Desactivar oferta":"Activar oferta"}><i className={row.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true"/></button>
     <button type="button" className="admin-news-secondary admin-icon-button" disabled={busy} onClick={()=>remove(row)} title="Eliminar oferta" aria-label="Eliminar oferta"><i className="bi bi-trash" aria-hidden="true"/></button>
    </div></td></tr>)}
    {!rows.length&&<tr><td colSpan="4">Todavía no hay ofertas académicas.</td></tr>}
   </tbody></table></div>}
  </>}
 </section>;
}

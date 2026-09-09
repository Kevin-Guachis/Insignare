import { useEffect, useState } from "react";
import { listAdminFooterServices, saveFooterService, deleteFooterService } from "../../services/footerServices";
const empty = { nombre:"", enlace:"", orden:0, activo:1 };
const sortRows=rows=>[...rows].sort((a,b)=>a.orden-b.orden||a.id-b.id);
export default function FooterServices() {
 const [rows,setRows]=useState([]);
 const [form,setForm]=useState(null);
 const [confirm,setConfirm]=useState(null);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 useEffect(()=>{
  let active=true;
  listAdminFooterServices().then(data=>{if(active)setRows(data);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);
 async function save(values,editing=false) {
  setBusy(true);setError("");setMessage("");
  try {
   const row=await saveFooterService(values);
   setRows(current=>sortRows([...current.filter(item=>item.id!==row.id),row]));
   if(editing)setForm(null);
   setMessage("Servicio guardado correctamente.");
  } catch(e){setError(e.message);}
  finally{setBusy(false);}
 }
 async function remove() {
  setBusy(true);setError("");
  try {await deleteFooterService(confirm.id);setRows(current=>current.filter(row=>row.id!==confirm.id));setConfirm(null);setMessage("Servicio eliminado.");}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <section className="admin-news__card" aria-labelledby="footer-services-title-admin">
  <div className="admin-news__toolbar"><div><h2 id="footer-services-title-admin">Servicios del Footer</h2><p className="admin-card-description">Gestiona los servicios y enlaces que aparecen en el pie de página.</p></div><button type="button" className="admin-news-primary" disabled={busy||!!form} onClick={()=>{setForm({...empty});setConfirm(null);setMessage("");}}>Nuevo servicio</button></div>
  {error&&<p className="admin-login__error" role="alert">{error}</p>}
  {message&&<p className="admin-news-message" role="status">{message}</p>}
  {form ? <form className="admin-news-form" onSubmit={event=>{event.preventDefault();save(form,true);}}>
   <fieldset disabled={busy}>
    <div className="admin-news-field"><label htmlFor="service-name">Nombre del servicio</label><input id="service-name" value={form.nombre} required maxLength={190} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
    <div className="admin-news-field"><label htmlFor="service-link">Enlace (opcional)</label><input id="service-link" value={form.enlace||""} maxLength={500} placeholder="/pagina o https://ejemplo.com" onChange={e=>setForm({...form,enlace:e.target.value})}/></div>
    <div className="admin-news-field"><label htmlFor="service-order">Orden</label><input id="service-order" type="number" min="0" max="2147483647" step="1" required value={form.orden} onChange={e=>setForm({...form,orden:e.target.value==="" ? "" : Number(e.target.value)})}/></div>
    <label className="admin-news-check"><input type="checkbox" checked={form.activo===1} onChange={e=>setForm({...form,activo:e.target.checked?1:0})}/>Activo</label>
    <div className="admin-news-actions"><button className="admin-news-primary" type="submit">{busy?"Guardando...":"Guardar servicio"}</button><button type="button" className="admin-news-secondary" onClick={()=>setForm(null)}>Cancelar</button></div>
   </fieldset>
  </form> : <>
   {confirm&&<div className="admin-news-confirm" role="alert"><p>¿Eliminar el servicio “{confirm.nombre}”?</p><div className="admin-news-actions"><button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirm(null)}>Cancelar</button><button type="button" className="admin-news-primary" disabled={busy} onClick={remove}>Eliminar servicio</button></div></div>}
   {loading?<p role="status">Cargando servicios...</p>:<div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Nombre</th><th>Enlace</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    {rows.map(row=><tr key={row.id}><td data-label="Nombre">{row.nombre}</td><td data-label="Enlace">{row.enlace||"Sin enlace"}</td><td data-label="Orden">{row.orden}</td><td data-label="Estado">{row.activo?"Activo":"Inactivo"}</td><td data-label="Acciones"><div className="admin-news-actions">
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>{setForm({...row});setConfirm(null);}} title="Editar servicio" aria-label="Editar servicio"><i className="bi bi-pencil" aria-hidden="true" /></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>save({...row,activo:row.activo?0:1})} title={row.activo?"Desactivar servicio":"Activar servicio"} aria-label={row.activo?"Desactivar servicio":"Activar servicio"}><i className={row.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true" /></button>
     <button type="button" className="admin-news-secondary" disabled={busy} onClick={()=>setConfirm(row)} title="Eliminar servicio" aria-label="Eliminar servicio"><i className="bi bi-trash" aria-hidden="true" /></button>
    </div></td></tr>)}
    {!rows.length&&<tr><td colSpan="5">No hay servicios.</td></tr>}
   </tbody></table></div>}
  </>}
 </section>;
}

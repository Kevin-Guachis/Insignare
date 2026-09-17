import { confirmAction, showSuccess, showError } from "../../utils/alerts";
import UniversitySectionsAdmin from "./UniversitySectionsAdmin";
import UniversityForm from "./UniversityForm";
import { useEffect, useState } from "react";
import { listAdminUniversities, saveUniversity, deleteUniversity } from "../../services/universities";
const empty = { nombre:"", slug:"", logo:"", imagen_portada:"", descripcion:"", orden:0, activo:1 };
const sortRows=rows=>[...rows].sort((a,b)=>a.orden-b.orden||a.id-b.id);
export default function UniversitiesAdmin() {
 const [rows,setRows]=useState([]);
 const [form,setForm]=useState(null);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  let active=true;
  listAdminUniversities().then(data=>{if(active)setRows(data);}).catch(e=>{if(active){setError("No se pudo cargar la información.");showError(e.message);}}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);
 async function save(values,editing=false) {
  setBusy(true);setError("");
  try {
   const row=await saveUniversity(values);
   setRows(current=>sortRows([...current.filter(item=>item.id!==row.id),row]));
   if(editing)setForm(null);
   showSuccess("Universidad guardada correctamente.");
  } catch(e){showError(e.message);}
  finally{setBusy(false);}
 }
 async function remove(target) {
  if (busy || !await confirmAction("¿Eliminar universidad?", `La universidad “${target.nombre}” se eliminará definitivamente.\n\nEsta acción no se puede deshacer.`, "Eliminar")) return;
  setBusy(true);setError("");
  try {await deleteUniversity(target.id);setRows(current=>current.filter(row=>row.id!==target.id));showSuccess("Universidad eliminada.");}
  catch(e){showError(e.message);}finally{setBusy(false);}
 }
 return <section className="admin-news__card" aria-labelledby="universities-admin-title">
  <div className="admin-news__toolbar"><div><h2 id="universities-admin-title">Universidades</h2><p className="admin-card-description">Gestiona las universidades disponibles en Ingreso a la U.</p></div><button type="button" className="admin-news-primary" disabled={busy||!!form} onClick={()=>{setForm({...empty});}}>Nueva universidad</button></div>
  {error&&<p className="admin-login__error" role="alert">{error}</p>}

  {form ? <div className="university-admin-edit"><UniversityForm university={form} onCancel={()=>setForm(null)} onSaved={row=>{setRows(current=>sortRows([...current.filter(item=>item.id!==row.id),row]));setForm(null);showSuccess("Universidad guardada correctamente.");}} />{form.id ? <UniversitySectionsAdmin key={form.id} university={form}/> : <p>Guarda la universidad para poder agregar secciones.</p>}</div> : <>
   {loading?<p role="status">Cargando universidades...</p>:<div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Nombre</th><th>Slug</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    {rows.map(row=><tr key={row.id}><td data-label="Nombre">{row.nombre}</td><td data-label="Slug">{row.slug}</td><td data-label="Orden">{row.orden}</td><td data-label="Estado"><span className={row.activo ? "admin-status admin-status--active" : "admin-status admin-status--inactive"}>{row.activo ? "Activo" : "Inactivo"}</span></td><td data-label="Acciones"><div className="admin-news-actions">
     <button type="button" className="admin-news-secondary admin-icon-button" disabled={busy} onClick={()=>{setForm({...row});}} title="Editar universidad" aria-label="Editar universidad"><i className="bi bi-pencil" aria-hidden="true" /></button>
     <button type="button" className="admin-news-secondary admin-icon-button" disabled={busy} onClick={()=>save({...row,activo:row.activo?0:1})} title={row.activo?"Desactivar universidad":"Activar universidad"} aria-label={row.activo?"Desactivar universidad":"Activar universidad"}><i className={row.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true" /></button>
     <button type="button" className="admin-news-secondary admin-icon-button" disabled={busy} onClick={()=>remove(row)} title="Eliminar universidad" aria-label="Eliminar universidad"><i className="bi bi-trash" aria-hidden="true" /></button>
    </div></td></tr>)}
    {!rows.length&&<tr><td colSpan="5">No hay universidades.</td></tr>}
   </tbody></table></div>}
  </>}
 </section>;
}

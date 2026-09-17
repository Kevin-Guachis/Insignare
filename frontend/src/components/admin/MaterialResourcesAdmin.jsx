import { confirmAction, showSuccess, showError, showWarning } from "../../utils/alerts";
import { useEffect, useState } from "react";
import { listAdminUniversities } from "../../services/universities";
import { listAdminMaterialResources, saveMaterialResource, deleteMaterialResource, uploadMaterialPdf, filterMaterials } from "../../services/materialResources";
import MaterialFilters from "../material/MaterialFilters";
import "../../styles/material-filtrado.css";

export default function MaterialResourcesAdmin() {
 const [rows,setRows]=useState([]),[universities,setUniversities]=useState([]),[filters,setFilters]=useState({});
 const [editor,setEditor]=useState(null),[file,setFile]=useState(null),[busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[revision,setRevision]=useState(0);
 useEffect(()=>{
  let active=true;
  Promise.all([listAdminMaterialResources(),listAdminUniversities()]).then(([resources,items])=>{
   if(active){setRows(resources);setUniversities(items);setError("");}
  }).catch(e=>{if(active){setError("No se pudo cargar la información.");showError(e.message);}}).finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[revision]);
 function refresh(){setLoading(true);setRevision(n=>n+1);}
 function edit(row){setEditor({...row});setFile(null);}
 async function save(event){
  event.preventDefault();
  if(!editor.title.trim()||!editor.description.trim()||!editor.university_id||(!file&&!editor.file_path)){
   await showWarning("Datos incompletos","Selecciona la universidad, título, descripción y un PDF.");return;
  }
  setBusy(true);
  try{
   const uploaded=file?await uploadMaterialPdf(file):{};
   const row={...editor,...uploaded};
   // Conservar una subida correcta si la validación posterior necesita corrección.
   setEditor(row);setFile(null);
   await saveMaterialResource(row);setEditor(null);refresh();
   await showSuccess("Recurso guardado","El material se actualizó correctamente.");
  }catch(e){await showError(e.message);}finally{setBusy(false);}
 }
 async function toggle(row){
  setBusy(true);try{await saveMaterialResource({...row,visible:row.visible?0:1});refresh();}
  catch(e){await showError(e.message);}finally{setBusy(false);}
 }
 async function remove(row){
  if(!await confirmAction("¿Eliminar recurso?",`El recurso “${row.title}” se eliminará definitivamente. Esta acción no se puede deshacer.`,"Eliminar"))return;
  setBusy(true);try{await deleteMaterialResource(row.id);refresh();await showSuccess("Recurso eliminado");}catch(e){await showError(e.message);}finally{setBusy(false);}
 }
 const locked=busy||loading;
 return <section className="admin-news__card material-admin">
  <div className="admin-news__toolbar"><h2>Material Filtrado</h2><button className="admin-news-secondary" disabled={locked} onClick={refresh}>Actualizar datos</button></div>
  {error&&<p role="alert">{error}</p>}
  {editor?<form className="admin-news-form" onSubmit={save}><fieldset disabled={busy}>
   <h3>{editor.id?"Editar recurso":"Nuevo recurso"}</h3>
   <label className="material-field">Universidad *<select required value={editor.university_id} onChange={e=>setEditor({...editor,university_id:Number(e.target.value)})}><option value="">Seleccionar universidad</option>{universities.map(u=><option key={u.id} value={u.id}>{u.nombre}{u.activo?"":" (inactiva)"}</option>)}</select></label>
   <label className="material-field">Tipo *<select value={editor.type} onChange={e=>setEditor({...editor,type:e.target.value})}><option value="prueba">Prueba</option><option value="material">Material gratuito</option></select></label>
   <div className="admin-news-form__grid">{[["subject","Materia (opcional)","text",190],["year","Año *","number"],["title","Título *","text",190],["display_order","Orden","number"]].map(([key,label,type,max])=><label className="material-field" key={key}>{label}<input type={type} required={key!=="subject"} maxLength={max} min={key==="year"?1900:0} max={key==="year"?2100:2147483647} step={1} value={editor[key]} onChange={e=>setEditor({...editor,[key]:type==="number"?(e.target.value===""?"":Number(e.target.value)):e.target.value})}/></label>)}</div>
   <label className="material-field">Descripción *<textarea rows={5} required maxLength={4000} value={editor.description} onChange={e=>setEditor({...editor,description:e.target.value})}/></label>
   <label className="material-field">Archivo PDF *<input type="file" accept=".pdf,application/pdf" required={!editor.file_path} onChange={e=>{
    const selected=e.target.files?.[0];
    if(selected&&(!/\.pdf$/i.test(selected.name)||selected.size>10*1024*1024)){e.target.value="";setFile(null);showWarning("Archivo inválido","Selecciona un PDF de hasta 10 MB.");return;}
    setFile(selected||null);
   }}/><small>PDF de hasta 10 MB. {file?file.name:editor.file_name}</small></label>
   <label className="admin-news-check"><input type="checkbox" checked={editor.visible===1} onChange={e=>setEditor({...editor,visible:e.target.checked?1:0})}/>Visible</label>
   <div className="admin-news-actions"><button className="admin-news-primary">{busy?"Guardando...":"Guardar recurso"}</button><button type="button" className="admin-news-secondary" onClick={()=>setEditor(null)}>Cancelar</button></div>
  </fieldset></form>:<>
   <MaterialFilters filters={filters} onChange={setFilters} universities={universities} rows={rows}/>
   <button className="admin-news-primary" disabled={locked||!universities.length} onClick={()=>edit({university_id:"",type:"prueba",subject:"",year:new Date().getFullYear(),title:"",description:"",file_path:"",file_name:"",display_order:0,visible:1})}>Nuevo recurso</button>
   {!loading&&!universities.length&&<p>Necesitas una universidad existente para asociar el recurso.</p>}
   {loading?<p role="status">Cargando recursos...</p>:<div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Recurso</th><th>Universidad</th><th>Tipo / Año</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    {filterMaterials(rows,filters).map(row=><tr key={row.id}><td data-label="Recurso"><strong>{row.title}</strong><p>{row.subject}</p><small>Orden: {row.display_order}</small></td><td data-label="Universidad">{row.university_name}</td><td data-label="Tipo / Año">{row.type==="prueba"?"Prueba":"Material gratuito"} / {row.year}</td><td data-label="Estado"><span className={row.visible ? "admin-status admin-status--active" : "admin-status admin-status--inactive"}>{row.visible ? "Visible" : "Oculto"}</span></td><td data-label="Acciones"><div className="admin-news-actions">
     <button className="admin-news-secondary admin-icon-button" disabled={locked} title="Editar recurso" aria-label="Editar recurso" onClick={()=>edit(row)}><i className="bi bi-pencil" aria-hidden="true"/></button>
     <button className="admin-news-secondary admin-icon-button" disabled={locked} title={row.visible?"Ocultar recurso":"Mostrar recurso"} aria-label={row.visible?"Ocultar recurso":"Mostrar recurso"} onClick={()=>toggle(row)}><i className={row.visible?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true"/></button>
     <button className="admin-news-secondary admin-icon-button" disabled={locked} title="Eliminar recurso" aria-label="Eliminar recurso" onClick={()=>remove(row)}><i className="bi bi-trash" aria-hidden="true"/></button>
    </div></td></tr>)}
    {!filterMaterials(rows,filters).length&&<tr><td colSpan={5}>No hay recursos para estos filtros.</td></tr>}
   </tbody></table></div>}
  </>}
 </section>;
}

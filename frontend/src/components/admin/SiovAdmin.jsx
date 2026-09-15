import { useEffect,useState } from "react";
import { getSiovAdmin,saveSiov,deleteSiov } from "../../services/siov";
const definitions={
 areas:{label:"Áreas vocacionales",fields:{codigo:"Código",nombre:"Nombre",color:"Color",descripcion:"Descripción"}},
 questions:{label:"Preguntas",fields:{area_id:"Área",texto:"Pregunta"}},
 careers:{label:"Carreras",fields:{area_id:"Área",nombre:"Nombre",relacionada:"Mostrar en carreras relacionadas"}},
 universities:{label:"Universidades SIOV",fields:{codigo:"Código",nombre:"Nombre",url:"URL oficial",tipoPrueba:"Tipo de prueba"}},
 career_universities:{label:"Carrera ↔ Universidad",fields:{career_id:"Carrera",university_id:"Universidad",facultad:"Facultad",titulo:"Título",duracion:"Duración",modalidad:"Modalidad",campoLaboral:"Campo laboral"}},
};
const relations={area_id:"areas",career_id:"careers",university_id:"universities"};
export default function SiovAdmin(){
 const [data,setData]=useState(null),[type,setType]=useState("questions"),[editor,setEditor]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState(""),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;getSiovAdmin().then(d=>{if(active){setData(d);setError("");}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[retry]);
 async function save(row){setBusy(true);setError("");try{await saveSiov(type,row);setData(await getSiovAdmin());setEditor(null);setMessage("Contenido guardado. Los tests en curso conservan su versión inicial.");}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function remove(row){if(!window.confirm("¿Está seguro que desea eliminar este contenido del SIOV?"))return;setBusy(true);setError("");try{await deleteSiov(type,row.id);setData(await getSiovAdmin());setMessage("Contenido eliminado.");}catch(e){setError(e.message);}finally{setBusy(false);}}
 function blank(){const row={orden:0,activo:1};Object.keys(definitions[type].fields).forEach(k=>{row[k]=k==="relacionada"?1:k==="color"?"#1B4F82":relations[k]?data[relations[k]][0]?.id||"":"";});return row;}
 const completed=data?.metrics.find(m=>m.evento==="completed");
 return <section className="admin-news__card" aria-labelledby="siov-admin-title"><div className="admin-news__toolbar"><h2 id="siov-admin-title">Administración SIOV</h2><button className="admin-news-secondary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Actualizar</button></div>
 <p>Las preguntas, áreas, carreras y relaciones conservan los datos originales. Cambiar el orden de las áreas cambia el desempate; desactivar preguntas ajusta el denominador del área.</p>
 <nav className="admin-sections" aria-label="Contenido SIOV">{Object.entries(definitions).map(([key,d])=><button key={key} className={type===key?"admin-news-primary":"admin-news-secondary"} disabled={busy} onClick={()=>{setType(key);setEditor(null);setMessage("");}}>{d.label}</button>)}<button className={type==="metrics"?"admin-news-primary":"admin-news-secondary"} onClick={()=>{setType("metrics");setEditor(null);}}>Métricas</button></nav>
 {error&&<p className="admin-login__error" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
 {!data?<p role="status">Cargando contenido...</p>:type==="metrics"?<>
 <h3>Métricas agregadas</h3><p>Tiempo medio: {completed?.cantidad?(completed.minutos_totales/completed.cantidad).toFixed(1):"0"} minutos. No se guardan resultados individuales ni datos de estudiantes.</p>
 <div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Métrica</th><th>Contenido</th><th>Total</th></tr></thead><tbody>{data.metrics.map(m=><tr key={m.evento+":"+m.dimension_id}><td data-label="Métrica">{{started:"Tests iniciados",completed:"Tests completados",area:"Área predominante",career:"Carrera comparada",university:"Consulta de universidad"}[m.evento]}</td><td data-label="Contenido">{data[{area:"areas",career:"careers",university:"universities"}[m.evento]]?.find(r=>r.id===m.dimension_id)?.nombre||"General"}</td><td data-label="Total">{m.cantidad}</td></tr>)}</tbody></table></div>
 </>:editor?<form className="admin-news-form" onSubmit={e=>{e.preventDefault();save(editor);}}><fieldset disabled={busy}><h3>{editor.id?"Editar":"Nuevo"}: {definitions[type].label}</h3>
 {Object.entries(definitions[type].fields).map(([key,label])=><div className="admin-news-field" key={key}><label htmlFor={"siov-"+key}>{label}</label>
 {relations[key]?<select id={"siov-"+key} required value={editor[key]} onChange={e=>setEditor({...editor,[key]:Number(e.target.value)})}>{data[relations[key]].map(r=><option key={r.id} value={r.id}>{r.nombre}{r.activo?"":" (inactivo)"}</option>)}</select>:key==="relacionada"?<input id={"siov-"+key} type="checkbox" checked={editor[key]===1} onChange={e=>setEditor({...editor,[key]:e.target.checked?1:0})}/>:["descripcion","texto","campoLaboral"].includes(key)?<textarea id={"siov-"+key} rows={4} required={key==="texto"} maxLength={key==="texto"?4000:8000} value={editor[key]} onChange={e=>setEditor({...editor,[key]:e.target.value})}/>:<input id={"siov-"+key} type={key==="color"?"color":key==="url"?"url":"text"} required={["codigo","nombre","url"].includes(key)} maxLength={key==="url"?500:key==="codigo"?16:255} value={editor[key]} onChange={e=>setEditor({...editor,[key]:e.target.value})}/>}
 </div>)}
 <div className="admin-news-field"><label htmlFor="siov-order">Orden</label><input id="siov-order" type="number" min="0" max="2147483647" required value={editor.orden} onChange={e=>setEditor({...editor,orden:Number(e.target.value)})}/></div>
 <label className="admin-news-check"><input type="checkbox" checked={editor.activo===1} onChange={e=>setEditor({...editor,activo:e.target.checked?1:0})}/>Activo</label>
 <div className="admin-news-actions"><button className="admin-news-primary">{busy?"Guardando...":"Guardar"}</button><button type="button" className="admin-news-secondary" onClick={()=>setEditor(null)}>Cancelar</button></div>
 </fieldset></form>:<>
 <div className="admin-news__toolbar"><h3>{definitions[type].label}</h3><button className="admin-news-primary" onClick={()=>setEditor(blank())}>Nuevo</button></div>
 <div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>Contenido</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
 {data[type].map(row=><tr key={row.id}><td data-label="Contenido">{row.nombre||row.texto||(data.careers.find(c=>c.id===row.career_id)?.nombre+" — "+data.universities.find(u=>u.id===row.university_id)?.nombre)}</td><td data-label="Orden">{row.orden}</td><td data-label="Estado">{row.activo?"Activo":"Inactivo"}</td><td data-label="Acciones"><div className="admin-news-actions">
 <button className="admin-news-secondary" disabled={busy} title="Editar" aria-label="Editar" onClick={()=>setEditor({...row})}><i className="bi bi-pencil" aria-hidden="true"/></button>
 <button className="admin-news-secondary" disabled={busy} title={row.activo?"Desactivar":"Activar"} aria-label={row.activo?"Desactivar":"Activar"} onClick={()=>save({...row,activo:row.activo?0:1})}><i className={row.activo?"bi bi-eye":"bi bi-eye-slash"} aria-hidden="true"/></button>
 <button className="admin-news-secondary" disabled={busy} title="Eliminar" aria-label="Eliminar" onClick={()=>remove(row)}><i className="bi bi-trash" aria-hidden="true"/></button>
 </div></td></tr>)}
 </tbody></table></div>
 </>}
 </section>;
}

import { imageSize } from "../../services/api";
import { confirmAction, showError, showWarning, showSuccess } from "../../utils/alerts";
import { reviewError } from "../testimonials/validation";
import { useEffect, useState } from "react";
import ReviewFields, { Stars } from "../testimonials/ReviewFields";
import { listAdminTestimonials, saveTestimonial, deleteTestimonial, uploadTestimonialPhoto } from "../../services/testimonials";
import "../../styles/testimonials.css";

export default function TestimonialsAdmin() {
 const [kind, setKind] = useState("testimonials");
 const [rows, setRows] = useState([]);
 const [metrics, setMetrics] = useState(null);
 const [editor, setEditor] = useState(null);
 const [file, setFile] = useState(null);
 const [busy, setBusy] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [revision, setRevision] = useState(0);
 useEffect(() => {
  let active = true;
  listAdminTestimonials(kind).then(data => {
   if (active) { setRows(kind === "reviews" ? data.items : data); setMetrics(kind === "reviews" ? data.metrics : null); setError(""); }
  }).catch(e => { if(active){setError("No se pudo cargar la información.");showError(e.message);} })
    .finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
 }, [kind, revision]);
 function refresh() { setLoading(true); setRevision(n => n + 1); }
 function edit(row) { setEditor(kind === "testimonials" ? { ...row, titulo: row.titulo ?? "", tamano_imagen: imageSize(row.tamano_imagen) } : { ...row }); setFile(null); }
 async function persist(row) {
  await saveTestimonial(kind, row); setEditor(null); setFile(null); refresh();
 }
 async function submit(event) {
  event.preventDefault();
  const invalid = kind === "reviews" ? reviewError(editor) : (editor.titulo.length > 190 ? "Escribe un título (máximo 190 caracteres)." : "");
  if (invalid) { await showWarning("Datos incompletos", invalid); return; }
  if (kind === "testimonials" && (!Number.isInteger(editor.orden) || editor.orden < 0 || editor.orden > 2147483647)) { await showWarning("Orden inválido", "Escribe un número entero mayor o igual a cero."); return; }
  if (kind === "testimonials" && !file && !editor.imagen) { await showWarning("Fotografía pendiente", "Selecciona una fotografía para el testimonio."); return; }
  setBusy(true);
  try {
   const row = { ...editor };
   if (file) row.imagen = (await uploadTestimonialPhoto(file)).imagen;
   await persist(row); await showSuccess("Cambios guardados", "La información se actualizó correctamente.");
  } catch (e) { await showError(e.message); } finally { setBusy(false); }
 }
 async function toggle(row) {
  setBusy(true);
  try { await persist({ ...row, activo: row.activo ? 0 : 1 }); }
  catch (e) { await showError(e.message); } finally { setBusy(false); }
 }
 async function remove(row) {
  if (!await confirmAction("¿Eliminar definitivamente?", "Esta acción no se puede deshacer.", "Eliminar")) return;
  setBusy(true);
  try { await deleteTestimonial(kind, row.id); refresh(); await showSuccess("Registro eliminado"); }
  catch (e) { await showError(e.message); } finally { setBusy(false); }
 }
 function selectFile(event) {
  const selected = event.target.files?.[0];
  if (selected && (!/\.(jpe?g|png|webp)$/i.test(selected.name) || selected.size > 5 * 1024 * 1024)) {
   event.target.value = ""; setFile(null); showWarning("Imagen inválida", "Usa JPG, PNG o WEBP de hasta 5 MB."); return;
  }
  setFile(selected || null);
 }
 const locked = busy || loading;
 return <section className="admin-news__card testimonials-admin">
  <div className="admin-news__toolbar"><h2>Testimonios y opiniones</h2><button className="admin-news-secondary" disabled={locked} onClick={refresh}>Actualizar datos</button></div>
  <nav className="admin-news-actions" aria-label="Administración de testimonios">{[["testimonials","Galería de testimonios"],["reviews","Opiniones de alumnos"]].map(([id,label]) => <button key={id} className={kind === id ? "admin-news-primary" : "admin-news-secondary"} aria-pressed={kind === id} disabled={busy} onClick={() => { setKind(id); setEditor(null); setFile(null); setRows([]); setMetrics(null); setLoading(true); setRevision(n => n + 1); }}>{label}</button>)}</nav>
  {error && <p role="alert">{error}</p>}
  {metrics && <section aria-label="Resumen de opiniones"><p>Indicadores de todas las opiniones, incluidas las ocultas.</p><dl className="testimonial-metrics">
   {[["Promedio",metrics.promedio + " / 5"],["Total",metrics.total],["Visibles",metrics.visibles],["Ocultas",metrics.ocultas]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl><div className="testimonial-distribution">{[5,4,3,2,1].map(n => <div key={n}><span>{n} ★</span><meter aria-label={"Opiniones con " + n + " estrellas"} min={0} max={Math.max(1,metrics.total)} value={metrics.estrellas[n] || 0} /><strong>{metrics.estrellas[n] || 0}</strong></div>)}</div></section>}
  {editor ? <form className="admin-news-form" onSubmit={submit}><fieldset disabled={busy}>
   <h3>{editor.id ? "Editar" : "Nueva fotografía"}</h3>{kind === "reviews" && <ReviewFields values={editor} onChange={setEditor} prefix="admin-testimonial" />}
   {kind === "testimonials" && <>

    <div className="testimonial-field"><label htmlFor="testimonial-photo">Fotografía *</label><input id="testimonial-photo" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={selectFile} /><small>JPG, PNG o WEBP. Máximo 5 MB.</small>{file ? <p>Fotografía seleccionada: {file.name}</p> : editor.imagen && <img className="testimonial-preview" src={editor.imagen} alt="Fotografía actual" />}</div>
    <div className="testimonial-field"><label htmlFor="testimonial-title">Título (opcional)</label><input id="testimonial-title" maxLength={190} value={editor.titulo} onChange={e => setEditor({ ...editor, titulo: e.target.value })} /></div>
    <div className="testimonial-field"><label htmlFor="testimonial-size">Tamaño de imagen</label><input id="testimonial-size" type="range" min="25" max="100" step="1" value={editor.tamano_imagen} aria-valuetext={`${editor.tamano_imagen}%`} onChange={e=>setEditor({...editor,tamano_imagen:imageSize(e.target.value)})}/><output htmlFor="testimonial-size">{editor.tamano_imagen}%</output></div>
    <div className="testimonial-field"><label htmlFor="testimonial-order">Orden</label><input id="testimonial-order" type="number" min="0" max="2147483647" value={editor.orden} onChange={e => setEditor({ ...editor, orden: e.target.value === "" ? "" : Number(e.target.value) })} /></div>
   </>}
   <label className="admin-news-check"><input type="checkbox" checked={editor.activo === 1} onChange={e => setEditor({ ...editor, activo: e.target.checked ? 1 : 0 })} />Visible</label>
   <div className="admin-news-actions"><button className="admin-news-primary" disabled={busy}>{busy ? "Guardando..." : "Guardar"}</button><button className="admin-news-secondary" type="button" onClick={() => setEditor(null)}>Cancelar</button></div>
  </fieldset></form> : <>
   {kind === "testimonials" && <button className="admin-news-primary testimonials-new" disabled={locked} onClick={() => edit({ titulo: "", imagen: "", orden: 0, activo: 1 })}>Nueva fotografía</button>}
   {loading ? <p role="status">Cargando...</p> : <div className="admin-news-table-wrapper"><table className="admin-news-table"><thead><tr><th>{kind === "reviews" ? "Calificación" : "Foto"}</th><th>{kind === "reviews" ? "Nombre y comentario" : "Título y orden"}</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    {rows.map(row => <tr key={row.id}><td data-label={kind === "reviews" ? "Calificación" : "Foto"}>{kind === "reviews" ? <Stars value={row.calificacion} /> : <img src={row.imagen} alt="" width="56" height="56" />}</td><td data-label={kind === "reviews" ? "Nombre y comentario" : "Título y orden"}><strong>{kind === "reviews" ? row.nombre : row.titulo}</strong>{kind === "reviews" && <p className="testimonial-admin-comment">{row.comentario}</p>}{kind === "testimonials" && <small>Orden: {row.orden}</small>}</td><td data-label="Estado"><span className={row.activo ? "admin-status admin-status--active" : "admin-status admin-status--inactive"}>{row.activo ? "Visible" : "Oculto"}</span></td><td data-label="Acciones"><div className="admin-news-actions">
     <button className="admin-news-secondary admin-icon-button" disabled={locked} title="Editar" aria-label="Editar" onClick={() => edit(row)}><i className="bi bi-pencil" aria-hidden="true" /></button>
     <button className="admin-news-secondary admin-icon-button" disabled={locked} title={row.activo ? "Ocultar" : "Activar"} aria-label={row.activo ? "Ocultar" : "Activar"} onClick={() => toggle(row)}><i className={row.activo ? "bi bi-eye" : "bi bi-eye-slash"} aria-hidden="true" /></button>
     <button className="admin-news-secondary admin-icon-button" disabled={locked} title="Eliminar" aria-label="Eliminar" onClick={() => remove(row)}><i className="bi bi-trash" aria-hidden="true" /></button>
    </div></td></tr>)}
    {!rows.length && <tr><td colSpan="4">Todavía no hay registros.</td></tr>}
   </tbody></table></div>}
  </>}
 </section>;
}

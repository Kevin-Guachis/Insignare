import { useState } from "react";
import { useAcademicCatalog } from "../../hooks/useAcademicCatalog";
import { saveAcademicCatalogEntry, deleteAcademicCatalogEntry } from "../../services/leveling";
import { confirmAction, showError, showSuccess } from "../../utils/alerts";

const levels = {
 faculty: { plural: "Facultades", singular: "facultad", parent: "university_id", next: "Carreras" },
 career: { plural: "Carreras", singular: "carrera", parent: "faculty_id", next: "Materias" },
 subject: { plural: "Materias", singular: "materia", parent: "career_id" },
};

export default function AcademicCatalogAdmin({ university, onClose }) {
 const { rows: faculties, loading, error, reload } = useAcademicCatalog(university.id, true);
 const [facultyId, setFacultyId] = useState(null);
 const [careerId, setCareerId] = useState(null);
 const [editor, setEditor] = useState(null);
 const [busy, setBusy] = useState(false);
 const faculty = faculties.find(row => row.id === facultyId);
 const career = faculty?.careers.find(row => row.id === careerId);
 const type = career ? "subject" : faculty ? "career" : "faculty";
 const level = levels[type];
 const rows = career ? career.subjects : faculty ? faculty.careers : faculties;
 const parentId = career?.id ?? faculty?.id ?? university.id;

 async function save(row) {
  if (busy) return;
  setBusy(true);
  try {
   await saveAcademicCatalogEntry({
    type, id: row.id, university_id: university.id, [level.parent]: parentId,
    nombre: row.nombre, orden: row.orden, activo: row.activo,
   });
   setEditor(null);
   reload();
   showSuccess("Registro guardado correctamente.");
  } catch (error) { showError(error.message); }
  finally { setBusy(false); }
 }

 async function remove(row) {
  if (busy || !await confirmAction(`¿Eliminar ${level.singular}?`,
   `Se eliminará “${row.nombre}”${type !== "subject" ? " y todos sus registros dependientes" : ""}. Esta acción no se puede deshacer.`, "Eliminar")) return;
  setBusy(true);
  try {
   await deleteAcademicCatalogEntry(type, row.id, university.id);
   reload();
   showSuccess("Registro eliminado.");
  } catch (error) { showError(error.message); }
  finally { setBusy(false); }
 }

 return <section className="admin-news__card" aria-labelledby="leveling-admin-title">
  <div className="admin-news__toolbar">
   <div><h2 id="leveling-admin-title">Nivelación universitaria</h2><p>{university.nombre}</p></div>
   <button type="button" className="admin-news-secondary admin-icon-button" disabled={busy || !!editor} title="Volver a secciones" aria-label="Volver a secciones" onClick={onClose}><i className="bi bi-arrow-left" aria-hidden="true" /></button>
  </div>
  <nav className="admin-news-actions" aria-label="Jerarquía de nivelación universitaria">
   {faculty && <button type="button" className="admin-news-secondary admin-icon-button" disabled={busy || !!editor} title={career ? "Volver a carreras" : "Volver a facultades"} aria-label={career ? "Volver a carreras" : "Volver a facultades"} onClick={() => { if (career) setCareerId(null); else setFacultyId(null); }}><i className="bi bi-arrow-left" aria-hidden="true" /></button>}
   <span>Facultades{faculty && ` / ${faculty.nombre}`}{career && ` / ${career.nombre}`}</span>
  </nav>
  <div className="admin-news__toolbar">
   <h3 id="catalog-admin-title">{level.plural}</h3>
   <button type="button" className="admin-news-primary admin-icon-button" disabled={busy || loading || !!error || !!editor} title={`Nueva ${level.singular}`} aria-label={`Nueva ${level.singular}`} onClick={() => setEditor({ nombre: "", orden: 0, activo: 1 })}><i className="bi bi-plus-lg" aria-hidden="true" /></button>
  </div>
  <p className="admin-card-description">El orden menor aparece primero. Desactivar una facultad o carrera también oculta su contenido en la vista pública.</p>
  {error && <p role="alert" className="admin-login__error">{error} <button className="admin-news-secondary admin-icon-button" type="button" title="Reintentar" aria-label="Reintentar" onClick={reload}><i className="bi bi-arrow-clockwise" aria-hidden="true" /></button></p>}
  {editor ? <form className="admin-news-form" onSubmit={event => { event.preventDefault(); save(editor); }}>
   <fieldset disabled={busy || !!error}>
    <legend>{editor.id ? "Editar" : "Nueva"} {level.singular}</legend>
    <div className="admin-news-field"><label htmlFor="catalog-name">Nombre</label><input id="catalog-name" required maxLength={190} value={editor.nombre} onChange={event => setEditor({ ...editor, nombre: event.target.value })} /></div>
    <div className="admin-news-field"><label htmlFor="catalog-order">Orden</label><input id="catalog-order" type="number" required min="0" max="2147483647" step="1" value={editor.orden} onChange={event => setEditor({ ...editor, orden: event.target.value === "" ? "" : Number(event.target.value) })} /></div>
    <label className="admin-news-check"><input type="checkbox" checked={editor.activo === 1} onChange={event => setEditor({ ...editor, activo: event.target.checked ? 1 : 0 })} />Activo</label>
    <div className="admin-news-actions"><button className="admin-news-primary admin-icon-button" type="submit" title={busy ? "Guardando..." : "Guardar"} aria-label={busy ? "Guardando..." : "Guardar"}><i className="bi bi-check-lg" aria-hidden="true" /></button><button className="admin-news-secondary admin-icon-button" type="button" title="Cancelar" aria-label="Cancelar" onClick={() => setEditor(null)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
   </fieldset>
  </form> : loading ? <p role="status">Cargando nivelación universitaria...</p> : !error && <div className="admin-news-table-wrapper">
   <table className="admin-news-table">
    <thead><tr><th>Nombre</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.id}>
     <td data-label="Nombre">{row.nombre}</td><td data-label="Orden">{row.orden}</td>
     <td data-label="Estado"><span className={`admin-status admin-status--${row.activo ? "active" : "inactive"}`}>{row.activo ? "Activo" : "Inactivo"}</span></td>
     <td data-label="Acciones"><div className="admin-news-actions">
      {level.next && <button className="admin-news-secondary admin-icon-button" type="button" disabled={busy} title={`Administrar ${level.next.toLowerCase()}`} aria-label={`Administrar ${level.next.toLowerCase()}`} onClick={() => { if (type === "faculty") { setFacultyId(row.id); setCareerId(null); } else setCareerId(row.id); }}><i className="bi bi-list-ol" aria-hidden="true" /></button>}
      <button className="admin-news-secondary admin-icon-button" type="button" disabled={busy} title={`Editar ${level.singular}`} aria-label={`Editar ${level.singular}`} onClick={() => setEditor({ ...row })}><i className="bi bi-pencil" aria-hidden="true" /></button>
      <button className="admin-news-secondary admin-icon-button" type="button" disabled={busy} title={`${row.activo ? "Desactivar" : "Activar"} ${level.singular}`} aria-label={`${row.activo ? "Desactivar" : "Activar"} ${level.singular}`} onClick={() => save({ ...row, activo: row.activo ? 0 : 1 })}><i className={row.activo ? "bi bi-eye" : "bi bi-eye-slash"} aria-hidden="true" /></button>
      <button className="admin-news-secondary admin-icon-button" type="button" disabled={busy} title={`Eliminar ${level.singular}`} aria-label={`Eliminar ${level.singular}`} onClick={() => remove(row)}><i className="bi bi-trash" aria-hidden="true" /></button>
     </div></td>
    </tr>)}{!rows.length && <tr><td colSpan="4">No hay {level.plural.toLowerCase()}. Agrega el primer registro.</td></tr>}</tbody>
   </table>
  </div>}
 </section>;
}

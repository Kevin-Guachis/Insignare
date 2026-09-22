import { useId, useState } from "react";
import { filterAcademicCatalog } from "../../utils/academicCatalog";

function CatalogAccordion({ title, heading: Heading, open, onToggle, children }) {
 const id = useId();
 return <section className="academic-catalog__accordion">
  <Heading><button className="academic-catalog__toggle" type="button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
   <span>{title}</span><span aria-hidden="true">{open ? "−" : "+"}</span>
  </button></Heading>
  <div id={id} hidden={!open} className="academic-catalog__content">{children}</div>
 </section>;
}

export default function AcademicCatalog({ faculties }) {
 const [query, setQuery] = useState("");
 const [expanded, setExpanded] = useState({});
 const searchId = useId();
 const visible = filterAcademicCatalog(faculties, query);
 const isOpen = key => expanded[key] ?? Boolean(query.trim());
 const toggle = key => setExpanded(current => ({ ...current, [key]: !isOpen(key) }));
 function expandAll(open) {
  setExpanded(Object.fromEntries(faculties.flatMap(faculty => [
   [`faculty-${faculty.id}`, open], ...faculty.careers.map(career => [`career-${career.id}`, open]),
  ])));
 }
 return <div className="academic-catalog">
  <div className="academic-catalog__tools">
   <label htmlFor={searchId}>Buscar carrera o materia</label>
   <input id={searchId} type="search" placeholder="Ej. Medicina, Química" value={query} onChange={event => { setQuery(event.target.value); setExpanded({}); }} />
   <div className="academic-offer__actions">
    <button className="university-button" type="button" onClick={() => expandAll(true)}>Expandir todo</button>
    <button className="university-button" type="button" onClick={() => expandAll(false)}>Colapsar todo</button>
   </div>
   <p role="status">{visible.length} facultades · {visible.reduce((count, faculty) => count + faculty.careers.length, 0)} carreras</p>
  </div>
  {!faculties.length ? <p>Esta universidad todavía no ha publicado información de nivelación.</p> : !visible.length ? <p>No se encontraron carreras ni materias con ese criterio.</p> : visible.map(faculty =>
   <CatalogAccordion key={faculty.id} heading="h3" title={faculty.nombre} open={isOpen(`faculty-${faculty.id}`)} onToggle={() => toggle(`faculty-${faculty.id}`)}>
    {!faculty.careers.length && <p>No hay carreras publicadas en esta facultad.</p>}
    {faculty.careers.map(career => <CatalogAccordion key={career.id} heading="h4" title={career.nombre} open={isOpen(`career-${career.id}`)} onToggle={() => toggle(`career-${career.id}`)}>
     {career.subjects.length ? <ul className="academic-catalog__subjects">{career.subjects.map(subject => <li key={subject.id}>{subject.nombre}</li>)}</ul> : <p>No hay materias publicadas para esta carrera.</p>}
    </CatalogAccordion>)}
   </CatalogAccordion>
  )}
 </div>;
}

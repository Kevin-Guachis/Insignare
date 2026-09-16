import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MaterialFilters from "../components/material/MaterialFilters";
import PreparationModal from "../components/material/PreparationModal";
import { listMaterialResources, filterMaterials, materialFileUrl } from "../services/materialResources";
import { listUniversities } from "../services/universities";
import "../styles/material-filtrado.css";

export default function MaterialFiltrado() {
 const [rows,setRows] = useState([]),[universities,setUniversities] = useState([]);
 const [filters,setFilters] = useState({}),[loading,setLoading] = useState(true),[error,setError] = useState("");
 const [retry,setRetry] = useState(0),[modal,setModal] = useState(false);
 useEffect(() => {
  let active = true;
  Promise.all([listMaterialResources(),listUniversities()]).then(([resources,items]) => {
   if(active){setRows(resources);setUniversities(items);setError("");}
  }).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[retry]);
 const filtered = filterMaterials(rows,filters);
 return <><Header/><main className="material-page"><div className="container">
  <header className="material-heading"><h1>Material Filtrado</h1><p>Pruebas y material gratuito para tu preparación académica.</p></header>
  <MaterialFilters filters={filters} onChange={setFilters} universities={universities} rows={rows} detailed/>
  {loading ? <p role="status">Cargando recursos...</p> : error ? <div role="alert"><p>{error}</p><button className="material-button" onClick={()=>{setLoading(true);setRetry(n=>n+1);}}>Reintentar</button></div> :
   filtered.length ? <div className="material-grid">{filtered.map(row => <article className="material-card" key={row.id}>
    <p className="material-university">{row.university_name}</p><div className="material-tags"><span>{row.type==="prueba"?"Prueba":"Material gratuito"}</span>{row.subject&&<span>{row.subject}</span>}<span>{row.year}</span></div>
    <h2>{row.title}</h2><p className="material-description">{row.description}</p>
    <div className="material-actions"><a className="material-button" href={materialFileUrl(row.id)} target="_blank" rel="noopener noreferrer">Ver PDF</a><a className="material-button material-button--secondary" href={materialFileUrl(row.id,true)} download={row.file_name}>Descargar</a></div>
   </article>)}</div> : <p role="status">No hay recursos para los filtros seleccionados. Prueba con otra universidad, tipo, materia o año.</p>}
  <section className="material-cta"><h2>¿Quieres prepararte para tu prueba de admisión?</h2><p>Prepárate con nuestros simuladores y fortalece tus conocimientos antes de presentar tu examen de admisión.</p><button className="material-button" onClick={()=>setModal(true)}>Quiero prepararme</button></section>
 </div></main><Footer/>{modal&&<PreparationModal onClose={()=>setModal(false)}/>}</>;
}

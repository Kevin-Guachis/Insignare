import UniversitySectionRenderer from "./UniversitySectionRenderer";
import { useUniversitySections } from "../../hooks/useUniversitySections";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import NotFound from "../../pages/NotFound";
import { useUniversities } from "../../hooks/useUniversities";
import "../../styles/universities.css";
export default function UniversityPage() {
 const {slug}=useParams();
 const {universities,loading,error,reload}=useUniversities();
 const university=universities.find(row=>row.slug===slug);
 const sectionState=useUniversitySections(university?.id);
 useEffect(()=>{window.scrollTo(0,0);},[slug]);
 if(!loading&&!error&&!university)return <NotFound/>;
 return <><Header/><main className="universities-page"><div className="container">
  <Link className="university-back" to="/ingreso-a-la-u">Volver a universidades</Link>
  {loading?<p role="status">Cargando universidad...</p>:error?<p role="alert">{error} <button type="button" className="university-button" onClick={reload}>Reintentar</button></p>:
  <article className="university-detail">
   {university.imagen_portada&&<img className="university-cover" src={university.imagen_portada} alt={university.nombre}/>}
   <div className="university-detail__body">
    {university.logo&&<img className="university-logo" src={university.logo} alt=""/>}
    <h1>{university.nombre}</h1><p className="university-description">{university.descripcion}</p>
   </div>
  </article>}

  {university&&!loading&&!error&&(sectionState.loading?<p role="status">Cargando secciones...</p>:sectionState.error?<p role="alert">{sectionState.error} <button type="button" className="university-button" onClick={sectionState.reload}>Reintentar</button></p>:<UniversitySectionRenderer sections={sectionState.sections}/>)}
 </div></main><Footer/></>;
}

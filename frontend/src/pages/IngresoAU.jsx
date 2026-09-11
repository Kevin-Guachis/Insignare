import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import UniversityCard from "../components/university/UniversityCard";
import { useUniversities } from "../hooks/useUniversities";
import "../styles/universities.css";
export default function IngresoAU() {
 const {universities,loading,error,reload}=useUniversities();
 return <><Header/><main className="universities-page"><div className="container">
  <h1>Ingreso a la U</h1>
  {loading?<p role="status">Cargando universidades...</p>:error?<p role="alert">{error} <button className="university-button" type="button" onClick={reload}>Reintentar</button></p>:
  universities.length?<div className="universities-grid">{universities.map(row=><UniversityCard key={row.id} university={row}/>)}</div>:<p>Próximamente encontrarás aquí las universidades disponibles.</p>}
 </div></main><Footer/></>;
}

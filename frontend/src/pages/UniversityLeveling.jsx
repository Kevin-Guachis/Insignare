import { Link, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import UniversityHeading from "../components/university/UniversityHeading";
import AcademicCatalog from "../components/university/AcademicCatalog";
import { useUniversities } from "../hooks/useUniversities";
import { useAcademicCatalog } from "../hooks/useAcademicCatalog";
import NotFound from "./NotFound";
import "../styles/universities.css";

function UniversityLevelingCatalog({ universityId }) {
 const { rows, loading, error, reload } = useAcademicCatalog(universityId);
 return <section className="university-section academic-catalog-section" aria-labelledby="university-leveling-title">
  <h2 id="university-leveling-title">Nivelación universitaria</h2>
  <p>Consulta las materias de nivelación según la carrera de tu interés.</p>
  {loading ? <p role="status">Cargando nivelación universitaria...</p> : error ? <p role="alert">{error} <button type="button" className="university-button" onClick={reload}>Reintentar</button></p> : <AcademicCatalog faculties={rows} />}
 </section>;
}

export default function UniversityLeveling() {
 const { slug } = useParams();
 const { universities, loading, error, reload } = useUniversities();
 const university = universities.find(row => row.slug === slug);
 if (!loading && !error && !university) return <NotFound />;
 return <><Header /><main className="universities-page"><div className="container">
  <Link className="university-back" to={`/ingreso-a-la-u/${slug}`}>Volver a la universidad</Link>
  {loading ? <p role="status">Cargando universidad...</p> : error ? <p role="alert">{error} <button type="button" className="university-button" onClick={reload}>Reintentar</button></p> : <>
   <UniversityHeading university={university} />
   <UniversityLevelingCatalog key={university.id} universityId={university.id} />
  </>}
 </div></main><Footer /></>;
}

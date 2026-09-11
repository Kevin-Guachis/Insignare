import { Link } from "react-router-dom";
export default function UniversityCard({ university }) {
 return <article className="university-card">
  {university.logo&&<img className="university-logo" src={university.logo} alt="" />}
  <h2>{university.nombre}</h2>
  <p className="university-card__description">{university.descripcion}</p>
  <Link className="university-button" to={"/ingreso-a-la-u/"+university.slug} aria-label={"Ver información de "+university.nombre}>Ver información</Link>
 </article>;
}

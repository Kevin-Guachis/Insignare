export default function UniversityHeading({ university, children }) {
 return <article className="university-detail">
  {university.imagen_portada && <img className="university-cover" src={university.imagen_portada} alt={university.nombre} />}
  <div className="university-detail__body">
   {university.logo && <img className="university-logo" src={university.logo} alt="" />}
   <h1>{university.nombre}</h1>
   <p className="university-description">{university.descripcion}</p>
   {children}
  </div>
 </article>;
}

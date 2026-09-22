import GallerySectionContainer from "./GallerySectionContainer";
import DocumentsSectionContainer from "./DocumentsSectionContainer";
import AcademicOfferSectionContainer from "./AcademicOfferSectionContainer";
import ExamSectionContainer from "./ExamSectionContainer";
import AdmissionSectionContainer from "./AdmissionSectionContainer";
import { Link } from "react-router-dom";
const renderers={
 admission:AdmissionSectionContainer,
 exam:ExamSectionContainer,
 academic_offer:AcademicOfferSectionContainer,
 documents:DocumentsSectionContainer,
 gallery:GallerySectionContainer,
};
export default function UniversitySectionRenderer({ sections=[], university }) {
 return <div className="university-sections">
  {[...sections].filter(section=>section.activo===1).sort((a,b)=>a.orden-b.orden||a.id-b.id).map(section=>{
   if(section.tipo==="leveling")return <section key={section.id} className="university-section" aria-labelledby={`university-section-${section.id}`}>
    <h2 id={`university-section-${section.id}`}>{section.titulo}</h2>
    <p>Consulta las materias de nivelación según la carrera de tu interés.</p>
    <Link className="university-button" to={`/ingreso-a-la-u/${university.slug}/nivelacion`}>Consultar nivelación universitaria</Link>
   </section>;
   const Component=renderers[section.tipo];
   return Component?<Component key={section.id} section={section}/>:null;
  })}
 </div>;
}

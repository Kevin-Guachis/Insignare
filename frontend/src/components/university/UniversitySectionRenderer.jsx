import GallerySectionContainer from "./GallerySectionContainer";
import DocumentsSectionContainer from "./DocumentsSectionContainer";
import AcademicOfferSectionContainer from "./AcademicOfferSectionContainer";
import ExamSectionContainer from "./ExamSectionContainer";
import AdmissionSectionContainer from "./AdmissionSectionContainer";
const renderers={
 admission:AdmissionSectionContainer,
 exam:ExamSectionContainer,
 academic_offer:AcademicOfferSectionContainer,
 documents:DocumentsSectionContainer,
 gallery:GallerySectionContainer,
};
export default function UniversitySectionRenderer({ sections=[] }) {
 return <div className="university-sections">
  {[...sections].filter(section=>section.activo===1).sort((a,b)=>a.orden-b.orden||a.id-b.id).map(section=>{
   const Component=renderers[section.tipo];
   return Component?<Component key={section.id} section={section}/>:null;
  })}
 </div>;
}

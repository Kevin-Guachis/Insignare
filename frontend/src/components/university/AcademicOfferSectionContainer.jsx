import AcademicOfferSection from "./AcademicOfferSection";
import { useAcademicOffers } from "../../hooks/useAcademicOffers";
export default function AcademicOfferSectionContainer({ section }){
 const {offers,loading,error,reload}=useAcademicOffers(section.university_id);
 if(loading)return <p role="status">Cargando oferta académica...</p>;
 if(error)return <p role="alert">{error} <button type="button" className="university-button" onClick={reload}>Reintentar</button></p>;
 return <AcademicOfferSection offers={offers} section={section}/>;
}

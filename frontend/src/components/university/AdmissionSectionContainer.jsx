import AdmissionSection from "./AdmissionSection";
import { useAdmission } from "../../hooks/useAdmission";
export default function AdmissionSectionContainer({ section }) {
 const {admission,steps,loading,error,reload}=useAdmission(section.university_id);
 if(loading)return <p role="status">Cargando proceso de admisión...</p>;
 if(error)return <p role="alert">{error} <button type="button" className="university-button" onClick={reload}>Reintentar</button></p>;
 return <AdmissionSection admission={admission} steps={steps} headingId={"university-section-"+section.id}/>;
}

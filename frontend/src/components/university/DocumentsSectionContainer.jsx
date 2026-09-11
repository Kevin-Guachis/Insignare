import DocumentsSection from "./DocumentsSection";
import { useUniversityDocuments } from "../../hooks/useUniversityDocuments";
export default function DocumentsSectionContainer({ section }){
 const {documents,loading,error,reload}=useUniversityDocuments(section.university_id);
 if(loading)return <p role="status">Cargando documentos...</p>;
 if(error)return <p role="alert">{error} <button type="button" className="university-button" onClick={reload}>Reintentar</button></p>;
 return <DocumentsSection documents={documents} section={section}/>;
}

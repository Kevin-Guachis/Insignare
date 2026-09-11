import ExamSection from "./ExamSection";
import { useExam } from "../../hooks/useExam";
export default function ExamSectionContainer({ section }) {
 const {exam,categories,loading,error,reload}=useExam(section.university_id);
 if(loading)return <p role="status">Cargando estructura del examen...</p>;
 if(error)return <p role="alert">{error} <button type="button" className="university-button" onClick={reload}>Reintentar</button></p>;
 return <ExamSection exam={exam} categories={categories} headingId={"university-section-"+section.id}/>;
}

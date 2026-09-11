import GallerySection from "./GallerySection";
import { useUniversityGallery } from "../../hooks/useUniversityGallery";
export default function GallerySectionContainer({ section }){
 const {images,loading,error,reload}=useUniversityGallery(section.university_id);
 if(loading)return <p role="status">Cargando galería...</p>;
 if(error)return <p role="alert">{error} <button type="button" className="university-button" onClick={reload}>Reintentar</button></p>;
 return <GallerySection images={images} section={section}/>;
}

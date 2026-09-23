import { useState } from "react";
import { UniversityImageLightbox } from "./GallerySection";
import { imageSize } from "../../services/api";
export default function AdmissionSection({ admission, steps=[], headingId }) {
 const [selected,setSelected]=useState(null);
 if(!admission||!admission.activo)return null;
 return <section className="university-section" aria-labelledby={headingId}>
  <h2 id={headingId}>{admission.titulo}</h2>
  <p className="university-description">{admission.descripcion_general}</p>
  <div className="admission-steps">
   {[...steps].filter(step=>step.activo===1).sort((a,b)=>a.orden-b.orden||a.id-b.id).map(step=><article className="admission-step" key={step.id}>
    {step.imagen&&<button type="button" className="university-gallery__open image-size-wrapper" aria-label="Ampliar imagen" onClick={()=>setSelected({...step,alt:""})} style={{width:`${imageSize(step.tamano_imagen)}%`}}><img className="admission-step__image" src={step.imagen} alt=""/></button>}
    <div className="admission-step__body">
     <h3>{step.titulo}</h3><p className="university-description">{step.descripcion}</p>
     {step.fecha&&<time dateTime={step.fecha}>{new Intl.DateTimeFormat("es-EC",{dateStyle:"long"}).format(new Date(step.fecha+"T12:00:00"))}</time>}
     {step.boton_url&&step.boton_texto&&<a className="university-button" href={step.boton_url}>{step.boton_texto}</a>}
    </div>
   </article>)}
  </div>
  {selected&&<UniversityImageLightbox image={selected} onClose={()=>setSelected(null)}/>}
 </section>;
}

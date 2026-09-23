import { imageSize } from "../../services/api";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function UniversityImageLightbox({ image, onClose }){
 const dialog=useRef(null);
 const closeTimer=useRef(null);
 useEffect(()=>{
  const element=dialog.current;
  const previousFocus=document.activeElement;
  const overflow=document.body.style.overflow;
  element.showModal();
  document.body.style.overflow="hidden";
  const frame=requestAnimationFrame(()=>element.classList.add("is-visible"));
  return()=>{
   cancelAnimationFrame(frame);
   clearTimeout(closeTimer.current);
   closeTimer.current=null;
   element.close();
   document.body.style.overflow=overflow;
   if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  };
 },[image]);
 function close(){
  if(closeTimer.current)return;
  dialog.current.classList.remove("is-visible");
  closeTimer.current=setTimeout(()=>{closeTimer.current=null;onClose();},180);
 }
 return createPortal(<dialog ref={dialog} className="university-gallery-lightbox" aria-label="Imagen ampliada" aria-modal="true"
   onCancel={event=>{event.preventDefault();close();}}
   onClick={event=>{if(event.target===event.currentTarget)close();}}>
   <button type="button" className="university-gallery-lightbox__close" autoFocus aria-label="Cerrar imagen" onClick={close}>×</button>
   <img src={image.imagen} alt={image.alt??(image.descripcion||image.titulo||"Imagen de la universidad")}/>
  </dialog>,document.body);
}

export default function GallerySection({ images=[],section }){
 const [selected,setSelected]=useState(null);
 const visible=[...images].filter(image=>image.activo===1).sort((a,b)=>a.orden-b.orden||a.id-b.id);
 if(!visible.length)return null;
 return <section className="university-section" aria-labelledby={"university-section-"+section.id}>
  <h2 id={"university-section-"+section.id}>{section.titulo||"Galería"}</h2>
  <div className="university-gallery">
   {visible.map(image=><figure className="university-gallery__item" key={image.id}>
    <button type="button" className="university-gallery__open image-size-wrapper" onClick={()=>setSelected(image)} aria-label="Ampliar imagen" style={{width:`${imageSize(image.tamano_imagen)}%`}}>
     <img src={image.imagen} alt={image.descripcion||image.titulo||"Imagen de la universidad"} loading="lazy"/>
    </button>
    {image.titulo?.trim()&&<figcaption>{image.titulo}</figcaption>}
   </figure>)}
  </div>
  {selected&&<UniversityImageLightbox image={selected} onClose={()=>setSelected(null)}/>}
 </section>;
}

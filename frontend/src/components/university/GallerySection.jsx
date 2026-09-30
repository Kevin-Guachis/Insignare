import { imageSize } from "../../services/api";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../../styles/universities.css";

export function ContentImage({ src, alt = "Imagen de contenido", file, ...props }) {
 const [selected,setSelected]=useState(null);
 const previewRef=useRef(null);
 useEffect(()=>{
  if(!file)return;
  const url=URL.createObjectURL(file);
  previewRef.current.src=url;
  return()=>URL.revokeObjectURL(url);
 },[file]);
 if(!src&&!file)return null;
 return <><button type="button" className="content-image-open" aria-label={`Ampliar: ${alt || "imagen de contenido"}`} onClick={()=>setSelected({imagen:previewRef.current.src,alt:alt||"Imagen de contenido"})}>
  <img {...props} ref={previewRef} src={src||undefined} alt={alt||"Imagen de contenido"}/>
 </button>{selected&&<UniversityImageLightbox image={selected} onClose={()=>setSelected(null)}/>}</>;
}

export function UniversityImageLightbox({ image, onClose, onPrevious, onNext, position }){
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
 },[]);
 function close(){
  if(closeTimer.current)return;
  dialog.current.classList.remove("is-visible");
  closeTimer.current=setTimeout(()=>{closeTimer.current=null;onClose();},180);
 }
 return createPortal(<dialog ref={dialog} className="university-gallery-lightbox" aria-label="Imagen ampliada" aria-modal="true"
   onKeyDown={event=>{if(event.key==="ArrowLeft"&&onPrevious){event.preventDefault();onPrevious();}if(event.key==="ArrowRight"&&onNext){event.preventDefault();onNext();}}}
   onCancel={event=>{event.preventDefault();close();}}
   onClick={event=>{if(event.target===event.currentTarget)close();}}>
   <button type="button" className="university-gallery-lightbox__close" autoFocus aria-label="Cerrar imagen" onClick={close}>×</button>
   <img src={image.imagen} alt={image.alt??(image.descripcion||image.titulo||"Imagen de la universidad")}/>
   {position&&<div className="university-gallery-lightbox__navigation"><button type="button" disabled={!onPrevious} onClick={onPrevious} aria-label="Imagen anterior">‹</button><span aria-live="polite">{position}</span><button type="button" disabled={!onNext} onClick={onNext} aria-label="Imagen siguiente">›</button></div>}
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

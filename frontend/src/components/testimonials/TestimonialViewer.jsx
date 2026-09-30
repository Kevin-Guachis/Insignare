import { useState } from "react";
import { UniversityImageLightbox } from "../university/GallerySection";

export default function TestimonialViewer({ rows, initialIndex, onClose }) {
 const [index,setIndex]=useState(initialIndex);
 const move=delta=>setIndex(current=>(current+delta+rows.length)%rows.length);
 return <UniversityImageLightbox image={{...rows[index],alt:rows[index].titulo||"Fotografía de testimonios"}} onClose={onClose}
  position={(index+1)+" / "+rows.length} onPrevious={rows.length>1?()=>move(-1):undefined} onNext={rows.length>1?()=>move(1):undefined}/>;
}

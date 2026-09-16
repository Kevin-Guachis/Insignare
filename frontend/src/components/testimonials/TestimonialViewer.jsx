import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TestimonialViewer({ rows, initialIndex, onClose }) {
 const dialog = useRef(null);
 const [index, setIndex] = useState(initialIndex);
 const row = rows[index];
 useEffect(() => {
  const element = dialog.current;
  const previousFocus = document.activeElement;
  const overflow = document.body.style.overflow;
  element.showModal();
  document.body.style.overflow = "hidden";
  return () => {
   element.close(); document.body.style.overflow = overflow;
   if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  };
 }, []);
 function move(delta) { setIndex(current => (current + delta + rows.length) % rows.length); }
 return createPortal(<dialog ref={dialog} className="testimonial-viewer" aria-labelledby="testimonial-viewer-title"
  onCancel={event => { event.preventDefault(); onClose(); }}
  onClick={event => { if (event.target === event.currentTarget) onClose(); }}
  onKeyDown={event => {
   if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
   }
  }}>
  <div className="testimonial-viewer__panel">
   <header><h2 id="testimonial-viewer-title">{row.titulo}</h2><button type="button" autoFocus onClick={onClose} aria-label="Cerrar visor">×</button></header>
   <div className="testimonial-viewer__image"><img src={row.imagen} alt={row.titulo} /></div>
   <footer><button type="button" disabled={rows.length < 2} onClick={() => move(-1)} aria-label="Imagen anterior">‹</button><span aria-live="polite">{index + 1} / {rows.length}</span><button type="button" disabled={rows.length < 2} onClick={() => move(1)} aria-label="Imagen siguiente">›</button></footer>
  </div>
 </dialog>, document.body);
}

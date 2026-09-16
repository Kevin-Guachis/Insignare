import { useEffect, useRef, useState } from "react";
import { Stars } from "./ReviewFields";
import TestimonialViewer from "./TestimonialViewer";
const AUTOPLAY_INTERVAL = 5000;

export default function TestimonialCarousel({ rows, kind }) {
 const viewport = useRef(null);
 const [position, setPosition] = useState({ index: 0, max: 0 });
 const isPhoto = kind === "testimonials";
 const [paused, setPaused] = useState(false);
 const [hovered, setHovered] = useState(false);
 const [focused, setFocused] = useState(false);
 const [viewer, setViewer] = useState(null);
 useEffect(() => {
  if (paused || hovered || focused || viewer !== null || position.max === 0) return;
  const timer = setInterval(() => {
   if (document.hidden) return;
   const element = viewport.current;
   const next = position.index >= position.max ? 0 : position.index + 1;
   const card = element?.children[next];
   if (card) element.scrollTo({
    left: card.offsetLeft - element.firstElementChild.offsetLeft,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
   });
  }, AUTOPLAY_INTERVAL);
  return () => clearInterval(timer);
 }, [paused, hovered, focused, viewer, position.index, position.max]);
 useEffect(() => {
  const element = viewport.current;
  if (!element) return;
  function measure() {
   const card = element.firstElementChild;
   if (!card) return;
   const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap);
   const max = Math.max(0, Math.round((element.scrollWidth - element.clientWidth) / step));
   const index = Math.min(max, Math.max(0, Math.round(element.scrollLeft / step)));
   setPosition(previous => previous.index === index && previous.max === max ? previous : { index, max });
  }
  const observer = new ResizeObserver(measure);
  observer.observe(element);
  element.addEventListener("scroll", measure, { passive: true });
  const frame = requestAnimationFrame(measure);
  return () => { observer.disconnect(); element.removeEventListener("scroll", measure); cancelAnimationFrame(frame); };
 }, [rows.length]);
 function go(index) {
  const element = viewport.current;
  const card = element?.children[index];
  if (!card) return;
  const left = card.offsetLeft - element.firstElementChild.offsetLeft;
  element.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
 }
 const firstDot = Math.max(0, Math.min(position.index - 3, position.max - 6));
 const dots = Array.from({ length: Math.min(7, position.max + 1) }, (_, i) => firstDot + i);
 if (!rows.length) return null;
 return <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} className="testimonial-carousel" role="region" aria-roledescription="carrusel" aria-label={isPhoto ? "Fotografías de testimonios" : "Opiniones de alumnos"}>
  <div className="testimonial-carousel__viewport" ref={viewport} tabIndex={0} onKeyDown={event => {
   if (event.target !== event.currentTarget) return;
   if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault(); go(Math.max(0, Math.min(position.max, position.index + (event.key === "ArrowRight" ? 1 : -1))));
   }
  }}>
   {rows.map((row, index) => <article className={"testimonial-card testimonial-slide" + (isPhoto ? " testimonial-slide--photo" : "")} key={row.id} aria-label={(index + 1) + " de " + rows.length}>
    {isPhoto ? <button className="testimonial-photo-open" onClick={() => setViewer(index)} aria-label={"Ampliar: " + row.titulo}>
     <span className="testimonial-photo-frame"><img src={row.imagen} alt={row.titulo} loading="lazy" /></span>
     <span className="testimonial-photo-overlay">{row.titulo}</span>
    </button> : <div className="testimonial-body">
     <Stars value={row.calificacion} />
     <blockquote>{row.comentario}</blockquote>
     <h3>{row.nombre}</h3>
    </div>}
   </article>)}
  </div>
  <div className="testimonial-carousel__controls">
   <button className="testimonial-carousel__arrow" disabled={position.index === 0} onClick={() => go(position.index - 1)} aria-label="Anterior"><span aria-hidden="true">‹</span></button>
   <div className="testimonial-carousel__indicators" aria-label="Posición del carrusel">{dots.map(index => <button key={index} aria-label={"Ir a posición " + (index + 1)} aria-current={position.index === index ? "true" : undefined} onClick={() => go(index)}><span /></button>)}</div>
   <button className="testimonial-carousel__arrow" disabled={position.index >= position.max} onClick={() => go(position.index + 1)} aria-label="Siguiente"><span aria-hidden="true">›</span></button>
  </div>
  <button className="testimonial-autoplay" onClick={() => setPaused(value => !value)} aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"}>{paused ? "▶ Reanudar" : "⏸ Pausar"}</button>
  {viewer !== null && <TestimonialViewer rows={rows} initialIndex={viewer} onClose={() => setViewer(null)} />}
 </div>;
}

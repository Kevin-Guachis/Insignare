import TestimonialCarousel from "../components/testimonials/TestimonialCarousel";
import { reviewError } from "../components/testimonials/validation";
import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ReviewFields from "../components/testimonials/ReviewFields";
import { listTestimonials, saveTestimonial } from "../services/testimonials";
import { siovWarning as warning, siovError as showError, siovSuccess as success } from "../components/siov/alerts";
import "../styles/testimonials.css";

const empty = { nombre: "", comentario: "", calificacion: 0 };
function PublicList({ kind, revision }) {
 const [retry, setRetry] = useState(0);
 const [rows, setRows] = useState([]);
 const [page, setPage] = useState(1);
 const [hasMore, setHasMore] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 useEffect(() => {
  const controller = { active: true };
  listTestimonials(kind, page).then(data => {
   if (!controller.active) return;
   setRows(previous => page === 1 ? data.items : [...previous, ...data.items.filter(item => !previous.some(row => row.id === item.id))]);
   setHasMore(data.hasMore); setError("");
  }).catch(e => { if (controller.active) { setError(e.message); showError(e.message); } })
   .finally(() => { if (controller.active) setLoading(false); });
  return () => { controller.active = false; };
 }, [kind, page, revision, retry]);
 return <>
  {error && <div role="alert"><p>{error}</p><button className="testimonial-button" disabled={loading} onClick={() => { setLoading(true); setRetry(n => n + 1); }}>Reintentar</button></div>}
  <TestimonialCarousel rows={rows} kind={kind} />
  {loading && <p role="status">Cargando...</p>}
  {!loading && !error && !rows.length && <p>{kind === "reviews" ? "Sé el primero en compartir tu experiencia." : "Próximamente compartiremos las experiencias de nuestros estudiantes."}</p>}
  {hasMore && !error && <button className="testimonial-button" disabled={loading} onClick={() => { setLoading(true); setPage(n => n + 1); }}>Ver más</button>}
 </>;
}
export default function Testimonials() {
 const [values, setValues] = useState(empty);
 const [busy, setBusy] = useState(false);
 const [revision, setRevision] = useState(0);
 async function submit(event) {
  event.preventDefault();
  const error = reviewError(values);
  if (error) { await warning("Datos incompletos", error); return; }
  setBusy(true);
  try {
   await saveTestimonial("reviews", { nombre: values.nombre.trim(), comentario: values.comentario.trim(), calificacion: values.calificacion });
   setValues(empty); setRevision(n => n + 1);
   await success("Opinión publicada", "Gracias por compartir tu experiencia con Insignare.");
  } catch (e) { await showError(e.message); } finally { setBusy(false); }
 }
 return <><Header /><main className="testimonials-page"><div className="testimonials-container">
  <header className="testimonials-heading"><p>ALUMNOS INSIGNARE</p><h1>Testimonios de nuestros estudiantes</h1><p>Experiencias que nos inspiran a seguir enseñando.</p></header>
  <section aria-label="Testimonios con fotografías"><PublicList kind="testimonials" /></section>
  <section className="testimonials-reviews" aria-labelledby="reviews-title"><h2 id="reviews-title">Opiniones de alumnos</h2><PublicList key={revision} kind="reviews" revision={revision} /></section>
  <section className="testimonial-form-card" aria-labelledby="opinion-title"><h2 id="opinion-title">Comparte tu experiencia</h2><p>Tu nombre, calificación y comentario se publicarán inmediatamente.</p>
   <form noValidate onSubmit={submit}><fieldset disabled={busy}><ReviewFields values={values} onChange={setValues} prefix="public-review" /><button className="testimonial-button" disabled={busy}>{busy ? "Publicando..." : "Enviar opinión"}</button></fieldset></form>
  </section>
 </div></main><Footer /></>;
}

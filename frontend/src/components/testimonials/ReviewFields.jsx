export function Stars({ value }) {
 return <span className="testimonial-stars" aria-label={value + " de 5 estrellas"}>{"★".repeat(value)}{"☆".repeat(5 - value)}</span>;
}
export default function ReviewFields({ values, onChange, prefix, rating = true }) {
 const field = (key, value) => onChange({ ...values, [key]: value });
 return <>
  <div className="testimonial-field"><label htmlFor={prefix + "-nombre"}>Nombre *</label><input id={prefix + "-nombre"} required maxLength={120} value={values.nombre} onChange={e => field("nombre", e.target.value)} /></div>
  {rating && <fieldset className="testimonial-rating"><legend>Calificación *</legend><div>{[1,2,3,4,5].map(n => <label key={n}><input type="radio" name={prefix + "-rating"} required value={n} checked={values.calificacion === n} onChange={() => field("calificacion", n)} /><span aria-hidden="true" className={n <= values.calificacion ? "selected" : ""}>★</span><span className="testimonial-sr-only">{n} {n === 1 ? "estrella" : "estrellas"}</span></label>)}</div></fieldset>}
  <div className="testimonial-field"><label htmlFor={prefix + "-comentario"}>Comentario *</label><textarea id={prefix + "-comentario"} required rows={5} maxLength={2000} value={values.comentario} onChange={e => field("comentario", e.target.value)} /><small>{values.comentario.length}/2000 caracteres</small></div>
 </>;
}

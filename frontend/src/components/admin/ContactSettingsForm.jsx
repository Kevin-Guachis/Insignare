import { useEffect, useState } from "react";
import { getAdminContacto, saveContacto } from "../../services/contacto";
import { siovError, siovSuccess } from "../siov/alerts";

const fields = [
 ["direccion", "Dirección", "text", 500, true],
 ["mapa_url", "URL del mapa", "url", 2000, true],
 ["telefono1", "Teléfono 1", "tel", 40, true],
 ["telefono2", "Teléfono 2", "tel", 40, false],
 ["whatsapp1", "WhatsApp 1", "tel", 15, true],
 ["whatsapp2", "WhatsApp 2", "tel", 15, false],
 ["correo", "Correo electrónico", "email", 190, true],
 ["instagram", "Instagram", "url", 500, false],
 ["tiktok", "TikTok", "url", 500, false],
 ["facebook", "Facebook", "url", 500, false],
 ["youtube", "YouTube", "url", 500, false],
];
export default function ContactSettingsForm() {
 const [values, setValues] = useState(null);
 const [error, setError] = useState("");
 const [busy, setBusy] = useState(false);
 const [retry, setRetry] = useState(0);
 useEffect(() => {
  let active = true;
  getAdminContacto().then(data => { if(active) { setValues(data); setError(""); } })
   .catch(e => { if(active) { setError(e.message); siovError(e.message); } });
  return () => { active = false; };
 }, [retry]);
 async function submit(event) {
  event.preventDefault(); setBusy(true); setError("");
  try {
   const mapUrl = new URL(values.mapa_url.trim());
   if (mapUrl.protocol !== "https:" || !mapUrl.hostname) {
    throw new Error("Usa una URL HTTPS válida para el mapa.");
   }
   setValues(await saveContacto({ ...values, mapa_url: mapUrl.href })); await siovSuccess("Contacto actualizado", "Los cambios ya están disponibles en la página pública de Contacto."); }
  catch(e) { const message = e instanceof TypeError ? "Usa una URL HTTPS válida para el mapa." : e.message; setError(message); await siovError(message); }
  finally { setBusy(false); }
 }
 return <section className="admin-news__card" aria-labelledby="contact-settings-title">
  <div className="admin-news__toolbar"><h2 id="contact-settings-title">Contacto</h2></div>
  <p className="admin-card-description">Esta configuración actualiza la página pública /contacto. Los datos del Footer se administran por separado.</p>
  {error && <p role="alert" className="admin-login__error">{error}</p>}
  {!values ? <><p role="status">{error ? "No se pudo cargar la configuración." : "Cargando configuración..."}</p>{error && <button className="admin-news-secondary" onClick={() => setRetry(n => n + 1)}>Reintentar</button>}</> :
   <form className="admin-news-form" onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
    <div className="admin-news-form__grid">{fields.map(([name,label,type,max,required]) =>
     <div className="admin-news-field" key={name}><label htmlFor={"contact-" + name}>{label}{required ? " *" : " (opcional)"}</label>
      <input id={"contact-" + name} type={type} maxLength={max} required={required} value={values[name] || ""} onChange={e => setValues({ ...values, [name]: e.target.value })} />
      {name.startsWith("whatsapp") && <small>Código de país y número sin + ni espacios. Ejemplo: 593962759826.</small>}
      {name === "mapa_url" && <small>Google Maps: Compartir → Insertar un mapa. Copia únicamente la URL HTTPS del atributo src, sin el código iframe. También admite https://www.google.com/maps?q=latitud,longitud&amp;output=embed.</small>}
      {["instagram","facebook","tiktok","youtube"].includes(name) && <small>URL HTTPS. Déjalo vacío para ocultar el enlace.</small>}
     </div>)}</div>
    <button className="admin-news-primary" disabled={busy}>{busy ? "Guardando..." : "Guardar configuración"}</button>
   </fieldset></form>}
 </section>;
}

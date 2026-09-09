import { useEffect, useState } from "react";
import { getAdminSettings, saveSiteSettings } from "../../services/settings";
import { uploadNewsImage } from "../../services/news";
import defaultLogo from "../../assets/images/logo-insignare.png";

const fields = [
 ["descripcion","Descripción","textarea",3000],
 ["direccion","Dirección","text",500],
 ["telefono1","Teléfono 1","tel",40],
 ["telefono2","Teléfono 2","tel",40],
 ["correo","Correo","email",190],
 ["whatsapp","WhatsApp","tel",15],
];
export default function SiteSettingsForm() {
 const [values,setValues]=useState(null);
 const [file,setFile]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 useEffect(()=>{
   let active=true;
   getAdminSettings().then(data=>{if(active)setValues(data);}).catch(e=>{if(active)setError(e.message);});
   return()=>{active=false;};
 },[]);
 async function submit(event) {
   event.preventDefault();setBusy(true);setError("");setMessage("");
   try {
     const logo=file ? (await uploadNewsImage(file)).imagen : values.logo;
     setValues(current=>({...current,logo}));setFile(null);
     const saved=await saveSiteSettings({...values,logo});
     setValues(saved);setMessage("Configuración guardada correctamente.");
   } catch(e) {setError(e.message);}
   finally {setBusy(false);}
 }
 return <section className="admin-news__card" aria-labelledby="settings-title">
   <div className="admin-news__toolbar"><h2 id="settings-title">Configuración de contacto del Footer</h2></div>
   {error && <p className="admin-login__error" role="alert">{error}</p>}
   {!values ? <p role="status">{error ? "Recarga el panel para reintentar." : "Cargando configuración..."}</p> :
   <form className="admin-news-form" onSubmit={submit} aria-busy={busy}>
    <fieldset disabled={busy}>
     <div className="admin-news-field">
      <label htmlFor="site-logo">Logo</label>
      <img className="admin-news-preview" src={values.logo || defaultLogo} alt="Logo actual" />
      <input id="site-logo" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={event=>{
        const selected=event.target.files[0];
        if(!selected)return;
        if(!/\.(jpe?g|png|webp)$/i.test(selected.name)||selected.size>5*1024*1024){
          setError("Selecciona JPG, PNG o WebP de hasta 5 MB.");event.target.value="";return;
        }
        setError("");setFile(selected);
      }}/>
      <small>JPG, PNG o WebP. Máximo 5 MB. Se actualiza al guardar.</small>
     </div>
     <div className="admin-news-form__grid">
      {fields.map(([name,label,type,max])=><div className="admin-news-field" key={name}>
       <label htmlFor={"site-"+name}>{label}</label>
       {type==="textarea" ? <textarea id={"site-"+name} rows="5" maxLength={max} required value={values[name]} onChange={event=>setValues({...values,[name]:event.target.value})}/> :
       <input id={"site-"+name} type={type} maxLength={max} required={name!=="telefono2"} value={values[name]} onChange={event=>setValues({...values,[name]:event.target.value})}/>}
       {name==="whatsapp" && <small>Código de país y número, sin + ni espacios. Se guarda para su uso posterior.</small>}
      </div>)}
     </div>
     {message && <p className="admin-news-message" role="status">{message}</p>}
     <button className="admin-news-primary" type="submit">{busy ? "Guardando..." : "Guardar configuración"}</button>
    </fieldset>
   </form>}
 </section>;
}

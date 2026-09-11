import { useEffect, useRef, useState } from "react";
import { saveAdmissionStep, uploadAdmissionImage } from "../../services/admissions";
export default function AdmissionStepForm({ step, admissionId, universityId, onSaved, onCancel }) {
 const [values,setValues]=useState(()=>({...step,fecha:step.fecha||"",imagen:step.imagen||"",boton_texto:step.boton_texto||"",boton_url:step.boton_url||""}));
 const [file,setFile]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const titleRef=useRef(null);
 useEffect(()=>{titleRef.current?.focus();},[]);
 function change(e){setValues(current=>({...current,[e.target.name]:e.target.value}));}
 async function submit(e) {
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try{
   const imagen=file?(await uploadAdmissionImage(file)).imagen:values.imagen;
   setValues(current=>({...current,imagen}));setFile(null);
   onSaved(await saveAdmissionStep({...values,imagen,admission_id:admissionId,university_id:universityId}));
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <form className="admin-news-form" onSubmit={submit}><fieldset disabled={busy}>
  <h3>{step.id?"Editar etapa":"Nueva etapa"}</h3>
  <div className="admin-news-field"><label htmlFor="admission-step-image">Imagen</label>
   {values.imagen&&<img className="admin-news-preview" src={values.imagen} alt="Imagen actual"/>}
   <input id="admission-step-image" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e=>{
    const selected=e.target.files[0];if(!selected)return;
    if(!/\.(jpe?g|png|webp)$/i.test(selected.name)||selected.size>5*1024*1024){setError("Usa JPG, PNG o WebP de hasta 5 MB.");e.target.value="";return;}
    setError("");setFile(selected);
   }}/>
   <small>JPG, PNG o WebP. Máximo 5 MB.</small>
   {(file||values.imagen)&&<button className="admin-news-secondary" type="button" onClick={()=>{setFile(null);setValues({...values,imagen:""});document.getElementById("admission-step-image").value="";}}>Quitar imagen</button>}
  </div>
  <div className="admin-news-field"><label htmlFor="admission-step-title">Título</label><input ref={titleRef} id="admission-step-title" name="titulo" maxLength={190} required value={values.titulo} onChange={change}/></div>
  <div className="admin-news-field"><label htmlFor="admission-step-description">Descripción</label><textarea id="admission-step-description" name="descripcion" maxLength={8000} rows="5" value={values.descripcion} onChange={change}/></div>
  <div className="admin-news-form__grid">
   <div className="admin-news-field"><label htmlFor="admission-step-date">Fecha (opcional)</label><input id="admission-step-date" name="fecha" type="date" min="1000-01-01" max="9999-12-31" value={values.fecha} onChange={change}/></div>
   <div className="admin-news-field"><label htmlFor="admission-step-button">Texto botón</label><input id="admission-step-button" name="boton_texto" maxLength={190} value={values.boton_texto} required={!!values.boton_url} onChange={change}/></div>
   <div className="admin-news-field"><label htmlFor="admission-step-url">URL botón (opcional)</label><input id="admission-step-url" name="boton_url" maxLength={500} value={values.boton_url} placeholder="/pagina o https://ejemplo.com" onChange={change}/></div>
   <div className="admin-news-field"><label htmlFor="admission-step-order">Orden</label><input id="admission-step-order" type="number" min="0" max="2147483647" step="1" required value={values.orden} onChange={e=>setValues({...values,orden:e.target.value===""?"":Number(e.target.value)})}/></div>
  </div>
  <label className="admin-news-check"><input type="checkbox" checked={values.activo===1} onChange={e=>setValues({...values,activo:e.target.checked?1:0})}/>Activo</label>
  {error&&<p className="admin-login__error" role="alert">{error}</p>}
  <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar etapa"}</button><button type="button" className="admin-news-secondary" onClick={onCancel}>Cancelar</button></div>
 </fieldset></form>;
}

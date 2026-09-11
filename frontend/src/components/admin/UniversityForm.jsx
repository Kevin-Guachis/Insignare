import { useEffect, useRef, useState } from "react";
import { saveUniversity, uploadUniversityImage } from "../../services/universities";
export default function UniversityForm({ university, onSaved, onCancel }) {
 const [values,setValues]=useState(()=>({...university,logo:university.logo||"",imagen_portada:university.imagen_portada||""}));
 const [files,setFiles]=useState({});
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const nameRef=useRef(null);
 useEffect(()=>{nameRef.current?.focus();},[]);
 function change(e){setValues(current=>({...current,[e.target.name]:e.target.value}));}
 async function submit(e){
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try {
   const next={...values};
   for(const key of ["logo","imagen_portada"]){
    if(files[key]){
     next[key]=(await uploadUniversityImage(files[key])).imagen;
     setValues(current=>({...current,[key]:next[key]}));
     setFiles(current=>({...current,[key]:null}));
    }
   }
   onSaved(await saveUniversity(next));
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <form className="admin-news-form" onSubmit={submit}>
  <fieldset disabled={busy}>
   <div className="admin-news-field"><label htmlFor="university-name">Nombre</label><input ref={nameRef} id="university-name" name="nombre" value={values.nombre} required maxLength={190} onChange={change}/></div>
   <div className="admin-news-field"><label htmlFor="university-slug">Slug</label><input id="university-slug" name="slug" value={values.slug} required maxLength={190} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={change}/><small>Minúsculas, números y guiones. Cambiarlo modifica la URL pública.</small></div>
   <div className="admin-news-form__grid">
    {[["logo","Logo"],["imagen_portada","Imagen portada"]].map(([key,label])=><div className="admin-news-field" key={key}>
     <label htmlFor={"university-"+key}>{label}</label>
     {values[key]&&<img className="admin-news-preview" src={values[key]} alt={label+" actual"}/>}
     <input id={"university-"+key} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e=>{
      const file=e.target.files[0];if(!file)return;
      if(!/\.(jpe?g|png|webp)$/i.test(file.name)||file.size>5*1024*1024){setError("Usa JPG, PNG o WebP de hasta 5 MB.");e.target.value="";return;}
      setError("");setFiles(current=>({...current,[key]:file}));
     }}/>
     <small>JPG, PNG o WebP. Máximo 5 MB.</small>
     {(values[key]||files[key])&&<button className="admin-news-secondary" type="button" onClick={()=>{setValues(current=>({...current,[key]:""}));setFiles(current=>({...current,[key]:null}));document.getElementById("university-"+key).value="";}}>Quitar {label.toLowerCase()}</button>}
    </div>)}
   </div>
   <div className="admin-news-field"><label htmlFor="university-description">Descripción</label><textarea id="university-description" name="descripcion" value={values.descripcion} maxLength={8000} rows="5" onChange={change}/></div>
   <div className="admin-news-field"><label htmlFor="university-order">Orden</label><input id="university-order" type="number" min="0" max="2147483647" step="1" required value={values.orden} onChange={e=>setValues({...values,orden:e.target.value===""?"":Number(e.target.value)})}/></div>
   <label className="admin-news-check"><input type="checkbox" checked={values.activo===1} onChange={e=>setValues({...values,activo:e.target.checked?1:0})}/>Activo</label>
   {error&&<p className="admin-login__error" role="alert">{error}</p>}
   <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar universidad"}</button><button type="button" className="admin-news-secondary" onClick={onCancel}>Cancelar</button></div>
  </fieldset>
 </form>;
}

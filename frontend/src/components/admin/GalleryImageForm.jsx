import { imageSize } from "../../services/api";
import { showError, showWarning } from "../../utils/alerts";
import { useEffect, useRef, useState } from "react";
import { saveUniversityGalleryImage, uploadUniversityGalleryImage } from "../../services/universityGallery";
export default function GalleryImageForm({ image,universityId,onSaved,onCancel }){
 const [values,setValues]=useState({...image,titulo:image.titulo??"",tamano_imagen:imageSize(image.tamano_imagen)});
 const [file,setFile]=useState(null);
 const [busy,setBusy]=useState(false);
 const titleRef=useRef(null),fileRef=useRef(null);
 useEffect(()=>{titleRef.current?.focus();},[]);
 async function submit(e){
  e.preventDefault();if(busy)return;setBusy(true);
  try{
   if(!Number.isInteger(values.tamano_imagen)||values.tamano_imagen<25||values.tamano_imagen>100)throw new Error("Selecciona un tamaño válido.");
   const uploaded=file?await uploadUniversityGalleryImage(file):{imagen:values.imagen};
   setValues(current=>({...current,...uploaded}));setFile(null);
   onSaved(await saveUniversityGalleryImage({...values,...uploaded,university_id:universityId}));
  }catch(e){showError(e.message);}finally{setBusy(false);}
 }
 return <form className="admin-news-form" onSubmit={submit}><fieldset disabled={busy}>
  <h3>{image.id?"Editar imagen":"Nueva imagen"}</h3>
  <div className="admin-news-field"><label htmlFor="university-gallery-title">Título (opcional)</label><input ref={titleRef} id="university-gallery-title" maxLength={190} value={values.titulo} onChange={e=>setValues({...values,titulo:e.target.value})}/></div>
  <div className="admin-news-field"><label htmlFor="university-gallery-size">Tamaño de imagen</label><input id="university-gallery-size" type="range" min="25" max="100" step="1" value={values.tamano_imagen} aria-valuetext={`${values.tamano_imagen}%`} onChange={e=>setValues({...values,tamano_imagen:imageSize(e.target.value)})}/><output htmlFor="university-gallery-size">{values.tamano_imagen}%</output></div>
  <div className="admin-news-field"><label htmlFor="university-gallery-description">Descripción (opcional)</label><textarea id="university-gallery-description" rows="5" maxLength={8000} value={values.descripcion} onChange={e=>setValues({...values,descripcion:e.target.value})}/></div>
  <div className="admin-news-field"><label htmlFor="university-gallery-file">Imagen</label>
   <input ref={fileRef} id="university-gallery-file" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required={!values.imagen&&!file} onChange={e=>{
    const selected=e.target.files[0];if(!selected)return;
    if(!/\.(jpe?g|png|webp)$/i.test(selected.name)||selected.size>5*1024*1024){showWarning("Archivo inválido", "Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB.");e.target.value="";return;}
    setFile(selected);
   }}/>
   <small>JPG, PNG o WEBP. Máximo 5 MB. Selecciona otro archivo para reemplazar el actual.</small>
   {file?<p>Seleccionado: {file.name}</p>:values.imagen&&<img className="gallery-admin-preview" src={values.imagen} alt={values.titulo||"Imagen actual"}/>}
   {file&&<button type="button" className="admin-news-secondary" onClick={()=>{setFile(null);fileRef.current.value="";}}>Cancelar selección</button>}
  </div>
  <div className="admin-news-field"><label htmlFor="university-gallery-order">Orden</label><input id="university-gallery-order" type="number" min="0" max="2147483647" step="1" required value={values.orden} onChange={e=>setValues({...values,orden:e.target.value===""?"":Number(e.target.value)})}/></div>
  <label className="admin-news-check"><input type="checkbox" checked={values.activo===1} onChange={e=>setValues({...values,activo:e.target.checked?1:0})}/>Activo</label>

  <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar imagen"}</button><button type="button" className="admin-news-secondary" onClick={onCancel}>Cancelar</button></div>
 </fieldset></form>;
}

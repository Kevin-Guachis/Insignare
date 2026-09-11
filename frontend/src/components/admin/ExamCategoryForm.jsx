import { useEffect, useRef, useState } from "react";
import { saveExamCategory, uploadExamImage } from "../../services/exams";
export default function ExamCategoryForm({ category, examId, universityId, onSaved, onCancel }) {
 const [values,setValues]=useState(()=>({...category,imagen:category.imagen||"",cantidad_preguntas:category.cantidad_preguntas??""}));
 const [file,setFile]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const nameRef=useRef(null);
 const fileRef=useRef(null);
 useEffect(()=>{nameRef.current?.focus();},[]);
 function change(e){setValues(current=>({...current,[e.target.name]:e.target.value}));}
 async function submit(e) {
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try{
   const imagen=file?(await uploadExamImage(file)).imagen:values.imagen;
   setValues(current=>({...current,imagen}));setFile(null);
   onSaved(await saveExamCategory({...values,imagen,exam_id:examId,university_id:universityId}));
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <form className="admin-news-form" onSubmit={submit}><fieldset disabled={busy}>
  <h3>{category.id?"Editar categoría":"Nueva categoría"}</h3>
  <div className="admin-news-field"><label htmlFor="exam-category-image">Imagen</label>
   {values.imagen&&<img className="admin-news-preview" src={values.imagen} alt="Imagen actual"/>}
   <input ref={fileRef} id="exam-category-image" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e=>{
    const selected=e.target.files[0];if(!selected)return;
    if(!/\.(jpe?g|png|webp)$/i.test(selected.name)||selected.size>5*1024*1024){setError("Usa JPG, PNG o WebP de hasta 5 MB.");e.target.value="";return;}
    setError("");setFile(selected);
   }}/>
   <small>JPG, PNG o WebP. Máximo 5 MB.</small>
   {(file||values.imagen)&&<button className="admin-news-secondary" type="button" onClick={()=>{setFile(null);setValues({...values,imagen:""});fileRef.current.value="";}}>Quitar imagen</button>}
  </div>
  <div className="admin-news-field"><label htmlFor="exam-category-name">Nombre</label><input ref={nameRef} id="exam-category-name" name="nombre" maxLength={190} required value={values.nombre} onChange={change}/></div>
  <div className="admin-news-field"><label htmlFor="exam-category-description">Descripción</label><textarea id="exam-category-description" name="descripcion" maxLength={8000} rows="5" value={values.descripcion} onChange={change}/></div>
  <div className="admin-news-form__grid">
   <div className="admin-news-field"><label htmlFor="exam-category-count">Cantidad de preguntas (opcional)</label><input id="exam-category-count" type="number" min="0" max="2147483647" step="1" value={values.cantidad_preguntas} onChange={e=>setValues({...values,cantidad_preguntas:e.target.value===""?"":Number(e.target.value)})}/></div>
   <div className="admin-news-field"><label htmlFor="exam-category-order">Orden</label><input id="exam-category-order" type="number" min="0" max="2147483647" step="1" required value={values.orden} onChange={e=>setValues({...values,orden:e.target.value===""?"":Number(e.target.value)})}/></div>
  </div>
  <label className="admin-news-check"><input type="checkbox" checked={values.activo===1} onChange={e=>setValues({...values,activo:e.target.checked?1:0})}/>Activo</label>
  {error&&<p className="admin-login__error" role="alert">{error}</p>}
  <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar categoría"}</button><button type="button" className="admin-news-secondary" onClick={onCancel}>Cancelar</button></div>
 </fieldset></form>;
}

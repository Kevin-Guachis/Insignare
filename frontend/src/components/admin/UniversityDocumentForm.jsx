import { useEffect, useRef, useState } from "react";
import { saveUniversityDocument, uploadUniversityDocument } from "../../services/universityDocuments";
export default function UniversityDocumentForm({ document,universityId,onSaved,onCancel }){
 const [values,setValues]=useState({...document});
 const [file,setFile]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const titleRef=useRef(null),fileRef=useRef(null);
 useEffect(()=>{titleRef.current?.focus();},[]);
 async function submit(e){
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try{
   const uploaded=file?await uploadUniversityDocument(file):{archivo:values.archivo,documento_nombre:values.documento_nombre};
   setValues(current=>({...current,...uploaded}));setFile(null);
   onSaved(await saveUniversityDocument({...values,...uploaded,university_id:universityId}));
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <form className="admin-news-form" onSubmit={submit}><fieldset disabled={busy}>
  <h3>{document.id?"Editar documento":"Nuevo documento"}</h3>
  <div className="admin-news-field"><label htmlFor="university-document-title">Título</label><input ref={titleRef} id="university-document-title" required maxLength={190} value={values.titulo} onChange={e=>setValues({...values,titulo:e.target.value})}/></div>
  <div className="admin-news-field"><label htmlFor="university-document-description">Descripción (opcional)</label><textarea id="university-document-description" rows="5" maxLength={8000} value={values.descripcion} onChange={e=>setValues({...values,descripcion:e.target.value})}/></div>
  <div className="admin-news-field"><label htmlFor="university-document-file">Archivo PDF</label>
   <input ref={fileRef} id="university-document-file" type="file" accept=".pdf,application/pdf" required={!values.archivo&&!file} onChange={e=>{
    const selected=e.target.files[0];if(!selected)return;
    if(!/\.pdf$/i.test(selected.name)||selected.size>10*1024*1024){setError("Selecciona un PDF de hasta 10 MB.");e.target.value="";return;}
    setError("");setFile(selected);
   }}/>
   <small>Solo PDF. Máximo 10 MB. Selecciona otro archivo para reemplazar el actual.</small>
   {file?<p>Seleccionado: {file.name}</p>:values.archivo&&<p>Documento actual: <a href={values.archivo} target="_blank" rel="noopener noreferrer">{values.documento_nombre||"Documento PDF"}</a></p>}
   {file&&<button type="button" className="admin-news-secondary" onClick={()=>{setFile(null);fileRef.current.value="";}}>Cancelar selección</button>}
  </div>
  <div className="admin-news-field"><label htmlFor="university-document-order">Orden</label><input id="university-document-order" type="number" min="0" max="2147483647" step="1" required value={values.orden} onChange={e=>setValues({...values,orden:e.target.value===""?"":Number(e.target.value)})}/></div>
  <label className="admin-news-check"><input type="checkbox" checked={values.activo===1} onChange={e=>setValues({...values,activo:e.target.checked?1:0})}/>Activo</label>
  {error&&<p className="admin-login__error" role="alert">{error}</p>}
  <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar documento"}</button><button type="button" className="admin-news-secondary" onClick={onCancel}>Cancelar</button></div>
 </fieldset></form>;
}

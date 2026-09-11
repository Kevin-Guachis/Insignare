import { useEffect, useRef, useState } from "react";
import { saveAcademicOffer, uploadOfferImage, uploadOfferDocument } from "../../services/academicOffers";
export default function AcademicOfferForm({ offer, universityId, onSaved, onCancel }){
 const [values,setValues]=useState(()=>({...offer,imagen:offer.imagen||"",documento:offer.documento||"",documento_nombre:offer.documento_nombre||"",boton_texto:offer.boton_texto||"",boton_url:offer.boton_url||""}));
 const [image,setImage]=useState(null);
 const [document,setDocument]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const titleRef=useRef(null),imageRef=useRef(null),documentRef=useRef(null);
 useEffect(()=>{titleRef.current?.focus();},[]);
 function change(e){setValues(current=>({...current,[e.target.name]:e.target.value}));}
 async function submit(e){
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try{
   const imagen=image?(await uploadOfferImage(image)).imagen:values.imagen;
   setValues(current=>({...current,imagen}));setImage(null);
   const uploaded=document?await uploadOfferDocument(document):{documento:values.documento,documento_nombre:values.documento_nombre};
   setValues(current=>({...current,...uploaded}));setDocument(null);
   onSaved(await saveAcademicOffer({...values,imagen,...uploaded,university_id:universityId}));
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <form className="admin-news-form" onSubmit={submit}><fieldset disabled={busy}>
  <h3>{offer.id?"Editar oferta académica":"Nueva oferta académica"}</h3>
  <div className="admin-news-field"><label htmlFor="offer-title">Título</label><input ref={titleRef} id="offer-title" name="titulo" required maxLength={190} value={values.titulo} onChange={change}/></div>
  <div className="admin-news-field"><label htmlFor="offer-description">Descripción</label><textarea id="offer-description" name="descripcion" rows="5" maxLength={8000} value={values.descripcion} onChange={change}/></div>
  <div className="admin-news-form__grid">
   <div className="admin-news-field"><label htmlFor="offer-image">Imagen</label>
    {values.imagen&&<img className="admin-news-preview" src={values.imagen} alt="Imagen actual"/>}
    <input ref={imageRef} id="offer-image" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e=>{
     const file=e.target.files[0];if(!file)return;
     if(!/\.(jpe?g|png|webp)$/i.test(file.name)||file.size>5*1024*1024){setError("Usa JPG, PNG o WebP de hasta 5 MB.");e.target.value="";return;}
     setError("");setImage(file);
    }}/>
    <small>JPG, PNG o WebP. Máximo 5 MB.</small>
    {(image||values.imagen)&&<button type="button" className="admin-news-secondary" onClick={()=>{setImage(null);setValues({...values,imagen:""});imageRef.current.value="";}}>Quitar imagen</button>}
   </div>
   <div className="admin-news-field"><label htmlFor="offer-document">Documento PDF</label>
    <input ref={documentRef} id="offer-document" type="file" accept=".pdf,application/pdf" onChange={e=>{
     const file=e.target.files[0];if(!file)return;
     if(!/\.pdf$/i.test(file.name)||file.size>10*1024*1024){setError("Usa un PDF de hasta 10 MB.");e.target.value="";return;}
     setError("");setDocument(file);
    }}/>
    <small>PDF. Máximo 10 MB.</small>
    {document?<p>Seleccionado: {document.name}</p>:values.documento&&<p>Documento actual: <a href={values.documento} target="_blank" rel="noopener noreferrer">{values.documento_nombre||"Documento PDF"}</a></p>}
    {(document||values.documento)&&<button type="button" className="admin-news-secondary" onClick={()=>{setDocument(null);setValues({...values,documento:"",documento_nombre:""});documentRef.current.value="";}}>Quitar documento</button>}
   </div>
   <div className="admin-news-field"><label htmlFor="offer-button">Texto botón</label><input id="offer-button" name="boton_texto" required={!!values.boton_url} maxLength={190} value={values.boton_texto} onChange={change}/></div>
   <div className="admin-news-field"><label htmlFor="offer-url">URL botón</label><input id="offer-url" name="boton_url" placeholder="/pagina o https://ejemplo.com" maxLength={500} value={values.boton_url} onChange={change}/></div>
   <div className="admin-news-field"><label htmlFor="offer-order">Orden</label><input id="offer-order" type="number" min="0" max="2147483647" step="1" required value={values.orden} onChange={e=>setValues({...values,orden:e.target.value===""?"":Number(e.target.value)})}/></div>
  </div>
  <label className="admin-news-check"><input type="checkbox" checked={values.activo===1} onChange={e=>setValues({...values,activo:e.target.checked?1:0})}/>Activo</label>
  {error&&<p className="admin-login__error" role="alert">{error}</p>}
  <div className="admin-news-actions"><button type="submit" className="admin-news-primary">{busy?"Guardando...":"Guardar oferta"}</button><button type="button" className="admin-news-secondary" onClick={onCancel}>Cancelar</button></div>
 </fieldset></form>;
}

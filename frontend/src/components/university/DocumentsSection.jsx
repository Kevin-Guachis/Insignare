export default function DocumentsSection({ documents=[],section }){
 const visible=[...documents].filter(document=>document.activo===1).sort((a,b)=>a.orden-b.orden||a.id-b.id);
 if(!visible.length)return null;
 return <section className="university-section" aria-labelledby={"university-section-"+section.id}>
  <h2 id={"university-section-"+section.id}>Documentos importantes</h2>
  <div className="university-documents">
   {visible.map(document=><article className="university-document" key={document.id}>
    <div className="university-document__content">
     <h3><span aria-hidden="true">📄 </span>{document.titulo}</h3>
     {document.descripcion&&<p className="university-description">{document.descripcion}</p>}
     <p className="university-document__name">{document.documento_nombre||"Documento PDF"}</p>
    </div>
    <a className="university-button" href={document.archivo} target="_blank" rel="noopener noreferrer" aria-label={"Ver documento: "+document.titulo}>Ver documento</a>
   </article>)}
  </div>
 </section>;
}

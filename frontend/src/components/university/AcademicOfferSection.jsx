export default function AcademicOfferSection({ offers=[], section }) {
 if(!offers.length)return null;
 return <section className="university-section academic-offer-section" aria-labelledby={"university-section-"+section.id}>
  <h2 id={"university-section-"+section.id}>{section.titulo}</h2>
  <div className="academic-offers">
   {[...offers].filter(offer=>offer.activo===1).sort((a,b)=>a.orden-b.orden||a.id-b.id).map(offer=><article className="academic-offer" key={offer.id}>
    <h3>{offer.titulo}</h3>
    {offer.descripcion&&<p className="university-description">{offer.descripcion}</p>}
    {offer.imagen&&<img className="academic-offer__image" src={offer.imagen} alt={offer.titulo}/>}
    {offer.documento&&<p className="academic-offer__document-name">Documento: {offer.documento_nombre||"Documento PDF"}</p>}
    {(offer.documento||offer.boton_url)&&<div className="academic-offer__actions">
     {offer.documento&&<a className="university-button" href={offer.documento} target="_blank" rel="noopener noreferrer">Ver documento</a>}
     {offer.boton_url&&offer.boton_texto&&<a className="university-button" href={offer.boton_url}>{offer.boton_texto}</a>}
    </div>}
   </article>)}
  </div>
 </section>;
}

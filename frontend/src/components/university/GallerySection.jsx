export default function GallerySection({ images=[],section }){
 const visible=[...images].filter(image=>image.activo===1).sort((a,b)=>a.orden-b.orden||a.id-b.id);
 if(!visible.length)return null;
 return <section className="university-section" aria-labelledby={"university-section-"+section.id}>
  <h2 id={"university-section-"+section.id}>{section.titulo||"Galería"}</h2>
  <div className="university-gallery">
   {visible.map(image=><figure className="university-gallery__item" key={image.id}>
    <img src={image.imagen} alt={image.descripcion||image.titulo||"Imagen de la universidad"} loading="lazy"/>
    {image.titulo&&<figcaption>{image.titulo}</figcaption>}
   </figure>)}
  </div>
 </section>;
}

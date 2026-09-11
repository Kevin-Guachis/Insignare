export default function ExamSection({ exam, categories=[], headingId }) {
 if(!exam||!exam.activo)return null;
 return <section className="university-section" aria-labelledby={headingId}>
  <h2 id={headingId}>{exam.titulo}</h2>
  <p className="university-description">{exam.descripcion_general}</p>
  {(exam.duracion||exam.cantidad_preguntas!=null)&&<dl className="exam-summary">
   {exam.duracion&&<div><dt>Duración</dt><dd>{exam.duracion}</dd></div>}
   {exam.cantidad_preguntas!=null&&<div><dt>Cantidad de preguntas</dt><dd>{exam.cantidad_preguntas}</dd></div>}
  </dl>}
  <div className="exam-categories">
   {[...categories].filter(category=>category.activo===1).sort((a,b)=>a.orden-b.orden||a.id-b.id).map(category=><article className="exam-category" key={category.id}>
    {category.imagen&&<img className="exam-category__image" src={category.imagen} alt=""/>}
    <div className="exam-category__body">
     <h3>{category.nombre}</h3>
     {category.cantidad_preguntas!=null&&<p>{category.cantidad_preguntas} preguntas</p>}
     <p className="university-description">{category.descripcion}</p>
    </div>
   </article>)}
  </div>
 </section>;
}

import { useState } from "react";
const fields=[["nombres","Nombres y Apellidos","text"],["cedula","Número de Cédula","text"],["edad","Edad","number"],["celular","Celular","tel"],["correo","Correo Electrónico","email"],["institucion","Institución Educativa","text"]];
export default function SiovStudent({ onBack,onStart,initialStudent }){
 const [student,setStudent]=useState(initialStudent);
 return <section id="screen-datos" className="card-panel"><div className="step-eyebrow">Paso 1 de 3</div><h2 className="font-display mb-1">Datos del Estudiante</h2><p className="text-muted">Completa tus datos para iniciar el test vocacional.</p>
 <p className="small text-muted">Los campos con * son obligatorios. Estos datos se usan solo en memoria para tu informe. No se envían ni se guardan en el servidor.</p>
 <form id="form-datos" className="row g-3 mt-2" noValidate onSubmit={e=>{e.preventDefault();onStart(student);}}>
 {fields.map(([key,label,type])=><div className="col-md-6" key={key}><label className="form-label" htmlFor={"inp-"+key}>{label}{["nombres","edad","institucion"].includes(key)?" *":" (opcional)"}</label><input autoComplete="off" id={"inp-"+key} className="form-control" type={type} required={["nombres","edad","institucion"].includes(key)} maxLength={key==="correo"?254:190} min={type==="number"?10:undefined} max={type==="number"?99:undefined} value={student[key]||""} onChange={e=>setStudent({...student,[key]:e.target.value})}/></div>)}
 <div className="col-md-4"><label className="form-label" htmlFor="inp-estado">Estado Académico *</label><select className="form-select" id="inp-estado" required value={student.estado||""} onChange={e=>setStudent({...student,estado:e.target.value})}><option value="" disabled>Selecciona...</option><option>Último Año de Bachillerato</option><option>Graduado</option></select></div>
 <div className="col-12 mt-4 d-flex gap-2"><button type="button" className="btn btn-outline-secondary" onClick={()=>onBack(student)}>← Volver</button><button className="btn btn-brand">Iniciar Test Vocacional →</button></div>
 </form></section>;
}

export default function MaterialFilters({ filters, onChange, universities, rows, detailed = false }) {
 const fields = [
  ["university_id","Universidad",universities.map(row => [String(row.id),row.nombre])],
  ["type","Tipo de recurso",[["prueba","Prueba"],["material","Material gratuito"]]],
  ...(detailed ? [
   ["subject","Materia",[...new Set(rows.map(row => row.subject).filter(Boolean))].sort().map(value => [value,value])],
   ["year","Año",[...new Set(rows.map(row => row.year))].sort((a,b)=>b-a).map(value => [String(value),value])],
  ] : []),
 ];
 return <div className="material-filters">{fields.map(([name,label,options]) => <label key={name}>{label}<select value={filters[name] || ""} onChange={e => onChange({ ...filters,[name]:e.target.value })}><option value="">Todas las opciones</option>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>)}</div>;
}

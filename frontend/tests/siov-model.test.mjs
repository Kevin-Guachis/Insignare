import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { prepareContent,calculateResults,topCareers } from '../src/components/siov/model.js';
const html=fs.readFileSync(new URL('../public/siov/index.html',import.meta.url),'utf8');
const original=vm.runInNewContext(html.slice(html.indexOf('const PREGUNTAS'),html.indexOf('const state ='))+'\nJSON.stringify({PREGUNTAS,AREAS,UNIVERSIDADES,OFERTA_CARRERAS})');
const source=JSON.parse(original);
const seed=JSON.parse(fs.readFileSync(new URL('../../backend/database/siov_original.json',import.meta.url)));
test('La semilla conserva exactamente todo el catálogo del HTML',()=>assert.deepEqual(seed,source));
test('La API conserva preguntas, asignación, profesiones y oferta original',async()=>{
 const r=await fetch('http://localhost:8000/api/siov/content.php');assert.equal(r.status,200);
 const content=prepareContent((await r.json()).data);
 assert.deepEqual(content.questions.map(q=>q.texto),source.PREGUNTAS);
 for(const [code,area] of Object.entries(source.AREAS)){
  for(const field of ['nombre','color','descripcion','preguntas','profesiones'])assert.deepEqual(content.AREAS[code][field],area[field]);
 }
 assert.deepEqual(content.OFERTA_CARRERAS.map(c=>Object.fromEntries(Object.keys(source.OFERTA_CARRERAS[0]).map(k=>[k,c[k]]))),source.OFERTA_CARRERAS);
 for(let scenario=0;scenario<200;scenario++){
  const answers=Object.fromEntries(source.PREGUNTAS.map((_,i)=>[i+1,scenario===0?false:scenario===1?true:((i*17+scenario*13)%23)<scenario%24]));
  const expected=Object.entries(source.AREAS).map(([codigo,a])=>({codigo,puntaje:a.preguntas.filter(p=>answers[p]).length})).map(a=>({...a,porcentaje:Math.round(a.puntaje/16*100)})).sort((a,b)=>b.porcentaje-a.porcentaje);
  const result=calculateResults(content.AREAS,answers);
  assert.deepEqual(result.map(({codigo,puntaje,porcentaje})=>({codigo,puntaje,porcentaje})),expected);
  const codes=expected.slice(0,2).map(a=>a.codigo);
  const top=source.OFERTA_CARRERAS.filter(c=>codes.includes(c.area)).sort((a,b)=>expected.find(r=>r.codigo===b.area).porcentaje-expected.find(r=>r.codigo===a.area).porcentaje).slice(0,10).map(c=>c.carrera);
  assert.deepEqual(topCareers(result,content.OFERTA_CARRERAS).map(c=>c.carrera),top);
 }
});

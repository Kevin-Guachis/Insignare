<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli'){http_response_code(403);exit;}
require __DIR__.'/../config/database.php';
$db=get_database();
$db->exec(file_get_contents(__DIR__.'/../database/siov_schema.sql'));
if((int)$db->query('SELECT COUNT(*) FROM siov_areas')->fetchColumn()>0){fwrite(STDERR,"El SIOV ya contiene datos. No se sobrescribió contenido.\n");exit(1);}
$d=json_decode(file_get_contents(__DIR__.'/../database/siov_original.json'),true,512,JSON_THROW_ON_ERROR);
function insert_siov(PDO $db,string $table,array $row): int {
 $keys=array_keys($row);$q=$db->prepare('INSERT INTO '.$table.' ('.implode(',',$keys).') VALUES ('.implode(',',array_fill(0,count($keys),'?')).')');$q->execute(array_values($row));return (int)$db->lastInsertId();
}
$db->beginTransaction();
try {
 $areas=[];$careers=[];$universities=[];
 foreach($d['AREAS'] as $code=>$a){
  $id=insert_siov($db,'siov_areas',['codigo'=>$code,'nombre'=>$a['nombre'],'color'=>$a['color'],'descripcion'=>$a['descripcion'],'orden'=>count($areas)]);
  $areas[$code]=$id;
  foreach($a['profesiones'] as $order=>$name)$careers[$code.'|'.$name]=insert_siov($db,'siov_careers',['area_id'=>$id,'nombre'=>$name,'relacionada'=>1,'orden'=>$order]);
 }
 foreach($d['PREGUNTAS'] as $index=>$text){
  foreach($d['AREAS'] as $code=>$a)if(in_array($index+1,$a['preguntas'],true)){insert_siov($db,'siov_questions',['area_id'=>$areas[$code],'texto'=>$text,'orden'=>$index]);break;}
 }
 foreach($d['UNIVERSIDADES'] as $code=>$u)$universities[$code]=insert_siov($db,'siov_universities',['codigo'=>$code,...$u,'orden'=>count($universities)]);
 foreach($d['OFERTA_CARRERAS'] as $order=>$c){
  $key=$c['area'].'|'.$c['carrera'];
  if(!isset($careers[$key]))$careers[$key]=insert_siov($db,'siov_careers',['area_id'=>$areas[$c['area']],'nombre'=>$c['carrera'],'relacionada'=>0,'orden'=>$order]);
  $row=['career_id'=>$careers[$key],'university_id'=>$universities[$c['uni']]];
  foreach(['facultad','titulo','duracion','modalidad','campoLaboral'] as $key)$row[$key]=$c[$key];
  insert_siov($db,'siov_career_universities',[...$row,'orden'=>$order]);
 }
 $db->commit();echo "SIOV importado sin cambiar preguntas ni ofertas.\n";
}catch(Throwable $e){$db->rollBack();fwrite(STDERR,"No se pudo importar el SIOV. No se guardaron datos parciales.\n");exit(1);}


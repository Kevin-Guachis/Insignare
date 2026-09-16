<?php
declare(strict_types=1);
require_once __DIR__.'/universities.php';

function material_row(array $row): array {
 foreach(['id','university_id','year','display_order','visible'] as $key)$row[$key]=(int)$row[$key];
 return $row;
}
function material_find(int $id): array {
 $q=get_database()->prepare('SELECT r.*,u.nombre university_name FROM material_resources r JOIN universities u ON u.id=r.university_id WHERE r.id=:id');
 $q->execute(['id'=>$id]);$row=$q->fetch();
 if(!$row)error_response('Recurso no encontrado.',404);
 return material_row($row);
}
function material_values(array $input): array {
 $values=['university_id'=>university_id($input['university_id']??null)];
 university_find(get_database(),$values['university_id']);
 if(!in_array($input['type']??null,['prueba','material'],true))error_response('Tipo de recurso inválido.',422);
 $values['type']=$input['type'];
 foreach(['subject'=>190,'title'=>190,'description'=>4000] as $key=>$limit){
  $value=$input[$key]??'';
  if(!is_string($value)||strpos($value,"\0")!==false)error_response('Texto inválido: '.$key,422);
  $value=trim($value);$length=preg_match_all('/./us',$value);
  if($length===false||$length>$limit||($key!=='subject'&&$value===''))error_response('Completa '.$key.' (máximo '.$limit.' caracteres).',422);
  $values[$key]=$value;
 }
 foreach(['year'=>[1900,2100],'display_order'=>[0,2147483647],'visible'=>[0,1]] as $key=>[$min,$max]){
  $value=$input[$key]??null;
  if(!is_int($value)||$value<$min||$value>$max)error_response('Valor inválido: '.$key,422);
  $values[$key]=$value;
 }
 $path=$input['file_path']??'';
 if(!is_string($path)||!preg_match('~^/api/news/document\.php\?file=([a-f0-9]{32}\.pdf)$~D',$path,$match)||!is_file(__DIR__.'/../uploads/documents/'.$match[1]))error_response('Selecciona un PDF subido al sitio.',422);
 $name=$input['file_name']??'';
 if(!is_string($name)||trim($name)==='')error_response('Falta el nombre del PDF.',422);
 $values['file_path']=$path;$values['file_name']=clean_document_name($name);
 return $values;
}

<?php
declare(strict_types=1);
require_once __DIR__.'/universities.php';
function university_document_row(array $row): array {
 foreach(['id','university_id','orden','activo'] as $key)$row[$key]=(int)$row[$key];
 return $row;
}
function university_document_find(PDO $db,int $id,int $parent): array {
 $q=$db->prepare('SELECT * FROM university_documents WHERE id=:id AND university_id=:parent');
 $q->execute(['id'=>$id,'parent'=>$parent]);$row=$q->fetch();
 if(!$row)error_response('Documento no encontrado.',404);
 return university_document_row($row);
}
function university_document_values(array $input): array {
 $values=['university_id'=>university_id($input['university_id']??null)];
 foreach(['titulo'=>190,'descripcion'=>8000] as $key=>$max){
  $value=$input[$key]??'';
  if(!is_string($value)||strlen($value)>$max||strpos($value,"\0")!==false)error_response('Campo inválido: '.$key,422);
  $values[$key]=trim($value);
 }
 if($values['titulo']==='')error_response('El título es obligatorio.',422);
 $file=$input['archivo']??null;
 if(!is_string($file)||strlen($file)>255||!preg_match('~^/api/news/document\\.php\\?file=([a-f0-9]{32}\\.pdf)$~D',$file,$matches)
  ||!is_file(__DIR__.'/../uploads/documents/'.$matches[1]))error_response('Selecciona un PDF subido al sitio.',422);
 $name=$input['documento_nombre']??null;
 if(!is_string($name)||trim($name)==='')error_response('Falta el nombre visible del documento.',422);
 $values['archivo']=$file;$values['documento_nombre']=clean_document_name($name);
 $order=$input['orden']??0;$active=$input['activo']??1;
 if(!is_int($order)||$order<0||$order>2147483647||!in_array($active,[0,1],true))error_response('Orden o estado inválido.',422);
 $values['orden']=$order;$values['activo']=$active;
 return $values;
}

<?php
declare(strict_types=1);
require_once __DIR__.'/universities.php';
function university_gallery_image_row(array $row): array {
 foreach(['id','university_id','orden','activo'] as $key)$row[$key]=(int)$row[$key];
 return $row;
}
function university_gallery_image_find(PDO $db,int $id,int $parent): array {
 $q=$db->prepare('SELECT * FROM university_gallery WHERE id=:id AND university_id=:parent');
 $q->execute(['id'=>$id,'parent'=>$parent]);$row=$q->fetch();
 if(!$row)error_response('Imagen no encontrada.',404);
 return university_gallery_image_row($row);
}
function university_gallery_image_values(array $input): array {
 $values=['university_id'=>university_id($input['university_id']??null)];
 foreach(['titulo'=>190,'descripcion'=>8000] as $key=>$max){
  $value=$input[$key]??'';
  if(!is_string($value)||strlen($value)>$max||strpos($value,"\0")!==false)error_response('Campo inválido: '.$key,422);
  $values[$key]=trim($value);
 }
 $image=$input['imagen']??null;
 if(!is_string($image)||strlen($image)>255||!($filename=news_image_filename($image))
  ||!is_file(__DIR__.'/../uploads/images/'.$filename))error_response('Selecciona una imagen subida al sitio.',422);
 $values['imagen']=$image;
 $order=$input['orden']??0;$active=$input['activo']??1;
 if(!is_int($order)||$order<0||$order>2147483647||!in_array($active,[0,1],true))error_response('Orden o estado inválido.',422);
 $values['orden']=$order;$values['activo']=$active;
 return $values;
}

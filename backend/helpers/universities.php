<?php
declare(strict_types=1);
require_once __DIR__.'/news.php';
function university_id($value): int { return news_id($value); }
function university_values(array $input): array {
 $values=[];
 foreach (['nombre'=>190,'slug'=>190,'descripcion'=>8000] as $key=>$max) {
  $value=$input[$key]??'';
  if (!is_string($value)||strlen($value)>$max||strpos($value,"\0")!==false) error_response('Campo inválido: '.$key,422);
  $values[$key]=trim($value);
 }
 if ($values['nombre']===''||!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D',$values['slug'])) error_response('Nombre obligatorio. Usa un slug con minúsculas, números y guiones.',422);
 foreach (['logo','imagen_portada'] as $key) {
  $image=$input[$key]??null;
  if ($image==='') $image=null;
  if ($image!==null) {
   if (!is_string($image)||strlen($image)>255) error_response('Imagen inválida.',422);
   $filename=news_image_filename($image);
   if (!$filename||!is_file(__DIR__.'/../uploads/images/'.$filename)) error_response('Selecciona una imagen subida al sitio.',422);
  }
  $values[$key]=$image;
 }
 $order=filter_var($input['orden']??0,FILTER_VALIDATE_INT,['options'=>['min_range'=>0,'max_range'=>2147483647]]);
 $active=$input['activo']??1;
 if ($order===false||!in_array($active,[0,1],true)) error_response('Orden o estado inválido.',422);
 $values['orden']=$order;$values['activo']=$active;
 return $values;
}
function university_row(array $row): array {
 foreach (['id','orden','activo'] as $key) $row[$key]=(int)$row[$key];
 return $row;
}
function university_find(PDO $db,int $id): array {
 $q=$db->prepare('SELECT * FROM universities WHERE id=:id');$q->execute(['id'=>$id]);
 $row=$q->fetch();if (!$row) error_response('Universidad no encontrada.',404);
 return university_row($row);
}
function university_execute(PDOStatement $query,array $values): void {
 try {$query->execute($values);} catch (PDOException $e) {
  if (($e->errorInfo[1]??null)===1062) error_response('Ya existe una universidad con ese slug.',422);
  throw $e;
 }
}

<?php
declare(strict_types=1);
require_once __DIR__.'/news.php';

function testimonial_text(array $input, string $key, int $max, bool $required = true): string {
 $value=$input[$key]??'';
 if(!is_string($value)||preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u',$value)) error_response('Texto inválido: '.$key,422);
 $value=trim($value);
 $length=preg_match_all('/./us',$value);
 if($length===false||$length>$max||($required&&$value==='')) error_response('Completa '.$key.' (máximo '.$max.' caracteres).',422);
 return $value;
}
function testimonial_values(array $input, bool $review, bool $public = false): array {
 $values=$review ? ['nombre'=>testimonial_text($input,'nombre',120),'comentario'=>testimonial_text($input,'comentario',2000)] : ['titulo'=>testimonial_text($input,'titulo',190,false)];
 // Los visitantes no pueden enviar estados de moderación ni ocultar su envío.
 $active=$public?1:($input['activo']??1);
 if(!in_array($active,[0,1],true)) error_response('Estado inválido.',422);
 $values['activo']=$active;
 if($review){
  $rating=$input['calificacion']??null;
  if(!is_int($rating)||$rating<1||$rating>5) error_response('Selecciona una calificación entre 1 y 5 estrellas.',422);
  $values['calificacion']=$rating;
 }else{

  $image=$input['imagen']??'';
  if(!is_string($image)||!($file=news_image_filename($image))||!is_file(__DIR__.'/../uploads/images/'.$file)) error_response('Selecciona una fotografía subida al sitio.',422);
  $values['imagen']=$image;
 $values['tamano_imagen']=image_size($input['tamano_imagen']??null);
  $order=$input['orden']??0;
  if(!is_int($order)||$order<0||$order>2147483647) error_response('Orden inválido.',422);
  $values['orden']=$order;
 }
 return $values;
}
function testimonial_row(array $row): array {
 unset($row["comentario_legacy"], $row["detalle_legacy"]);
 foreach(['id','activo','orden','calificacion'] as $key) if(isset($row[$key]))$row[$key]=(int)$row[$key];
 if(array_key_exists('imagen',$row))$row['tamano_imagen']=image_size($row['tamano_imagen']??null);
 return $row;
}
function testimonial_find(PDO $db,string $table,int $id): array {
 $q=$db->prepare("SELECT * FROM $table WHERE id=:id");$q->execute(['id'=>$id]);$row=$q->fetch();
 if(!$row)error_response('Registro no encontrado.',404);
 return testimonial_row($row);
}
// Las tablas y columnas proceden exclusivamente de constantes internas, nunca del cliente.
function testimonial_write(PDO $db,string $table,array $values,?int $id): array {
 $keys=array_keys($values);
 if($id!==null){
  testimonial_find($db,$table,$id);
  $sql="UPDATE $table SET ".implode(',',array_map(static fn($k)=>"$k=:$k",$keys))." WHERE id=:id";
  $values['id']=$id;
 }else{$sql="INSERT INTO $table (".implode(',',$keys).") VALUES (:".implode(',:',$keys).")";}
 image_size_prepare($db,$table,$sql,$values)->execute($values);
 return testimonial_find($db,$table,$id??(int)$db->lastInsertId());
}
function testimonial_list(PDO $db,string $table,bool $admin): array {
 $order=$table==='testimonials'?'orden ASC,id DESC':'id DESC';
 if($admin)return array_map('testimonial_row',$db->query("SELECT * FROM $table ORDER BY $order")->fetchAll());
 $page=filter_var($_GET['page']??1,FILTER_VALIDATE_INT,['options'=>['min_range'=>1,'max_range'=>1000000]]);
 if($page===false)error_response('Página inválida.',422);
 $offset=($page-1)*24;
 $rows=$db->query("SELECT * FROM $table WHERE activo=1 ORDER BY $order LIMIT 25 OFFSET $offset")->fetchAll();
 return ['items'=>array_map('testimonial_row',array_slice($rows,0,24)),'hasMore'=>count($rows)>24];
}
function review_metrics(PDO $db): array {
 $row=$db->query('SELECT COUNT(*) total, COALESCE(AVG(calificacion),0) promedio, COALESCE(SUM(activo=1),0) visibles, COALESCE(SUM(activo=0),0) ocultas FROM student_reviews')->fetch();
 $metrics=['total'=>(int)$row['total'],'promedio'=>round((float)$row['promedio'],2),'visibles'=>(int)$row['visibles'],'ocultas'=>(int)$row['ocultas'],'estrellas'=>array_fill(1,5,0)];
 foreach($db->query('SELECT calificacion,COUNT(*) cantidad FROM student_reviews GROUP BY calificacion')->fetchAll() as $rating)$metrics['estrellas'][(int)$rating['calificacion']]=(int)$rating['cantidad'];
 return $metrics;
}

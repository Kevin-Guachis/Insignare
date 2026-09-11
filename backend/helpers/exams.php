<?php
declare(strict_types=1);
require_once __DIR__.'/universities.php';
function exam_row(array $row): array {
 foreach (['id','university_id','exam_id','orden','activo','cantidad_preguntas'] as $key) if (isset($row[$key])) $row[$key]=(int)$row[$key];
 return $row;
}
function exam_find(PDO $db,int $id,int $universityId): array {
 $q=$db->prepare('SELECT * FROM university_exams WHERE id=:id AND university_id=:parent');
 $q->execute(['id'=>$id,'parent'=>$universityId]);$row=$q->fetch();
 if (!$row) error_response('Examen no encontrado.',404);
 return exam_row($row);
}
function exam_for_university(PDO $db,int $universityId,bool $public=false): ?array {
 $university=university_find($db,$universityId);
 if ($public && !$university['activo']) error_response('Universidad no encontrada.',404);
 if ($public) {
  $q=$db->prepare("SELECT id FROM university_sections WHERE university_id=:id AND tipo='exam' AND activo=1 LIMIT 1");
  $q->execute(['id'=>$universityId]);if (!$q->fetch()) return null;
 }
 $q=$db->prepare('SELECT * FROM university_exams WHERE university_id=:id'.($public?' AND activo=1':''));
 $q->execute(['id'=>$universityId]);$row=$q->fetch();
 return $row?exam_row($row):null;
}
function exam_categories(PDO $db,int $id,bool $public=false): array {
 $q=$db->prepare('SELECT * FROM exam_categories WHERE exam_id=:id'.($public?' AND activo=1':'').' ORDER BY orden,id');
 $q->execute(['id'=>$id]);return array_map('exam_row',$q->fetchAll());
}
function exam_text(array $input,string $key,int $max,bool $required=false): string {
 $value=$input[$key]??'';
 if (!is_string($value)||strlen($value)>$max||strpos($value,"\0")!==false) error_response('Campo inválido: '.$key,422);
 $value=trim($value);if ($required&&$value==='') error_response('Campo obligatorio: '.$key,422);
 return $value;
}
function exam_count($value): ?int {
 if ($value===null||$value==='')return null;
 if (!is_int($value)) error_response('Cantidad de preguntas: usa un entero no negativo.',422);
 if ($value<0||$value>2147483647)error_response('Cantidad de preguntas fuera de rango.',422);
 return $value;
}
function exam_active(array $input): int {
 $active=$input['activo']??1;
 if (!in_array($active,[0,1],true)) error_response('Estado inválido.',422);
 return $active;
}
function exam_values(array $input): array {
 return ['titulo'=>exam_text($input,'titulo',190,true),'descripcion_general'=>exam_text($input,'descripcion_general',8000),
 'duracion'=>exam_text($input,'duracion',100)?:null,'cantidad_preguntas'=>exam_count($input['cantidad_preguntas']??null),
 'activo'=>exam_active($input),'university_id'=>university_id($input['university_id']??null)];
}
function exam_category_values(array $input): array {
 $order=$input['orden']??0;
 if (!is_int($order)||$order<0||$order>2147483647) error_response('Orden inválido.',422);
 $values=['nombre'=>exam_text($input,'nombre',190,true),'descripcion'=>exam_text($input,'descripcion',8000),
 'cantidad_preguntas'=>exam_count($input['cantidad_preguntas']??null),'orden'=>$order,'activo'=>exam_active($input)];
 $image=$input['imagen']??null;if ($image==='')$image=null;
 if ($image!==null) {
  if (!is_string($image)||strlen($image)>255) error_response('Imagen inválida.',422);
  $filename=news_image_filename($image);
  if (!$filename||!is_file(__DIR__.'/../uploads/images/'.$filename)) error_response('Selecciona una imagen subida al sitio.',422);
 }
 $values['imagen']=$image;return $values;
}
function exam_category_find(PDO $db,int $id,int $parent): array {
 $q=$db->prepare('SELECT * FROM exam_categories WHERE id=:id AND exam_id=:parent');
 $q->execute(['id'=>$id,'parent'=>$parent]);$row=$q->fetch();
 if (!$row) error_response('Categoría no encontrada.',404);
 return exam_row($row);
}

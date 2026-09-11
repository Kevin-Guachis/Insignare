<?php
declare(strict_types=1);
require_once __DIR__.'/universities.php';
function admission_row(array $row): array {
 foreach (['id','university_id','admission_id','orden','activo'] as $key) if (isset($row[$key])) $row[$key]=(int)$row[$key];
 return $row;
}
function admission_find(PDO $db,int $id,int $universityId): array {
 $q=$db->prepare('SELECT * FROM university_admissions WHERE id=:id AND university_id=:parent');
 $q->execute(['id'=>$id,'parent'=>$universityId]);$row=$q->fetch();
 if (!$row) error_response('Proceso de admisión no encontrado.',404);
 return admission_row($row);
}
function admission_for_university(PDO $db,int $universityId,bool $public=false): ?array {
 $university=university_find($db,$universityId);
 if ($public && !$university['activo']) error_response('Universidad no encontrada.',404);
 if ($public) {
  $q=$db->prepare("SELECT id FROM university_sections WHERE university_id=:id AND tipo='admission' AND activo=1 LIMIT 1");
  $q->execute(['id'=>$universityId]);if (!$q->fetch()) return null;
 }
 $q=$db->prepare('SELECT * FROM university_admissions WHERE university_id=:id'.($public?' AND activo=1':''));
 $q->execute(['id'=>$universityId]);$row=$q->fetch();
 return $row?admission_row($row):null;
}
function admission_steps(PDO $db,int $id,bool $public=false): array {
 $q=$db->prepare('SELECT * FROM admission_steps WHERE admission_id=:id'.($public?' AND activo=1':'').' ORDER BY orden,id');
 $q->execute(['id'=>$id]);return array_map('admission_row',$q->fetchAll());
}
function admission_text(array $input,string $key,int $max,bool $required=false): string {
 $value=$input[$key]??'';
 if (!is_string($value)||strlen($value)>$max||strpos($value,"\0")!==false) error_response('Campo inválido: '.$key,422);
 $value=trim($value);if ($required&&$value==='') error_response('Campo obligatorio: '.$key,422);
 return $value;
}
function admission_order_state(array $input): array {
 $order=filter_var($input['orden']??0,FILTER_VALIDATE_INT,['options'=>['min_range'=>0,'max_range'=>2147483647]]);
 $active=$input['activo']??1;
 if ($order===false||!in_array($active,[0,1],true)) error_response('Orden o estado inválido.',422);
 return ['orden'=>$order,'activo'=>$active];
}
function admission_values(array $input): array {
 return [...admission_order_state($input),'titulo'=>admission_text($input,'titulo',190,true),'descripcion_general'=>admission_text($input,'descripcion_general',8000),'university_id'=>university_id($input['university_id']??null)];
}
function admission_step_values(array $input): array {
 $values=[...admission_order_state($input),'titulo'=>admission_text($input,'titulo',190,true),'descripcion'=>admission_text($input,'descripcion',8000)];
 $date=$input['fecha']??null;
 if ($date==='') $date=null;
 if ($date!==null) {
  $parsed=is_string($date)?DateTimeImmutable::createFromFormat('!Y-m-d',$date):false;
  if (!$parsed||$parsed->format('Y-m-d')!==$date||$date<'1000-01-01'||$date>'9999-12-31') error_response('Fecha inválida.',422);
 }
 $values['fecha']=$date;
 $image=$input['imagen']??null;if ($image==='')$image=null;
 if ($image!==null) {
  if (!is_string($image)||strlen($image)>255) error_response('Imagen inválida.',422);
  $filename=news_image_filename($image);
  if (!$filename||!is_file(__DIR__.'/../uploads/images/'.$filename)) error_response('Selecciona una imagen subida al sitio.',422);
 }
 $values['imagen']=$image;
 $url=admission_text($input,'boton_url',500);
 $label=admission_text($input,'boton_texto',190);
 if ($url!=='') {
  $local=preg_match('~^/(?!/)~',$url);
  $external=filter_var($url,FILTER_VALIDATE_URL)&&in_array(strtolower(parse_url($url,PHP_URL_SCHEME)??''),['http','https'],true);
  if ((!$local&&!$external)||preg_match('/[\\x00-\\x20\\x7f]/',$url)||strpos($url,chr(92))!==false) error_response('URL del botón inválida.',422);
  if ($label==='') error_response('Indica el texto del botón.',422);
 }
 $values['boton_url']=$url?:null;$values['boton_texto']=$label?:null;
 return $values;
}
function admission_step_find(PDO $db,int $id,int $parent): array {
 $q=$db->prepare('SELECT * FROM admission_steps WHERE id=:id AND admission_id=:parent');
 $q->execute(['id'=>$id,'parent'=>$parent]);$row=$q->fetch();
 if (!$row) error_response('Etapa no encontrada.',404);
 return admission_row($row);
}

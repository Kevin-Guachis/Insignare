<?php
declare(strict_types=1);
require_once __DIR__.'/universities.php';
const UNIVERSITY_SECTION_TYPES=['admission','exam','academic_offer','documents','gallery'];
function university_section_values(array $input): array {
 $parent=university_id($input['university_id']??null);
 $type=$input['tipo']??null;$title=$input['titulo']??null;
 if (!is_string($type)||!in_array($type,UNIVERSITY_SECTION_TYPES,true)) error_response('Tipo de sección inválido.',422);
 if (!is_string($title)||trim($title)===''||strlen($title)>190||strpos($title,"\0")!==false) error_response('Título obligatorio, máximo 190 bytes.',422);
 $order=filter_var($input['orden']??0,FILTER_VALIDATE_INT,['options'=>['min_range'=>0,'max_range'=>2147483647]]);
 $active=$input['activo']??1;
 if ($order===false||!in_array($active,[0,1],true)) error_response('Orden o estado inválido.',422);
 return ['university_id'=>$parent,'tipo'=>$type,'titulo'=>trim($title),'orden'=>$order,'activo'=>$active];
}
function university_section_row(array $row): array {
 foreach (['id','university_id','orden','activo'] as $key) $row[$key]=(int)$row[$key];
 return $row;
}
function university_section_find(PDO $db,int $id,int $parent): array {
 $q=$db->prepare('SELECT * FROM university_sections WHERE id=:id AND university_id=:parent');
 $q->execute(['id'=>$id,'parent'=>$parent]);$row=$q->fetch();
 if (!$row) error_response('Sección no encontrada.',404);
 return university_section_row($row);
}

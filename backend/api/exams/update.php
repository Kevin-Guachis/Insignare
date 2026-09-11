<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/exams.php';
require_method('PUT');$input=read_json_request();$values=exam_values($input);$id=university_id($input['id']??null);$db=get_database();
exam_find($db,$id,$values['university_id']);
$q=$db->prepare('UPDATE university_exams SET titulo=:titulo,descripcion_general=:descripcion_general,duracion=:duracion,cantidad_preguntas=:cantidad_preguntas,activo=:activo WHERE id=:id AND university_id=:university_id');
$q->execute([...$values,'id'=>$id]);success_response(exam_find($db,$id,$values['university_id']));

<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/exams.php';
require_method('PUT');$input=read_json_request();$parent=university_id($input['exam_id']??null);$universityId=university_id($input['university_id']??null);$db=get_database();exam_find($db,$parent,$universityId);
$values=exam_category_values($input);$values['exam_id']=$parent;
$id=university_id($input['id']??null);exam_category_find($db,$id,$parent);$q=$db->prepare('UPDATE exam_categories SET nombre=:nombre,descripcion=:descripcion,cantidad_preguntas=:cantidad_preguntas,imagen=:imagen,orden=:orden,activo=:activo WHERE id=:id AND exam_id=:exam_id');$q->execute([...$values,'id'=>$id]);success_response(exam_category_find($db,$id,$parent));
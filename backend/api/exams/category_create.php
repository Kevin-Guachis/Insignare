<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/exams.php';
require_method('POST');$input=read_json_request();$parent=university_id($input['exam_id']??null);$universityId=university_id($input['university_id']??null);$db=get_database();exam_find($db,$parent,$universityId);
$values=exam_category_values($input);$values['exam_id']=$parent;
$q=image_size_prepare($db,'exam_categories','INSERT INTO exam_categories (exam_id,nombre,descripcion,cantidad_preguntas,imagen,tamano_imagen,orden,activo) VALUES (:exam_id,:nombre,:descripcion,:cantidad_preguntas,:imagen,:tamano_imagen,:orden,:activo)',$values);$q->execute($values);$id=(int)$db->lastInsertId();success_response(exam_category_find($db,$id,$parent));
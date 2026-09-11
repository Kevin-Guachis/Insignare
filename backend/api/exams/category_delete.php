<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/exams.php';
require_method('DELETE');$input=read_json_request();$parent=university_id($input['exam_id']??null);$universityId=university_id($input['university_id']??null);$db=get_database();exam_find($db,$parent,$universityId);
$id=university_id($input['id']??null);$q=$db->prepare('DELETE FROM exam_categories WHERE id=:id AND exam_id=:parent');$q->execute(['id'=>$id,'parent'=>$parent]);if(!$q->rowCount())error_response('Categoría no encontrada.',404);success_response(['id'=>$id]);
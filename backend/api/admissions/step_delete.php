<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/admissions.php';
require_method('DELETE');$input=read_json_request();$parent=university_id($input['admission_id']??null);$universityId=university_id($input['university_id']??null);$db=get_database();admission_find($db,$parent,$universityId);
$id=university_id($input['id']??null);$q=$db->prepare('DELETE FROM admission_steps WHERE id=:id AND admission_id=:parent');$q->execute(['id'=>$id,'parent'=>$parent]);if(!$q->rowCount())error_response('Etapa no encontrada.',404);success_response(['id'=>$id]);
<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/admissions.php';
require_method('PUT');$input=read_json_request();$values=admission_values($input);$id=university_id($input['id']??null);$db=get_database();
admission_find($db,$id,$values['university_id']);
$q=$db->prepare('UPDATE university_admissions SET titulo=:titulo,descripcion_general=:descripcion_general,orden=:orden,activo=:activo WHERE id=:id AND university_id=:university_id');
$q->execute([...$values,'id'=>$id]);success_response(admission_find($db,$id,$values['university_id']));

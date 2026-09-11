<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/admissions.php';
require_method('PUT');$input=read_json_request();$parent=university_id($input['admission_id']??null);$universityId=university_id($input['university_id']??null);$db=get_database();admission_find($db,$parent,$universityId);
$values=admission_step_values($input);$values['admission_id']=$parent;
$id=university_id($input['id']??null);admission_step_find($db,$id,$parent);$q=$db->prepare('UPDATE admission_steps SET titulo=:titulo,descripcion=:descripcion,fecha=:fecha,imagen=:imagen,boton_texto=:boton_texto,boton_url=:boton_url,orden=:orden,activo=:activo WHERE id=:id AND admission_id=:admission_id');$q->execute([...$values,'id'=>$id]);success_response(admission_step_find($db,$id,$parent));
<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/admissions.php';
require_method('POST');$input=read_json_request();$parent=university_id($input['admission_id']??null);$universityId=university_id($input['university_id']??null);$db=get_database();admission_find($db,$parent,$universityId);
$values=admission_step_values($input);$values['admission_id']=$parent;
$q=image_size_prepare($db,'admission_steps','INSERT INTO admission_steps (admission_id,titulo,descripcion,fecha,imagen,tamano_imagen,boton_texto,boton_url,orden,activo) VALUES (:admission_id,:titulo,:descripcion,:fecha,:imagen,:tamano_imagen,:boton_texto,:boton_url,:orden,:activo)',$values);$q->execute($values);$id=(int)$db->lastInsertId();success_response(admission_step_find($db,$id,$parent));
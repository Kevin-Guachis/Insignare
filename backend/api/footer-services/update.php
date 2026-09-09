<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/footer_services.php';
require_method('PUT');$input=read_json_request();$id=footer_service_id($input['id']??null);
$values=footer_service_values($input);$db=get_database();footer_service_find($db,$id);
$q=$db->prepare('UPDATE footer_services SET nombre=:nombre,enlace=:enlace,orden=:orden,activo=:activo WHERE id=:id');
$q->execute([...$values,'id'=>$id]);success_response(footer_service_find($db,$id));

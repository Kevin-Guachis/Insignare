<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/footer_services.php';
require_method('DELETE');$input=read_json_request();$id=footer_service_id($input['id']??null);
$db=get_database();$q=$db->prepare('DELETE FROM footer_services WHERE id=:id');$q->execute(['id'=>$id]);
if (!$q->rowCount()) error_response('Servicio no encontrado.',404);
success_response(['id'=>$id]);

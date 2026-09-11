<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/universities.php';
require_method('DELETE');$input=read_json_request();$id=university_id($input['id']??null);
$db=get_database();$q=$db->prepare('DELETE FROM universities WHERE id=:id');$q->execute(['id'=>$id]);
if (!$q->rowCount()) error_response('Universidad no encontrada.',404);
// Conservar archivos que pueden estar compartidos.
success_response(['id'=>$id]);

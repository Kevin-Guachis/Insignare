<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/admissions.php';
require_method('POST');$values=admission_values(read_json_request());$db=get_database();university_find($db,$values['university_id']);
$q=$db->prepare('INSERT INTO university_admissions (university_id,titulo,descripcion_general,orden,activo) VALUES (:university_id,:titulo,:descripcion_general,:orden,:activo)');
try {$q->execute($values);}catch(PDOException $e){if(($e->errorInfo[1]??null)===1062)error_response('Esta universidad ya tiene un proceso de admisión.',422);throw $e;}
success_response(admission_find($db,(int)$db->lastInsertId(),$values['university_id']));

<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_documents.php';
require_method('POST');$values=university_document_values(read_json_request());$db=get_database();university_find($db,$values['university_id']);
$q=$db->prepare('INSERT INTO university_documents (university_id,titulo,descripcion,archivo,documento_nombre,orden,activo) VALUES (:university_id,:titulo,:descripcion,:archivo,:documento_nombre,:orden,:activo)');
$q->execute($values);success_response(university_document_find($db,(int)$db->lastInsertId(),$values['university_id']));

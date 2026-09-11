<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_documents.php';
require_method('PUT');$input=read_json_request();$values=university_document_values($input);$id=university_id($input['id']??null);$db=get_database();
university_document_find($db,$id,$values['university_id']);
$q=$db->prepare('UPDATE university_documents SET titulo=:titulo,descripcion=:descripcion,archivo=:archivo,documento_nombre=:documento_nombre,orden=:orden,activo=:activo WHERE id=:id AND university_id=:university_id');
$q->execute([...$values,'id'=>$id]);success_response(university_document_find($db,$id,$values['university_id']));

<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_gallery.php';
require_method('DELETE');$input=read_json_request();$id=university_id($input['id']??null);$parent=university_id($input['university_id']??null);
$db=get_database();$q=$db->prepare('DELETE FROM university_gallery WHERE id=:id AND university_id=:parent');$q->execute(['id'=>$id,'parent'=>$parent]);
if(!$q->rowCount())error_response('Imagen no encontrada.',404);
success_response(['id'=>$id]);

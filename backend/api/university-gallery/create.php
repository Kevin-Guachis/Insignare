<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_gallery.php';
require_method('POST');$values=university_gallery_image_values(read_json_request());$db=get_database();university_find($db,$values['university_id']);
$q=$db->prepare('INSERT INTO university_gallery (university_id,titulo,descripcion,imagen,orden,activo) VALUES (:university_id,:titulo,:descripcion,:imagen,:orden,:activo)');
$q->execute($values);success_response(university_gallery_image_find($db,(int)$db->lastInsertId(),$values['university_id']));

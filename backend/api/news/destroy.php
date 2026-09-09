<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_method('POST');
$input=read_json_request();
$id=news_id($input['id']??null);
if (($input['confirm']??false)!==true) error_response('Confirma la eliminación.',422);
$db=get_database();
$query=$db->prepare('DELETE FROM news WHERE id=:id');
$query->execute(['id'=>$id]);
if (!$query->rowCount()) error_response('Noticia no encontrada.',404);
// No borrar archivos: podrían estar asociados a otras noticias o a la configuración.
success_response(['id'=>$id]);

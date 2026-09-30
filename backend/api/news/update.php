<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_method('POST');
$input = read_json_request();
$id = news_id($input['id'] ?? null);
$values = news_values($input);
$db = get_database();
$db->beginTransaction();
$lock = $db->prepare('SELECT id FROM news WHERE id=? FOR UPDATE');
$lock->execute([$id]);
$existing = find_news($db, $id);
if (!array_key_exists('imagen', $input)) $values['imagen'] = $existing['imagen'];
$images = news_additional_values($db, $input, $existing['additional_images']);
if (!array_key_exists('documento', $input)) $values['documento'] = $existing['documento'];

if ($values['documento'] !== null && $values['documento'] === $existing['documento'] && !array_key_exists('documento_nombre', $input)) {
    $values['documento_nombre'] = $existing['documento_nombre'];
}
$active = $input['activo'] ?? $existing['activo'];
if (!in_array($active, [0, 1], true)) error_response('Estado inválido.', 422);
$values['activo'] = $active;
$values['id'] = $id;
$query = image_size_prepare($db,'news','UPDATE news SET titulo=:titulo, categoria=:categoria, fecha=:fecha,
imagen=:imagen,tamano_imagen=:tamano_imagen, descripcion=:descripcion, contenido=:contenido, documento=:documento, documento_nombre=:documento_nombre, activo=:activo WHERE id=:id',$values);
try {
    $query->execute($values);
    news_save_additional($db, $id, $images);
    $db->commit();
} catch (Throwable $error) {
    if ($db->inTransaction()) $db->rollBack();
    throw $error;
}
success_response(find_news($db, $id));

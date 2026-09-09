<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_method('POST');
$input = read_json_request();
$id = news_id($input['id'] ?? null);
$values = news_values($input);
$db = get_database();
$existing = find_news($db, $id);
if (!array_key_exists('documento', $input)) $values['documento'] = $existing['documento'];

if ($values['documento'] !== null && $values['documento'] === $existing['documento'] && !array_key_exists('documento_nombre', $input)) {
    $values['documento_nombre'] = $existing['documento_nombre'];
}
$active = $input['activo'] ?? $existing['activo'];
if (!in_array($active, [0, 1], true)) error_response('Estado inválido.', 422);
$values['activo'] = $active;
$values['id'] = $id;
$query = $db->prepare('UPDATE news SET titulo=:titulo, categoria=:categoria, fecha=:fecha,
imagen=:imagen, descripcion=:descripcion, contenido=:contenido, documento=:documento, documento_nombre=:documento_nombre, activo=:activo WHERE id=:id');
$query->execute($values);
success_response(find_news($db, $id));

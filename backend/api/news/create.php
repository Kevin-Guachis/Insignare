<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_method('POST');
$input = read_json_request();
$values = news_values($input);
// El slug se genera una sola vez; editar el título nunca cambia la URL.
$plain = strtr(strtolower($values['titulo']), ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ñ'=>'n']);
$base = trim((string) preg_replace('/[^a-z0-9]+/', '-', $plain), '-');
$values['slug'] = substr($base ?: 'noticia', 0, 150) . '-' . bin2hex(random_bytes(8));
$db = get_database();
$images = news_additional_values($db, $input);
$query = image_size_prepare($db,'news','INSERT INTO news (titulo, categoria, fecha, imagen,tamano_imagen,descripcion, contenido, documento, documento_nombre, slug)
VALUES (:titulo, :categoria, :fecha, :imagen,:tamano_imagen, :descripcion, :contenido, :documento, :documento_nombre, :slug)',$values);
$db->beginTransaction();
try {
    $query->execute($values);
    $id = (int)$db->lastInsertId();
    news_save_additional($db, $id, $images);
    $db->commit();
} catch (Throwable $error) {
    if ($db->inTransaction()) $db->rollBack();
    throw $error;
}
success_response(find_news($db, $id));

<?php
declare(strict_types=1);
require_once __DIR__ . '/../../helpers/response.php';
require_method('GET');
$name = $_GET['file'] ?? '';
if (!is_string($name) || !preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/D', $name)) {
    error_response('Imagen no encontrada.', 404);
}
$path = __DIR__ . '/../../uploads/images/' . $name;
if (!is_file($path)) error_response('Imagen no encontrada.', 404);
$info = @getimagesize($path);
if (!$info || !in_array($info['mime'], ['image/jpeg', 'image/png', 'image/webp'], true)) {
    error_response('Imagen no encontrada.', 404);
}
header('Content-Type: ' . $info['mime']);
header('Content-Length: ' . filesize($path));
header('X-Content-Type-Options: nosniff');
header('Content-Security-Policy: default-src \'none\'; sandbox');
header('Cache-Control: public, max-age=86400, immutable');
readfile($path);

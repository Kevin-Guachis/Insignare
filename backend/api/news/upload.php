<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_method('POST');
require_news_upload_request();
$file = $_FILES['imagen'] ?? null;
if (!is_array($file) || !isset($file['error']) || is_array($file['error'])) {
    error_response('Selecciona una imagen. Comprueba también el límite de subida de PHP.', 422);
}
if ($file['error'] !== UPLOAD_ERR_OK) {
    error_response('No se pudo subir la imagen. Máximo permitido: 5 MB, sujeto al límite de PHP.', 422);
}
if (!is_string($file['tmp_name'] ?? null) || !is_string($file['name'] ?? null)
    || !is_uploaded_file($file['tmp_name'])) error_response('Archivo inválido.', 422);
$size = filesize($file['tmp_name']);
if (!$size || $size > 5 * 1024 * 1024) error_response('La imagen no debe superar 5 MB.', 422);
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg' => IMAGETYPE_JPEG, 'jpeg' => IMAGETYPE_JPEG, 'png' => IMAGETYPE_PNG, 'webp' => IMAGETYPE_WEBP];
$info = @getimagesize($file['tmp_name']);
if (!isset($allowed[$extension]) || !$info || $info[2] !== $allowed[$extension]
    || $info[0] > 8000 || $info[1] > 8000 || $info[0] * $info[1] > 40000000) {
    error_response('Usa una imagen JPG, PNG o WebP válida, de hasta 8000 px y 40 megapíxeles.', 422);
}
// Rechazar contenido PHP incrustado y nunca conservar el nombre enviado.
$bytes = file_get_contents($file['tmp_name']);
if ($bytes === false || preg_match('/<\?(?:php|=)/i', $bytes)) error_response('Archivo no permitido.', 422);
$name = bin2hex(random_bytes(16)) . '.' . ($extension === 'jpeg' ? 'jpg' : $extension);
$directory = __DIR__ . '/../../uploads/images';
if (!is_dir($directory) || !is_writable($directory)) {
    error_response('El servidor no puede guardar imágenes.', 500);
}
if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) {
    error_response('No se pudo guardar la imagen.', 500);
}
success_response(['imagen' => '/api/news/image.php?file=' . $name]);

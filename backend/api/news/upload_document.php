<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_method('POST');
require_news_upload_request();
$file = $_FILES['documento'] ?? null;
if (!is_array($file) || ($file['error'] ?? null) !== UPLOAD_ERR_OK
    || !is_string($file['tmp_name'] ?? null) || !is_string($file['name'] ?? null)
    || !is_uploaded_file($file['tmp_name'])) {
    error_response('Selecciona un PDF de hasta 10 MB. Comprueba el límite de subida de PHP.', 422);
}
$size = filesize($file['tmp_name']);
if (!$size || $size > 10 * 1024 * 1024) error_response('El PDF no debe superar 10 MB.', 422);
$bytes = file_get_contents($file['tmp_name']);
if (strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'pdf'
    || $bytes === false || !preg_match('/^%PDF-[12]\\.[0-9]/', $bytes)
    || strpos(substr($bytes, -2048), '%%EOF') === false
    || preg_match('/<\\?(?:php|=)/i', $bytes)) {
    error_response('Selecciona un archivo PDF válido.', 422);
}
if (class_exists('finfo')) {
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if ($mime !== 'application/pdf') error_response('Selecciona un archivo PDF válido.', 422);
}
$originalName = clean_document_name($file['name']);
$name = bin2hex(random_bytes(16)) . '.pdf';
$directory = __DIR__ . '/../../uploads/documents';
if (!is_dir($directory) || !is_writable($directory)
    || !move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) {
    error_response('El servidor no pudo guardar el documento.', 500);
}
success_response(['documento' => '/api/news/document.php?file=' . $name, 'documento_nombre' => $originalName]);

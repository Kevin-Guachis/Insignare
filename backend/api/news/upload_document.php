<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_once __DIR__ . '/../../helpers/pdf_upload.php';
// Lectura autenticada para advertir límites efectivos antes de transferir el PDF.
$limits = pdf_upload_limits();
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') success_response($limits);
require_method('POST');
require_news_upload_request();
if ($limits['post_max_bytes'] > 0 && (float) ($_SERVER['CONTENT_LENGTH'] ?? 0) > $limits['post_max_bytes']) {
    error_response('La petición supera post_max_size del servidor (' . pdf_limit_label($limits['post_max_bytes']) . ', incluido el formulario). Máximo de la aplicación: 800 MB.', 413);
}
$file = $_FILES['documento'] ?? null;
if (!is_array($file)) {
    error_response('No se recibió el archivo PDF. Comprueba post_max_size y el límite de petición del hosting.', 422);
}
if (($file['error'] ?? null) !== UPLOAD_ERR_OK) {
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE => 'El PDF supera upload_max_filesize del servidor (' . pdf_limit_label($limits['upload_max_bytes']) . '). Máximo de la aplicación: 800 MB.',
        UPLOAD_ERR_FORM_SIZE => 'El PDF supera el tamaño permitido por el formulario.',
        UPLOAD_ERR_PARTIAL => 'La subida del PDF quedó incompleta. Inténtalo nuevamente.',
        UPLOAD_ERR_NO_FILE => 'Selecciona un archivo PDF.',
        UPLOAD_ERR_NO_TMP_DIR => 'El servidor no tiene disponible la carpeta temporal de subidas.',
        UPLOAD_ERR_CANT_WRITE => 'El servidor no pudo escribir el PDF en disco.',
        UPLOAD_ERR_EXTENSION => 'Una extensión de PHP detuvo la subida del PDF.',
    ];
    error_response($uploadErrors[$file['error'] ?? -1] ?? 'PHP no pudo recibir el archivo PDF.', 422);
}
if (!is_string($file['tmp_name'] ?? null) || !is_string($file['name'] ?? null)
    || !is_uploaded_file($file['tmp_name'])) {
    error_response('El archivo no corresponde a una subida HTTP válida.', 422);
}
$size = filesize($file['tmp_name']);
if ($size === false || $size === 0) error_response('El PDF está vacío o no se pudo consultar su tamaño.', 422);
if ($size > PDF_UPLOAD_MAX_BYTES) error_response('El PDF no debe superar 800 MB.', 422);
if ($limits['upload_max_bytes'] > 0 && $size > $limits['upload_max_bytes']) error_response('El PDF supera el límite de subida del servidor (' . pdf_limit_label($limits['upload_max_bytes']) . ').', 413);
if (strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'pdf') {
    error_response('La extensión del archivo debe ser .pdf.', 422);
}
if (!valid_uploaded_pdf_contents($file['tmp_name'], $pdfError)) {
    error_response($pdfError ?? 'Selecciona un archivo PDF válido.', 422);
}
$originalName = clean_document_name($file['name']);
$name = bin2hex(random_bytes(16)) . '.pdf';
$directory = __DIR__ . '/../../uploads/documents';
if (!is_dir($directory) || !is_writable($directory)) {
    error_response('La carpeta protegida de documentos no está disponible para escritura.', 500);
}
$destination = $directory . '/' . $name;
// Reserva exclusiva: nunca reemplazar un documento existente, ni ante colisión.
$reservation = @fopen($destination, 'x');
if ($reservation === false) error_response('No se pudo reservar un nombre nuevo para el PDF. Inténtalo nuevamente.', 500);
fclose($reservation);
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    unlink($destination);
    error_response('El servidor no pudo guardar el documento.', 500);
}
success_response(['documento' => '/api/news/document.php?file=' . $name, 'documento_nombre' => $originalName]);

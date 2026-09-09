<?php
declare(strict_types=1);

require_once __DIR__ . '/response.php';
require_once __DIR__ . '/../config/database.php';

function news_id($value): int
{
    $id = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($id === false) error_response('Identificador inválido.', 422);
    return $id;
}

function news_image_filename(string $url): ?string
{
    return preg_match('~^/api/news/image\.php\?file=([a-f0-9]{32}\.(?:jpg|png|webp))$~D', $url, $matches)
        ? $matches[1] : null;
}


function clean_document_name(string $name): string
{
    $name = basename(str_replace(chr(92), '/', $name));
    $name = preg_replace('/[\x00-\x1F\x7F<>:"|?*]/u', '', $name);
    if ($name === null) error_response('Nombre de documento inválido.', 422);
    $name = trim($name);
    if ($name === '') return 'Documento PDF.pdf';
    // Limitar a 255 caracteres Unicode sin cortar caracteres UTF-8.
    preg_match('/^.{0,255}/us', $name, $matches);
    return $matches[0];
}

function news_values(array $input): array
{
    $values = [];
    // Límites en bytes: el helper JSON existente admite hasta 16 KiB.
    foreach (['titulo' => 250, 'categoria' => 100, 'descripcion' => 2000, 'contenido' => 10000] as $key => $max) {
        $value = $input[$key] ?? '';
        if (!is_string($value) || strlen($value) > $max || strpos($value, "\0") !== false) {
            error_response('El campo ' . $key . ' no es válido o supera ' . $max . ' bytes.', 422);
        }
        $values[$key] = trim($value);
    }
    if ($values['titulo'] === '' || $values['categoria'] === '') {
        error_response('Título y categoría son obligatorios.', 422);
    }
    $date = $input['fecha'] ?? '';
    $parsed = is_string($date) ? DateTimeImmutable::createFromFormat('!Y-m-d', $date) : false;
    if (!$parsed || $parsed->format('Y-m-d') !== $date || $date < '1000-01-01' || $date > '9999-12-31') {
        error_response('La fecha no es válida.', 422);
    }
    $values['fecha'] = $date;
    $image = $input['imagen'] ?? '';
    if (!is_string($image) || strlen($image) > 255) error_response('Imagen inválida.', 422);
    $filename = news_image_filename($image);
    $seedImages = ['/images/news/admision-uce.jpg', '/images/news/admision-epn.webp', '/images/news/admision-espe.jpg'];
    if ($image !== '' && !in_array($image, $seedImages, true)
        && (!$filename || !is_file(__DIR__ . '/../uploads/images/' . $filename))) {
        error_response('Selecciona una imagen subida al sitio.', 422);
    }
    $values['imagen'] = $image === '' ? null : $image;

    $document = $input['documento'] ?? null;
    $legacy = ['/documents/uce-admision-artes-2026-2027.pdf', '/documents/epn-lineamientos-admision.pdf', '/documents/epn-guia-estudio-2026.pdf'];
    if ($document === '') $document = null;
    if ($document !== null) {
        if (!is_string($document) || strlen($document) > 255) error_response('Documento inválido.', 422);
        if (!in_array($document, $legacy, true)) {
            if (!preg_match('~^/api/news/document\\.php\\?file=([a-f0-9]{32}\\.pdf)$~D', $document, $matches)
                || !is_file(__DIR__ . '/../uploads/documents/' . $matches[1])) {
                error_response('Selecciona un PDF subido al sitio.', 422);
            }
        }
    }
    $values['documento'] = $document;

    $documentName = $input['documento_nombre'] ?? null;
    if ($documentName !== null && !is_string($documentName)) error_response('Nombre de documento inválido.',422);
    $values['documento_nombre'] = $document !== null && $documentName !== null ? clean_document_name($documentName) : null;
    return $values;
}

function news_row(array $row): array
{
    $row['id'] = (int) $row['id'];
    $row['activo'] = (int) $row['activo'];
    return $row;
}

function find_news(PDO $db, int $id): array
{
    $query = $db->prepare('SELECT * FROM news WHERE id = :id');
    $query->execute(['id' => $id]);
    $row = $query->fetch();
    if (!$row) error_response('Noticia no encontrada.', 404);
    return news_row($row);
}

// Multipart no puede usar read_json_request. Conserva las mismas barreras de origen.
function require_news_upload_request(): void
{
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest'
        || ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
        error_response('Solicitud no permitida.', 403);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    if ($origin !== '' && rtrim($origin, '/') !== $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? '')) {
        error_response('Solicitud no permitida.', 403);
    }
}

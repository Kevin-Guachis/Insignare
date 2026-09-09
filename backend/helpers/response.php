<?php
declare(strict_types=1);

ini_set('display_errors', '0');

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function success_response($data = null): void
{
    json_response(['success' => true, 'data' => $data]);
}

function error_response(string $message, int $status): void
{
    json_response(['success' => false, 'message' => $message], $status);
}

set_exception_handler(static function (Throwable $error): void {
    // No exponer excepciones, credenciales, consultas ni trazas al cliente.
    error_response('No se pudo completar la solicitud. Inténtalo más tarde.', 500);
});

function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        error_response('Método no permitido.', 405);
    }
}

function read_json_request(): array
{
    // JSON + cabecera no simple requieren preflight desde otros orígenes.
    // No habilitar CORS permisivo: Vite y producción usan el mismo origen.
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
        error_response('Solicitud no permitida.', 403);
    }
    $contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($contentType !== 'application/json') {
        error_response('Se requiere contenido JSON.', 400);
    }
    if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
        error_response('Solicitud no permitida.', 403);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $expected = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? '');
        if (rtrim($origin, '/') !== $expected) {
            error_response('Solicitud no permitida.', 403);
        }
    }
    $raw = file_get_contents('php://input', false, null, 0, 16385);
    if ($raw === false || strlen($raw) > 16384) {
        error_response('Solicitud inválida.', 400);
    }
    try {
        $data = json_decode($raw, false, 32, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        error_response('JSON inválido.', 400);
    }
    if (!$data instanceof stdClass) {
        error_response('Se requiere un objeto JSON.', 400);
    }
    return (array) $data;
}

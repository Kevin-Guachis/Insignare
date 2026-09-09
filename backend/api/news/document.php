<?php
declare(strict_types=1);
require_once __DIR__ . '/../../helpers/response.php';
require_method('GET');
$name = $_GET['file'] ?? '';
if (!is_string($name) || !preg_match('/^[a-f0-9]{32}\\.pdf$/D', $name)) error_response('Documento no encontrado.', 404);
$path = __DIR__ . '/../../uploads/documents/' . $name;
if (!is_file($path)) error_response('Documento no encontrado.', 404);
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . $name . '"');
header('Content-Length: ' . filesize($path));
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; sandbox");
readfile($path);

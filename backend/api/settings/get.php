<?php
declare(strict_types=1);
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';
require_method('GET');
$row = get_database()->query('SELECT * FROM site_settings WHERE id=1')->fetch();
if (!$row) error_response('Configuración no disponible.', 404);
success_response($row);

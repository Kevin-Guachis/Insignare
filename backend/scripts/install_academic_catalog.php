<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__.'/../config/database.php';
$db=get_database();
$db->exec(file_get_contents(__DIR__.'/../database/academic_catalog_schema.sql'));
echo "Tablas de facultades, carreras y materias instaladas.\n";

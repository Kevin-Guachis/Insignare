<?php
declare(strict_types=1);
require_once __DIR__ . '/../../helpers/news.php';
require_method('GET');
$rows = get_database()->query('SELECT * FROM news WHERE activo = 1 ORDER BY fecha DESC, id ASC')->fetchAll();
success_response(array_map('news_row', $rows));

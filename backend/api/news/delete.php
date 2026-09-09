<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_method('POST');
$input = read_json_request();
$id = news_id($input['id'] ?? null);
$db = get_database();
find_news($db, $id);
$query = $db->prepare('UPDATE news SET activo=0 WHERE id=:id');
$query->execute(['id' => $id]);
success_response(['id' => $id, 'activo' => 0]);

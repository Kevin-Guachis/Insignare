<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/footer_services.php';
require_method('POST');$values=footer_service_values(read_json_request());$db=get_database();
$q=$db->prepare('INSERT INTO footer_services (nombre,enlace,orden,activo) VALUES (:nombre,:enlace,:orden,:activo)');
$q->execute($values);success_response(footer_service_find($db,(int)$db->lastInsertId()));

<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/universities.php';
require_method('POST');$values=university_values(read_json_request());$db=get_database();
$q=$db->prepare('INSERT INTO universities (nombre,slug,logo,descripcion,imagen_portada,orden,activo) VALUES (:nombre,:slug,:logo,:descripcion,:imagen_portada,:orden,:activo)');
university_execute($q,$values);success_response(university_find($db,(int)$db->lastInsertId()));

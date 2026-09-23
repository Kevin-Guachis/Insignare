<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/universities.php';
require_method('POST');$values=university_values(read_json_request());$db=get_database();
$q=image_size_prepare($db,'universities','INSERT INTO universities (nombre,slug,logo,descripcion,imagen_portada,tamano_logo,tamano_portada,orden,activo) VALUES (:nombre,:slug,:logo,:descripcion,:imagen_portada,:tamano_logo,:tamano_portada,:orden,:activo)',$values);
university_execute($q,$values);success_response(university_find($db,(int)$db->lastInsertId()));

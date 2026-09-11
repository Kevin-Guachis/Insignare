<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/academic_offers.php';
require_method('POST');$values=academic_offer_values(read_json_request());$db=get_database();university_find($db,$values['university_id']);
$q=$db->prepare('INSERT INTO university_academic_offers (university_id,titulo,descripcion,imagen,documento,documento_nombre,boton_texto,boton_url,orden,activo) VALUES (:university_id,:titulo,:descripcion,:imagen,:documento,:documento_nombre,:boton_texto,:boton_url,:orden,:activo)');
$q->execute($values);success_response(academic_offer_find($db,(int)$db->lastInsertId(),$values['university_id']));

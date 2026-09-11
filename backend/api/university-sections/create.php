<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_sections.php';
require_method('POST');$values=university_section_values(read_json_request());$db=get_database();university_find($db,$values['university_id']);
$q=$db->prepare('INSERT INTO university_sections (university_id,tipo,titulo,orden,activo) VALUES (:university_id,:tipo,:titulo,:orden,:activo)');
$q->execute($values);success_response(university_section_find($db,(int)$db->lastInsertId(),$values['university_id']));

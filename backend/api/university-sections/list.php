<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/university_sections.php';
require_method('GET');$parent=university_id($_GET['university_id']??null);$db=get_database();
$university=university_find($db,$parent);
if (!$university['activo']) error_response('Universidad no encontrada.',404);
$q=$db->prepare('SELECT * FROM university_sections WHERE university_id=:parent AND activo=1 ORDER BY orden,id');
$q->execute(['parent'=>$parent]);success_response(array_map('university_section_row',$q->fetchAll()));

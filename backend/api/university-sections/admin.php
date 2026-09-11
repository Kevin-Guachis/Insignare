<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_sections.php';
require_method('GET');$parent=university_id($_GET['university_id']??null);$db=get_database();university_find($db,$parent);
$q=$db->prepare('SELECT * FROM university_sections WHERE university_id=:parent ORDER BY orden,id');
$q->execute(['parent'=>$parent]);success_response(array_map('university_section_row',$q->fetchAll()));

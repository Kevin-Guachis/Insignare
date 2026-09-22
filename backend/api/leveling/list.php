<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/academic_catalog.php';
require_method('GET');
$university=university_id($_GET['university_id']??null);
$db=get_database();
if (!university_find($db,$university)['activo']) error_response('Universidad no encontrada.',404);
$q=$db->prepare("SELECT id FROM university_sections WHERE university_id=:id AND tipo='leveling' AND activo=1 LIMIT 1");
$q->execute(['id'=>$university]);
if (!$q->fetch()) success_response([]);
success_response(academic_catalog_tree($db,$university,true));

<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/university_gallery.php';
require_method('GET');$parent=university_id($_GET['university_id']??null);$db=get_database();$university=university_find($db,$parent);
if(!$university['activo'])error_response('Universidad no encontrada.',404);
$q=$db->prepare("SELECT id FROM university_sections WHERE university_id=:id AND tipo='gallery' AND activo=1 LIMIT 1");
$q->execute(['id'=>$parent]);if(!$q->fetch())success_response([]);
$q=$db->prepare('SELECT * FROM university_gallery WHERE university_id=:id AND activo=1 ORDER BY orden,id');
$q->execute(['id'=>$parent]);success_response(array_map('university_gallery_image_row',$q->fetchAll()));

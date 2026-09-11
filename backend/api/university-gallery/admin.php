<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_gallery.php';
require_method('GET');$parent=university_id($_GET['university_id']??null);$db=get_database();university_find($db,$parent);
$q=$db->prepare('SELECT * FROM university_gallery WHERE university_id=:id ORDER BY orden,id');
$q->execute(['id'=>$parent]);success_response(array_map('university_gallery_image_row',$q->fetchAll()));

<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/academic_catalog.php';
require_method('DELETE');
$input=read_json_request();
$definition=academic_catalog_type($input['type']??null);
$id=university_id($input['id']??null);
$university=university_id($input['university_id']??null);
$db=get_database();
academic_catalog_find($db,$input['type'],$id,$university);
$q=$db->prepare('DELETE FROM '.$definition['table'].' WHERE id=:id');
$q->execute(['id'=>$id]);
success_response(['id'=>$id]);

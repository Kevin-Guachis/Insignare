<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/exams.php';
require_method('GET');$id=university_id($_GET['university_id']??null);$db=get_database();
$exam=exam_for_university($db,$id,true);
success_response(['exam'=>$exam,'categories'=>$exam?exam_categories($db,$exam['id'],true):[]]);

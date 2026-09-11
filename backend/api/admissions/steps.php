<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/admissions.php';
require_method('GET');$id=university_id($_GET['university_id']??null);$db=get_database();
$admission=admission_for_university($db,$id,true);
success_response($admission?admission_steps($db,$admission['id'],true):[]);

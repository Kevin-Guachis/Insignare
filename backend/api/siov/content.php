<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/siov.php';
require_method('GET');$db=get_database();$out=[];
foreach(array_keys(siov_types()) as $type)$out[$type]=siov_rows($db,$type,true);
success_response($out);

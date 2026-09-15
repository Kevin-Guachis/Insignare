<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/siov.php';
require_method('GET');$db=get_database();$out=[];
foreach(array_keys(siov_types()) as $type)$out[$type]=siov_rows($db,$type);
$out['metrics']=array_map('siov_row',$db->query('SELECT * FROM siov_metrics ORDER BY evento,dimension_id')->fetchAll());
success_response($out);

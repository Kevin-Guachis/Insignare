<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/academic_catalog.php';
require_method('GET');
$university=university_id($_GET['university_id']??null);
$db=get_database();
university_find($db,$university);
success_response(academic_catalog_tree($db,$university,false));

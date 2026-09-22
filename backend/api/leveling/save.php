<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/academic_catalog.php';
require_method('POST');
success_response(academic_catalog_save(get_database(),read_json_request()));

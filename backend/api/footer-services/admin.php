<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/footer_services.php';
require_method('GET');
success_response(array_map('footer_service_row',get_database()->query('SELECT * FROM footer_services ORDER BY orden,id')->fetchAll()));

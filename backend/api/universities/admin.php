<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/universities.php';
require_method('GET');
success_response(array_map('university_row',get_database()->query('SELECT * FROM universities ORDER BY orden,id')->fetchAll()));

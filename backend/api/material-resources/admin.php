<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/material_resources.php';
require_method('GET');
success_response(array_map('material_row',get_database()->query('SELECT r.*,u.nombre university_name FROM material_resources r JOIN universities u ON u.id=r.university_id ORDER BY r.display_order,r.id DESC')->fetchAll()));

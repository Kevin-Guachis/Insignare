<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/testimonials.php';
require_method('GET');
success_response(testimonial_list(get_database(),'testimonials',true));

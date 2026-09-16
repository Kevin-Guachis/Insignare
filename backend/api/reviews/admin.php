<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/testimonials.php';
require_method('GET');$db=get_database();
success_response(['items'=>testimonial_list($db,'student_reviews',true),'metrics'=>review_metrics($db)]);

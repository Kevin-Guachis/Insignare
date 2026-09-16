<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/contact_settings.php';
require_method('GET');
success_response(contact_settings_get());

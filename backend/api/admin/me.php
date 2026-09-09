<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers/response.php';
require_method('GET');
require_once __DIR__ . '/../../middleware/require_admin.php';

success_response(['admin' => session_admin()]);

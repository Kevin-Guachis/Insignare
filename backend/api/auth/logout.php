<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/session.php';

require_method('POST');
read_json_request();
start_admin_session();
destroy_admin_session();
success_response(['authenticated' => false, 'admin' => null]);

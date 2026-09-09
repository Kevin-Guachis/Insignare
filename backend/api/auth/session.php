<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/session.php';

require_method('GET');
start_admin_session();
$admin = session_admin();
success_response(['authenticated' => $admin !== null, 'admin' => $admin]);

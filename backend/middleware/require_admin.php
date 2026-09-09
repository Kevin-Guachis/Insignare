<?php
declare(strict_types=1);

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/session.php';

start_admin_session();
if (empty($_SESSION['admin_id'])) {
    error_response('No autorizado.', 401);
}

<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';

require_method('POST');
$input = read_json_request();
$email = is_string($input['email'] ?? null) ? strtolower(trim($input['email'])) : '';
$password = $input['password'] ?? null;
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190
    || !is_string($password) || $password === '' || strlen($password) > 72
    || strpos($password, "\0") !== false) {
    error_response('Introduce un correo válido y una contraseña válida.', 422);
}

$dummyHash = password_hash(bin2hex(random_bytes(24)), PASSWORD_DEFAULT);
$pdo = get_database();
$statement = $pdo->prepare('SELECT id, name, email, password_hash, is_active FROM admins WHERE email = :email LIMIT 1');
$statement->execute(['email' => $email]);
$admin = $statement->fetch();
// Hash de comparación sin credenciales reales para evitar omitir el trabajo de verificación.
$hash = $admin ? $admin['password_hash'] : $dummyHash;
$verified = password_verify($password, $hash);
if (!$admin || !$verified || (int) $admin['is_active'] !== 1) {
    error_response('Correo o contraseña incorrectos.', 401);
}

start_admin_session();
if (!session_regenerate_id(true)) {
    throw new RuntimeException('No se pudo renovar la sesión.');
}
$_SESSION = [
    'admin_id' => $admin['id'],
    'admin_name' => $admin['name'],
    'admin_email' => $admin['email'],
];
success_response(['admin' => session_admin()]);

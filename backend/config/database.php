<?php
declare(strict_types=1);

function get_database(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $path = __DIR__ . '/database.local.php';
    if (!is_file($path)) {
        throw new RuntimeException('Falta configurar la conexión local.');
    }
    $config = require $path;
    if (!is_array($config)) {
        throw new RuntimeException('Configuración de conexión inválida.');
    }
    foreach (['host', 'database', 'username', 'password'] as $key) {
        if (!isset($config[$key]) || !is_string($config[$key])) {
            throw new RuntimeException('Configuración de conexión inválida.');
        }
    }
    if (strpbrk($config['host'] . $config['database'], ";\r\n") !== false) {
        throw new RuntimeException('Configuración de conexión inválida.');
    }
    $port = filter_var($config['port'] ?? 3306, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 65535],
    ]);
    if ($port === false) {
        throw new RuntimeException('Puerto inválido.');
    }
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $config['host'], $port, $config['database']);
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

<?php

$env = parse_ini_file(__DIR__ . '/../.env');

return [
    'host' => $env['DB_HOST'],
    'port' => $env['DB_PORT'],
    'database' => $env['DB_NAME'],
    'username' => $env['DB_USERNAME'],
    'password' => $env['DB_PASSWORD'],
];
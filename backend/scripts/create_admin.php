<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Acceso no permitido.');
}
ini_set('display_errors', '0');
require_once __DIR__ . '/../config/database.php';

function prompt(string $label): string
{
    fwrite(STDOUT, $label . ': ');
    $value = fgets(STDIN);
    if ($value === false) {
        throw new RuntimeException('No se pudo leer la entrada.');
    }
    return trim($value);
}

function read_password(): string
{
    if (!function_exists('shell_exec')) {
        throw new RuntimeException('Se necesita una terminal con lectura oculta de contraseña.');
    }
    if (PHP_OS_FAMILY === 'Windows') {
        // Comando fijo: nunca interpolar las credenciales en argumentos del proceso.
        $command = 'powershell.exe -NoProfile -Command "$secret = Read-Host -Prompt Contraseña -AsSecureString; $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret); try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }"';
        $password = shell_exec($command);
        if (!is_string($password) || $password === '') {
            throw new RuntimeException('No se pudo leer la contraseña oculta.');
        }
        return $password;
    }
    $mode = shell_exec('stty -g 2>/dev/null');
    if (!$mode) {
        throw new RuntimeException('Ejecuta el script desde una terminal interactiva.');
    }
    fwrite(STDOUT, 'Contraseña: ');
    shell_exec('stty -echo');
    try {
        $password = fgets(STDIN);
        if ($password === false) {
            throw new RuntimeException('No se pudo leer la contraseña.');
        }
        return rtrim($password, "\r\n");
    } finally {
        shell_exec('stty ' . escapeshellarg(trim($mode)));
        fwrite(STDOUT, PHP_EOL);
    }
}

try {
    $name = prompt('Nombre');
    $email = strtolower(prompt('Correo'));
    $password = read_password();
    $nameLength = preg_match_all('/./us', $name);
    $passwordLength = preg_match_all('/./us', $password);
    if (!$nameLength || $nameLength > 120) {
        throw new RuntimeException('El nombre es obligatorio y debe tener hasta 120 caracteres.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        throw new RuntimeException('El correo no es válido.');
    }
    if ($passwordLength === false || $passwordLength < 10 || strlen($password) > 72 || strpos($password, "\0") !== false) {
        throw new RuntimeException('La contraseña debe tener al menos 10 caracteres y como máximo 72 bytes.');
    }
    $hash = password_hash($password, PASSWORD_DEFAULT);
    unset($password);
    $pdo = get_database();
    $lockName = 'insignare_admin_' . substr(hash('sha256', (string) $pdo->query('SELECT DATABASE()')->fetchColumn()), 0, 32);
    $lock = $pdo->prepare('SELECT GET_LOCK(:name, 10)');
    $lock->execute(['name' => $lockName]);
    if ((int) $lock->fetchColumn() !== 1) {
        throw new RuntimeException('No se pudo iniciar la creación. Inténtalo nuevamente.');
    }
    try {
        $existing = $pdo->prepare('SELECT id FROM admins WHERE email = :email');
        $existing->execute(['email' => $email]);
        if ($existing->fetch()) {
            throw new RuntimeException('Ese correo ya existe.');
        }
        if ((int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() > 0) {
            throw new RuntimeException('Ya existe un administrador. No se creará otro.');
        }
        $insert = $pdo->prepare('INSERT INTO admins (name, email, password_hash) VALUES (:name, :email, :hash)');
        $insert->execute(['name' => $name, 'email' => $email, 'hash' => $hash]);
    } finally {
        $release = $pdo->prepare('SELECT RELEASE_LOCK(:name)');
        $release->execute(['name' => $lockName]);
    }
    fwrite(STDOUT, 'Administrador creado correctamente.' . PHP_EOL);
} catch (PDOException $error) {
    fwrite(STDERR, 'No se pudo crear el administrador. Revisa la configuración y el esquema de MySQL.' . PHP_EOL);
    exit(1);
} catch (RuntimeException $error) {
    fwrite(STDERR, $error->getMessage() . PHP_EOL);
    exit(1);
} catch (Throwable $error) {
    fwrite(STDERR, 'No se pudo crear el administrador.' . PHP_EOL);
    exit(1);
}

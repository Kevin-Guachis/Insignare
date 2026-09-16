<?php
declare(strict_types=1);

// Instalación explícita: nunca crear tablas desde una petición pública.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../config/database.php';
try {
    $sql = file_get_contents(__DIR__ . '/../database/testimonials_schema.sql');
    if ($sql === false) throw new RuntimeException('No se pudo leer el esquema.');
    $db = get_database();
    $db->exec($sql);
    $columns = array_column($db->query("SHOW COLUMNS FROM testimonials")->fetchAll(), "Field");
    if (in_array("nombre", $columns, true)) {
        $db->exec(file_get_contents(__DIR__ . "/../database/testimonials_gallery_migration.sql"));
    }
    // Confirmar también columnas en instalaciones previas, sin borrar ni alterar datos.
    $db->query('SELECT id,titulo,imagen,orden,activo,created_at,updated_at FROM testimonials LIMIT 0');
    $db->query('SELECT id,nombre,calificacion,comentario,activo,created_at,updated_at FROM student_reviews LIMIT 0');
    echo "Estructura de Testimonios instalada correctamente.\n";
} catch (Throwable $error) {
    fwrite(STDERR, "No se pudo instalar Testimonios. Revisa la conexión, los permisos y la estructura existente frente a testimonials_schema.sql.\n");
    exit(1);
}
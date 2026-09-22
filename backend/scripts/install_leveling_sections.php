<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__.'/../config/database.php';

$db=get_database();
$db->beginTransaction();
try {
    $universities=$db->query('SELECT id FROM universities ORDER BY id FOR UPDATE')->fetchAll(PDO::FETCH_COLUMN);
    $find=$db->prepare("SELECT id FROM university_sections WHERE university_id=:university AND tipo='leveling' LIMIT 1");
    $order=$db->prepare('SELECT COALESCE(MAX(orden),-1)+1 FROM university_sections WHERE university_id=:university');
    $insert=$db->prepare("INSERT INTO university_sections (university_id,tipo,titulo,orden,activo) VALUES (:university,'leveling','Nivelación universitaria',:sort,1)");
    $inserted=0;
    $existing=0;
    foreach ($universities as $university) {
        $find->execute(['university'=>$university]);
        if ($find->fetchColumn()) { $existing++; continue; }
        $order->execute(['university'=>$university]);
        $insert->execute(['university'=>$university,'sort'=>(int)$order->fetchColumn()]);
        $inserted++;
    }
    $db->commit();
    echo "Nivelación universitaria: $inserted secciones insertadas, $existing existentes conservadas.\n";
} catch (Throwable $error) {
    if ($db->inTransaction()) $db->rollBack();
    fwrite(STDERR,"No se pudieron registrar las secciones de nivelación.\n");
    exit(1);
}

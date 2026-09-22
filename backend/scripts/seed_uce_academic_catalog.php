<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__.'/../config/database.php';

// This is an initial seed: existing names, visibility and order are preserved.
function uce_seed_name($name): string {
    if (!is_string($name) || trim($name)==='' || preg_match('//u',$name)!==1
        || preg_match('/[\x00-\x1f\x7f]/',$name) || preg_match_all('/./us',$name)>190) {
        throw new RuntimeException('Nombre inválido en los datos de carga.');
    }
    return trim($name);
}

function uce_seed_entry(PDO $db,string $table,string $parentColumn,int $parent,string $name,int $order,array &$counts): int {
    // Identifiers are internal constants from the three calls below.
    $q=$db->prepare("SELECT id FROM $table WHERE $parentColumn=:parent AND nombre=:name ORDER BY id");
    $q->execute(['parent'=>$parent,'name'=>$name]);
    $ids=$q->fetchAll(PDO::FETCH_COLUMN);
    if (count($ids)>1) throw new RuntimeException("Hay registros ambiguos en $table: $name. Revisa los duplicados antes de cargar.");
    if ($ids) { $counts['existing']++; return (int)$ids[0]; }
    $q=$db->prepare("INSERT INTO $table ($parentColumn,nombre,orden,activo) VALUES (:parent,:name,:sort,1)");
    $q->execute(['parent'=>$parent,'name'=>$name,'sort'=>$order]);
    $counts['inserted']++;
    return (int)$db->lastInsertId();
}

$db=null;
try {
    $seed=json_decode(file_get_contents(__DIR__.'/../database/seeds/uce_academic_catalog.json'),true,512,JSON_THROW_ON_ERROR);
    if (($seed['university_slug']??null)!=='uce' || !is_array($seed['faculties']??null) || !$seed['faculties']) {
        throw new RuntimeException('Fuente de carga inválida.');
    }
    $db=get_database();
    $db->beginTransaction();
    // Serialize concurrent runs for this university without adding schema changes.
    $q=$db->prepare('SELECT id,nombre,activo FROM universities WHERE slug=:slug FOR UPDATE');
    $q->execute(['slug'=>'uce']);
    $university=$q->fetch();
    if (!$university) throw new RuntimeException('No existe una universidad con slug uce. La carga no crea universidades.');
    $counts=array_fill_keys(['faculties','careers','subjects'],['inserted'=>0,'existing'=>0]);
    foreach ($seed['faculties'] as $facultyOrder=>$faculty) {
        if (!is_array($faculty['careers']??null)) throw new RuntimeException('Lista de carreras inválida.');
        $facultyId=uce_seed_entry($db,'university_faculties','university_id',(int)$university['id'],uce_seed_name($faculty['nombre']??null),$facultyOrder,$counts['faculties']);
        foreach ($faculty['careers'] as $careerOrder=>$career) {
            if (!is_array($career['subjects']??null)) throw new RuntimeException('Lista de materias inválida.');
            $careerId=uce_seed_entry($db,'university_careers','faculty_id',$facultyId,uce_seed_name($career['nombre']??null),$careerOrder,$counts['careers']);
            foreach ($career['subjects'] as $subjectOrder=>$subject) {
                uce_seed_entry($db,'university_subjects','career_id',$careerId,uce_seed_name($subject),$subjectOrder,$counts['subjects']);
            }
        }
    }
    $db->commit();
    echo 'Universidad: '.$university['nombre'].' (uce, ID '.$university['id'].")\n";
    foreach (['faculties'=>'Facultades','careers'=>'Carreras','subjects'=>'Materias'] as $key=>$label) {
        echo "$label: ".$counts[$key]['inserted'].' insertados, '.$counts[$key]['existing']." existentes conservados.\n";
    }
    if (!(int)$university['activo']) echo "La universidad está inactiva; su estado se conservó.\n";
} catch (Throwable $error) {
    if ($db instanceof PDO && $db->inTransaction()) $db->rollBack();
    // Do not expose connection settings or SQL in CLI output.
    fwrite(STDERR,$error instanceof PDOException
        ? "No se pudo cargar el catálogo. Revisa la conexión y la instalación de academic_catalog_schema.sql.\n"
        : 'Carga cancelada: '.$error->getMessage()."\n");
    exit(1);
}

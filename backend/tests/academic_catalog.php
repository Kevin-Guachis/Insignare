<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__.'/../helpers/academic_catalog.php';

function check_catalog(bool $condition,string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
$db=get_database();
$db->beginTransaction();
try {
    $q=$db->prepare('INSERT INTO universities (nombre,slug,descripcion) VALUES (:name,:slug,:description)');
    $q->execute(['name'=>'Prueba catálogo','slug'=>'catalog-test-'.bin2hex(random_bytes(8)),'description'=>'Temporal']);
    $university=(int)$db->lastInsertId();
    $base=['university_id'=>$university,'orden'=>0,'activo'=>1];
    $faculty=academic_catalog_save($db,$base+['type'=>'faculty','nombre'=>'Medicina']);
    $career=academic_catalog_save($db,$base+['type'=>'career','faculty_id'=>$faculty['id'],'nombre'=>'Salud']);
    $subject=academic_catalog_save($db,$base+['type'=>'subject','career_id'=>$career['id'],'nombre'=>'Biología']);
    // Negative cases exit through the real API error handler. The shutdown hook
    // checks the response status and rolls back even when error_response exits.
    $scenario=$argv[1]??'';
    if ($scenario!=='') {
        $expected=$scenario==='foreign-parent'||$scenario==='foreign-record' ? 404 : 422;
        register_shutdown_function(static function() use ($db,$expected,$scenario): void {
            if ($db->inTransaction()) $db->rollBack();
            if (http_response_code()!==$expected) {
                fwrite(STDERR,"Unexpected response in $scenario\n");
                exit(1);
            }
            echo "\nOK: $scenario rejected ($expected); fixtures rolled back.\n";
        });
        $values=$base+['type'=>'career','faculty_id'=>$faculty['id'],'nombre'=>'Prueba'];
        switch ($scenario) {
            case 'foreign-parent':
            case 'foreign-record':
                $q=$db->prepare('INSERT INTO universities (nombre,slug,descripcion) VALUES (:name,:slug,:description)');
                $q->execute(['name'=>'Otra universidad','slug'=>'catalog-other-'.bin2hex(random_bytes(8)),'description'=>'Temporal']);
                $values['university_id']=(int)$db->lastInsertId();
                if ($scenario==='foreign-record') $values['id']=$career['id'];
                break;
            case 'invalid-type': $values['type']='university_careers'; break;
            case 'empty-name': $values['nombre']='  '; break;
            case 'long-name': $values['nombre']=str_repeat('á',191); break;
            case 'invalid-order': $values['orden']=-1; break;
            case 'invalid-state': $values['activo']=2; break;
            default: throw new RuntimeException('Unknown scenario');
        }
        academic_catalog_save($db,$values);
        throw new RuntimeException('Invalid data accepted');
    }
    academic_catalog_save($db,array_merge($base,['type'=>'subject','career_id'=>$career['id'],'nombre'=>'Química','orden'=>2]));
    check_catalog(count(academic_catalog_tree($db,$university,true)[0]['careers'][0]['subjects'])===2,'Hierarchy');
    academic_catalog_save($db,array_merge($base,$subject,['type'=>'subject','nombre'=>'Ética','orden'=>3]));
    check_catalog(academic_catalog_tree($db,$university,true)[0]['careers'][0]['subjects'][1]['nombre']==='Ética','Rename/order');
    academic_catalog_save($db,array_merge($base,$subject,['type'=>'subject','activo'=>0]));
    check_catalog(count(academic_catalog_tree($db,$university,true)[0]['careers'][0]['subjects'])===1,'Inactive subject');
    academic_catalog_save($db,array_merge($base,$career,['type'=>'career','activo'=>0]));
    check_catalog(academic_catalog_tree($db,$university,true)[0]['careers']===[],'Inactive career');
    academic_catalog_save($db,array_merge($base,$faculty,['type'=>'faculty','activo'=>0]));
    check_catalog(academic_catalog_tree($db,$university,true)===[],'Inactive faculty');
    check_catalog(count(academic_catalog_tree($db,$university,false)[0]['careers'][0]['subjects'])===2,'Admin includes inactive descendants');
    academic_catalog_save($db,array_merge($base,$faculty,['type'=>'faculty','activo'=>1]));
    academic_catalog_save($db,array_merge($base,$career,['type'=>'career','activo'=>1]));
    check_catalog(count(academic_catalog_tree($db,$university,true)[0]['careers'][0]['subjects'])===1,'Restore preserves child visibility');
    $q=$db->prepare('DELETE FROM university_faculties WHERE id=:id');
    $q->execute(['id'=>$faculty['id']]);
    $q=$db->prepare('SELECT COUNT(*) FROM university_subjects WHERE career_id=:id');
    $q->execute(['id'=>$career['id']]);
    check_catalog((int)$q->fetchColumn()===0,'Cascade deletion');
    echo "OK: hierarchy, edit, order, visibility, restore and cascade. All fixtures rolled back.\n";
} finally {
    $db->rollBack();
}

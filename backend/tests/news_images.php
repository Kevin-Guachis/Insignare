<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$config = require __DIR__.'/../config/database.local.php';
if (!in_array($config['host'] ?? '', ['localhost','127.0.0.1','::1'], true)) {
    fwrite(STDERR, "Estas pruebas solo permiten MySQL local.\n"); exit(1);
}
require_once __DIR__.'/../helpers/news.php';
require_once __DIR__.'/../helpers/exams.php';
require_once __DIR__.'/../helpers/admissions.php';
require_once __DIR__.'/../helpers/academic_offers.php';
set_exception_handler(static function(Throwable $error): void {
    fwrite(STDERR, $error->getMessage()."\n"); exit(1);
});
function check_images(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
$db = get_database();
// Tablas de sesión: no modificar el esquema ni los datos existentes.
$newsSchema = $db->query('SHOW CREATE TABLE news')->fetch(PDO::FETCH_NUM)[1];
$db->exec(str_replace('CREATE TABLE', 'CREATE TEMPORARY TABLE', $newsSchema));
$schema = file_get_contents(__DIR__.'/../database/news_images_schema.sql');
$schema = str_replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMPORARY TABLE', $schema);
// MySQL no permite FK en tablas temporales. La migración conserva ON DELETE CASCADE.
$schema = preg_replace('/,\s*CONSTRAINT news_images_news_fk[^\n]+/', '', $schema);
$db->exec($schema);
$paths = [];
$scenario = $argv[1] ?? 'positive';
$expected = in_array($scenario, ['six','foreign-id','duplicate','unowned','invalid-image','empty-category','empty-step','empty-offer'],true) ? 422 : null;
register_shutdown_function(static function() use ($db, &$paths, $scenario, $expected): void {
    if ($db->inTransaction()) $db->rollBack();
    foreach ($paths as $path) if (is_file($path)) unlink($path);
    if ($expected !== null) {
        if (http_response_code() !== $expected) { fwrite(STDERR,"FAIL: $scenario\n"); exit(1); }
        echo "\nOK: $scenario rejected ($expected).\n";
    }
});
$images = [];
for ($i=0; $i<6; $i++) {
    $name = bin2hex(random_bytes(16)).'.png';
    $path = __DIR__.'/../uploads/images/'.$name;
    $paths[] = $path;
    file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6XQAAAAASUVORK5CYII='));
    $url = '/api/news/image.php?file='.$name;
    $_SESSION['news_additional_uploads'][$url] = true;
    $images[] = ['imagen'=>$url];
}
$db->beginTransaction();
$db->prepare('INSERT INTO news (titulo,slug,categoria,fecha,imagen,descripcion,contenido,documento,documento_nombre) VALUES (?,?,?,?,?,?,?,?,?)')
    ->execute(['Prueba','news-images-test','Prueba','2026-09-29',$images[5]['imagen'],'','Contenido','/documents/epn-guia-estudio-2026.pdf','Guía.pdf']);
$id = (int)$db->lastInsertId();
$original = find_news($db,$id);
check_images($original['additional_images'] === [], 'Noticia antigua sin imágenes');
switch ($scenario) {
    case 'six': news_additional_values($db,['additional_images'=>$images]); break;
    case 'foreign-id': news_additional_values($db,['additional_images'=>[(object)['id'=>999]]]); break;
    case 'duplicate': news_additional_values($db,['additional_images'=>[$images[0],$images[0]]]); break;
    case 'unowned': unset($_SESSION['news_additional_uploads']); news_additional_values($db,['additional_images'=>[$images[0]]]); break;
    case 'invalid-image': file_put_contents($paths[0],'not an image'); news_additional_values($db,['additional_images'=>[$images[0]]]); break;
    case 'empty-category': exam_category_values([]); break;
    case 'empty-step': admission_step_values([]); break;
    case 'empty-offer': academic_offer_values(['university_id'=>1]); break;
    case 'positive':
        check_images(news_additional_values($db,[]) === null,'Omitir imágenes debe conservarlas');
        news_save_additional($db,$id,news_additional_values($db,['additional_images'=>[]]));
        news_save_additional($db,$id,news_additional_values($db,['additional_images'=>[$images[0]]]));
        check_images(count(find_news($db,$id)['additional_images'])===1,'Guardar una imagen');
        news_save_additional($db,$id,news_additional_values($db,['additional_images'=>array_slice($images,0,5)]));
        $saved = find_news($db,$id);
        check_images(count($saved['additional_images'])===5,'Guardar cinco imágenes');
        news_save_additional($db,$id,null);
        check_images(find_news($db,$id)['additional_images']===$saved['additional_images'],'Conservar sin cambios');
        $retained = array_slice($saved['additional_images'],1);
        $items = array_map(static fn(array $image): object => (object)['id'=>$image['id']],array_reverse($retained));
        $items[] = (object)$images[5];
        news_save_additional($db,$id,news_additional_values($db,['additional_images'=>$items],$saved['additional_images']));
        $edited = find_news($db,$id);
        check_images(array_column(array_slice($edited['additional_images'],0,4),'id')===array_reverse(array_column($retained,'id')),'Conservar IDs al eliminar, agregar y reordenar');
        check_images(array_column($edited['additional_images'],'orden')===[1,2,3,4,5],'Orden consecutivo');
        check_images($edited['imagen']===$original['imagen'] && $edited['documento']===$original['documento'] && $edited['documento_nombre']===$original['documento_nombre'],'Imagen principal y PDF intactos');
        news_save_additional($db,$id,[]);
        check_images(find_news($db,$id)['additional_images']===[],'Eliminar todas las adicionales');
        check_images(is_file($paths[5]),'Conservar archivo compartido con imagen principal');
        check_images(exam_category_values(['imagen'=>$images[0]['imagen']])['nombre']==='', 'Categoría solo imagen');
        check_images(exam_category_values(['nombre'=>'Categoría'])['imagen']===null, 'Categoría solo nombre');
        check_images(admission_step_values(['imagen'=>$images[0]['imagen']])['titulo']==='', 'Etapa solo imagen');
        check_images(academic_offer_values(['university_id'=>1,'imagen'=>$images[0]['imagen']])['titulo']==='', 'Oferta solo imagen');
        echo "OK: 0/1/5 imágenes; edición; conservación; eliminación; orden; imagen principal/PDF; categorías, etapas y ofertas sin título.\n";
        break;
    default: throw new RuntimeException('Escenario desconocido');
}
if ($expected !== null) throw new RuntimeException('Se aceptó una entrada inválida');

<?php
declare(strict_types=1);
require_once __DIR__ . '/../../middleware/require_admin.php';
require_once __DIR__ . '/../../helpers/news.php';
require_method('POST');
$input=read_json_request();
$values=[];
foreach (['descripcion'=>3000,'direccion'=>500,'telefono1'=>40,'telefono2'=>40,'correo'=>190,'whatsapp'=>20] as $key=>$max) {
    $value=$input[$key]??null;
    if (!is_string($value) || strlen($value)>$max || strpos($value,"\0")!==false) error_response('Campo inválido: '.$key,422);
    $values[$key]=trim($value);
    if ($key!=='telefono2' && $values[$key]==='') error_response('Campo obligatorio: '.$key,422);
}
if (!filter_var($values['correo'],FILTER_VALIDATE_EMAIL)) error_response('Correo inválido.',422);
foreach (['telefono1','telefono2'] as $key) {
    if ($values[$key]!=='' && !preg_match('/^\\+?[0-9 ()-]{6,40}$/D',$values[$key])) error_response('Teléfono inválido.',422);
}
if (!preg_match('/^[1-9][0-9]{6,14}$/D',$values['whatsapp'])) error_response('WhatsApp debe contener el código de país y solo dígitos.',422);
$logo=$input['logo']??null;
if ($logo==='') $logo=null;
if ($logo!==null) {
    if (!is_string($logo) || strlen($logo)>255) error_response('Logo inválido.',422);
    $filename=news_image_filename($logo);
    if (!$filename || !is_file(__DIR__.'/../../uploads/images/'.$filename)) error_response('Selecciona un logo subido al sitio.',422);
}
$values['logo']=$logo;
$db=get_database();
$query=$db->prepare('UPDATE site_settings SET logo=:logo,descripcion=:descripcion,direccion=:direccion,telefono1=:telefono1,telefono2=:telefono2,correo=:correo,whatsapp=:whatsapp WHERE id=1');
$query->execute($values);
$row=$db->query('SELECT * FROM site_settings WHERE id=1')->fetch();
if (!$row) error_response('Importa primero la configuración inicial.',404);
success_response($row);

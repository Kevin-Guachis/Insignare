<?php
declare(strict_types=1);
require_once __DIR__.'/response.php';
require_once __DIR__.'/../config/database.php';
function footer_service_id($value): int {
 $id=filter_var($value,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
 if ($id===false) error_response('Identificador inválido.',422);
 return $id;
}
function footer_service_values(array $input): array {
 $name=$input['nombre']??null; $link=$input['enlace']??'';
 if (!is_string($name)||trim($name)===''||strlen($name)>190) error_response('Nombre obligatorio, máximo 190 bytes.',422);
 if (!is_string($link)||strlen($link)>500) error_response('Enlace inválido.',422);
 $link=trim($link);
 if ($link!=='') {
  // Solo rutas locales absolutas o HTTPS/HTTP. Rechazar protocolos ejecutables y //host.
  $local=preg_match('~^/(?!/)~',$link);
  $external=filter_var($link,FILTER_VALIDATE_URL) && in_array(strtolower(parse_url($link,PHP_URL_SCHEME)??''),['http','https'],true);
  if ((!$local&&!$external)||preg_match('/[\\x00-\\x20\\x7f]/',$link)||strpos($link,chr(92))!==false) error_response('Usa una ruta /pagina o una URL http/https válida.',422);
 }
 $order=filter_var($input['orden']??0,FILTER_VALIDATE_INT,['options'=>['min_range'=>0,'max_range'=>2147483647]]);
 $active=$input['activo']??1;
 if ($order===false||!in_array($active,[0,1],true)) error_response('Orden o estado inválido.',422);
 return ['nombre'=>trim($name),'enlace'=>$link?:null,'orden'=>$order,'activo'=>$active];
}
function footer_service_row(array $row): array {
 foreach (['id','orden','activo'] as $key) $row[$key]=(int)$row[$key];
 return $row;
}
function footer_service_find(PDO $db,int $id): array {
 $q=$db->prepare('SELECT * FROM footer_services WHERE id=:id');$q->execute(['id'=>$id]);
 $row=$q->fetch();if (!$row) error_response('Servicio no encontrado.',404);
 return footer_service_row($row);
}

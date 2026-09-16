<?php
declare(strict_types=1);
require_once __DIR__.'/response.php';
require_once __DIR__.'/../config/database.php';

function contact_settings_get(): array {
 $row=get_database()->query('SELECT * FROM contact_settings WHERE id=1')->fetch();
 if(!$row)error_response('Falta instalar la configuración de Contacto.',503);
 $row['id']=(int)$row['id'];
 return $row;
}
function contact_settings_values(array $input): array {
 $values=[];
 foreach(['direccion'=>500,'mapa_url'=>2000,'telefono1'=>40,'telefono2'=>40,'whatsapp1'=>15,'whatsapp2'=>15,'correo'=>190,'instagram'=>500,'tiktok'=>500,'facebook'=>500,'youtube'=>500] as $key=>$max){
  $value=$input[$key]??'';
  if(!is_string($value)||preg_match('/[\x00-\x1F\x7F]/u',$value))error_response('Campo inválido: '.$key,422);
  $value=trim($value);$length=preg_match_all('/./us',$value);
  if($length===false||$length>$max)error_response('Longitud inválida: '.$key,422);
  if(in_array($key,['direccion','mapa_url','telefono1','whatsapp1','correo'],true)&&$value==='')error_response('Campo obligatorio: '.$key,422);
  $values[$key]=$value;
 }
 if(!filter_var($values['correo'],FILTER_VALIDATE_EMAIL))error_response('Correo electrónico inválido.',422);
 foreach(['telefono1','telefono2'] as $key){
  if($values[$key]!==''&&(!preg_match('/^\+?[0-9 ()-]+$/D',$values[$key])||strlen(preg_replace('/\D/','',$values[$key]))<7||strlen(preg_replace('/\D/','',$values[$key]))>15))error_response('Teléfono inválido: '.$key,422);
 }
 foreach(['whatsapp1','whatsapp2'] as $key)if($values[$key]!==''&&!preg_match('/^[1-9][0-9]{6,14}$/D',$values[$key]))error_response('WhatsApp requiere código de país y solo dígitos.',422);
 foreach(['mapa_url','instagram','tiktok','facebook','youtube'] as $key){
  if($values[$key]==='')continue;
  $url=parse_url($values[$key]);
  // El mapa admite cualquier URL HTTPS válida, sin limitar dominio, ruta ni query.
  if(!filter_var($values[$key],FILTER_VALIDATE_URL)||!$url||strtolower($url['scheme']??'')!=='https'||empty($url['host']))error_response('Usa una URL HTTPS válida: '.$key,422);
  if($key!=='mapa_url'&&(isset($url['user'])||isset($url['pass'])))error_response('Usa una URL HTTPS válida: '.$key,422);
 }
 return $values;
}

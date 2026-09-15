<?php
declare(strict_types=1);
// No sesión, cookie, IP, agente de usuario, respuestas ni registro de eventos individuales.
require_once __DIR__.'/../../helpers/siov.php';
require_method('POST');$in=read_json_request();
if(array_diff(array_keys($in),['evento','dimension_id','minutos']))error_response('Campos no permitidos.',422);
$event=$in['evento']??'';
$types=['started'=>null,'completed'=>null,'area'=>'areas','career'=>'careers','university'=>'universities'];
if(!is_string($event)||!array_key_exists($event,$types))error_response('Evento inválido.',422);
$db=get_database();$id=0;$minutes=0;
if($types[$event]){
 $id=siov_id($in['dimension_id']??null);
 $q=$db->prepare('SELECT id FROM siov_'.$types[$event].' WHERE id=? AND activo=1');$q->execute([$id]);if(!$q->fetch())error_response('Dimensión inválida.',422);
}elseif(isset($in['dimension_id']))error_response('Dimensión no permitida.',422);
if($event==='completed'){$minutes=$in['minutos']??0;if(!is_int($minutes)||$minutes<0||$minutes>240)error_response('Duración inválida.',422);}
elseif(isset($in['minutos']))error_response('Duración no permitida.',422);
$q=$db->prepare('INSERT INTO siov_metrics (evento,dimension_id,cantidad,minutos_totales) VALUES (?,?,1,?) ON DUPLICATE KEY UPDATE cantidad=cantidad+1,minutos_totales=minutos_totales+?');
$q->execute([$event,$id,$minutes,$minutes]);success_response();

<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/siov.php';
$method=$_SERVER['REQUEST_METHOD']??'';
if(!in_array($method,['POST','PUT'],true))error_response('Método no permitido.',405);
$input=read_json_request();$type=siov_type($input['type']??null);$db=get_database();$values=siov_values($db,$type,$input);
try{
 if($method==='PUT'){
  $id=siov_id($input['id']??null);$q=$db->prepare('SELECT id FROM siov_'.$type.' WHERE id=?');$q->execute([$id]);if(!$q->fetch())error_response('Registro no encontrado.',404);
  $sets=implode(',',array_map(fn($k)=>$k.'=:'.$k,array_keys($values)));
  $q=$db->prepare('UPDATE siov_'.$type.' SET '.$sets.' WHERE id=:id');$q->execute([...$values,'id'=>$id]);
 }else{
  $keys=array_keys($values);$q=$db->prepare('INSERT INTO siov_'.$type.' ('.implode(',',$keys).') VALUES (:'.implode(',:',$keys).')');$q->execute($values);$id=(int)$db->lastInsertId();
 }
}catch(PDOException $e){if(($e->errorInfo[1]??0)===1062)error_response('El código ya existe.',422);throw $e;}
success_response(['id'=>$id,...$values]);

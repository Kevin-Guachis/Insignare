<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/siov.php';
require_method('DELETE');$input=read_json_request();$type=siov_type($input['type']??null);$id=siov_id($input['id']??null);$db=get_database();
try{$q=$db->prepare('DELETE FROM siov_'.$type.' WHERE id=?');$q->execute([$id]);}
catch(PDOException $e){if(($e->errorInfo[1]??0)===1451)error_response('El registro tiene relaciones. Desactívalo o retira primero sus relaciones.',422);throw $e;}
if(!$q->rowCount())error_response('Registro no encontrado.',404);
success_response(['id'=>$id]);

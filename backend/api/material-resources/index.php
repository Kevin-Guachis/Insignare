<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/material_resources.php';
$method=$_SERVER['REQUEST_METHOD']??'';
if(!in_array($method,['GET','POST','PUT','DELETE'],true)){header('Allow: GET, POST, PUT, DELETE');error_response('Método no permitido.',405);}
if($method!=='GET')require_once __DIR__.'/../../middleware/require_admin.php';
$db=get_database();
if($method==='GET'){
 $rows=$db->query('SELECT r.*,u.nombre university_name FROM material_resources r JOIN universities u ON u.id=r.university_id WHERE r.visible=1 AND u.activo=1 ORDER BY r.display_order,r.id DESC')->fetchAll();
 success_response(array_map('material_row',$rows));
}
$input=read_json_request();$id=$method==='POST'?null:news_id($input['id']??null);
if($id!==null)material_find($id);
if($method==='DELETE'){
 $db->prepare('DELETE FROM material_resources WHERE id=:id')->execute(['id'=>$id]);success_response();
}
$values=material_values($input);$keys=array_keys($values);
if($id===null){
 $sql='INSERT INTO material_resources ('.implode(',',$keys).') VALUES (:'.implode(',:',$keys).')';
}else{
 $sql='UPDATE material_resources SET '.implode(',',array_map(static fn($k)=>"$k=:$k",$keys)).' WHERE id=:id';
 $values['id']=$id;
}
$db->prepare($sql)->execute($values);
success_response(material_find($id??(int)$db->lastInsertId()));

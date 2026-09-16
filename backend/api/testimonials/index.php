<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/testimonials.php';
$method=$_SERVER['REQUEST_METHOD']??'';
if(!in_array($method,['GET','POST','PUT','DELETE'],true)){header('Allow: GET, POST, PUT, DELETE');error_response('Método no permitido.',405);}
if($method!=='GET')require_once __DIR__.'/../../middleware/require_admin.php';
$db=get_database();
if($method==='GET')success_response(testimonial_list($db,'testimonials',false));
$input=read_json_request();
$id=$method==='POST'?null:news_id($input['id']??null);
if($method==='DELETE'){
 testimonial_find($db,'testimonials',$id);
 $db->prepare('DELETE FROM testimonials WHERE id=:id')->execute(['id'=>$id]);success_response();
}
success_response(testimonial_write($db,'testimonials',testimonial_values($input,false),$id));

<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/testimonials.php';
$method=$_SERVER['REQUEST_METHOD']??'';
if(!in_array($method,['GET','POST','PUT','DELETE'],true)){header('Allow: GET, POST, PUT, DELETE');error_response('Método no permitido.',405);}
if(in_array($method,['PUT','DELETE'],true))require_once __DIR__.'/../../middleware/require_admin.php';
$db=get_database();
if($method==='GET')success_response(testimonial_list($db,'student_reviews',false));
$input=read_json_request();
$id=$method==='POST'?null:news_id($input['id']??null);
if($method==='DELETE'){
 testimonial_find($db,'student_reviews',$id);
 $db->prepare('DELETE FROM student_reviews WHERE id=:id')->execute(['id'=>$id]);success_response();
}
// POST es público: se guardan exclusivamente nombre, calificación y comentario.
success_response(testimonial_write($db,'student_reviews',testimonial_values($input,true,$method==='POST'),$id));

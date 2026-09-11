<?php
declare(strict_types=1);
require_once __DIR__.'/universities.php';
function academic_offer_row(array $row): array {
 foreach(['id','university_id','orden','activo'] as $key)$row[$key]=(int)$row[$key];
 return $row;
}
function academic_offer_find(PDO $db,int $id,int $parent): array {
 $q=$db->prepare('SELECT * FROM university_academic_offers WHERE id=:id AND university_id=:parent');
 $q->execute(['id'=>$id,'parent'=>$parent]);$row=$q->fetch();
 if(!$row)error_response('Oferta no encontrada.',404);
 return academic_offer_row($row);
}
function academic_offer_values(array $input): array {
 $values=['university_id'=>university_id($input['university_id']??null)];
 foreach(['titulo'=>190,'descripcion'=>8000,'boton_texto'=>190,'boton_url'=>500] as $key=>$max){
  $value=$input[$key]??'';
  if(!is_string($value)||strlen($value)>$max||strpos($value,"\0")!==false)error_response('Campo inválido: '.$key,422);
  $values[$key]=trim($value);
 }
 if($values['titulo']==='')error_response('El título es obligatorio.',422);
 $url=$values['boton_url'];
 if($url!==''){
  $local=preg_match('~^/(?!/)~',$url);
  $external=filter_var($url,FILTER_VALIDATE_URL)&&in_array(strtolower(parse_url($url,PHP_URL_SCHEME)??''),['http','https'],true);
  if((!$local&&!$external)||preg_match('/[\\x00-\\x20\\x7f]/',$url)||strpos($url,chr(92))!==false)error_response('URL inválida.',422);
  if($values['boton_texto']==='')error_response('Indica el texto del botón.',422);
 }
 $values['boton_url']=$url?:null;$values['boton_texto']=$values['boton_texto']?:null;
 $image=$input['imagen']??null;if($image==='')$image=null;
 if($image!==null){
  if(!is_string($image)||strlen($image)>255)error_response('Imagen inválida.',422);
  $filename=news_image_filename($image);
  if(!$filename||!is_file(__DIR__.'/../uploads/images/'.$filename))error_response('Selecciona una imagen subida al sitio.',422);
 }
 $values['imagen']=$image;
 $document=$input['documento']??null;if($document==='')$document=null;
 if($document!==null){
  if(!is_string($document)||strlen($document)>255||!preg_match('~^/api/news/document\\.php\\?file=([a-f0-9]{32}\\.pdf)$~D',$document,$matches)
   ||!is_file(__DIR__.'/../uploads/documents/'.$matches[1]))error_response('Selecciona un PDF subido al sitio.',422);
 }
 $name=$input['documento_nombre']??null;
 if($name!==null&&!is_string($name))error_response('Nombre de documento inválido.',422);
 $values['documento']=$document;$values['documento_nombre']=$document!==null&&$name!==null?clean_document_name($name):null;
 $order=$input['orden']??0;$active=$input['activo']??1;
 if(!is_int($order)||$order<0||$order>2147483647||!in_array($active,[0,1],true))error_response('Orden o estado inválido.',422);
 $values['orden']=$order;$values['activo']=$active;
 return $values;
}

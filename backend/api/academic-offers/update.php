<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/academic_offers.php';
require_method('PUT');$input=read_json_request();$values=academic_offer_values($input);$id=university_id($input['id']??null);$db=get_database();
$existing=academic_offer_find($db,$id,$values['university_id']);
if(!array_key_exists('documento_nombre',$input)&&$values['documento']!==null&&$values['documento']===$existing['documento'])$values['documento_nombre']=$existing['documento_nombre'];
$q=$db->prepare('UPDATE university_academic_offers SET titulo=:titulo,descripcion=:descripcion,imagen=:imagen,documento=:documento,documento_nombre=:documento_nombre,boton_texto=:boton_texto,boton_url=:boton_url,orden=:orden,activo=:activo WHERE id=:id AND university_id=:university_id');
$q->execute([...$values,'id'=>$id]);success_response(academic_offer_find($db,$id,$values['university_id']));

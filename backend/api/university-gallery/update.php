<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_gallery.php';
require_method('PUT');$input=read_json_request();$values=university_gallery_image_values($input);$id=university_id($input['id']??null);$db=get_database();
university_gallery_image_find($db,$id,$values['university_id']);
$q=image_size_prepare($db,'university_gallery','UPDATE university_gallery SET titulo=:titulo,descripcion=:descripcion,imagen=:imagen,tamano_imagen=:tamano_imagen,orden=:orden,activo=:activo WHERE id=:id AND university_id=:university_id',$values);
$q->execute([...$values,'id'=>$id]);success_response(university_gallery_image_find($db,$id,$values['university_id']));

<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/universities.php';
require_method('PUT');$input=read_json_request();$id=university_id($input['id']??null);
$values=university_values($input);$db=get_database();university_find($db,$id);
$q=$db->prepare('UPDATE universities SET nombre=:nombre,slug=:slug,logo=:logo,descripcion=:descripcion,imagen_portada=:imagen_portada,orden=:orden,activo=:activo WHERE id=:id');
university_execute($q,[...$values,'id'=>$id]);success_response(university_find($db,$id));

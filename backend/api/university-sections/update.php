<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/university_sections.php';
require_method('PUT');$input=read_json_request();$values=university_section_values($input);$id=university_id($input['id']??null);$db=get_database();
university_section_find($db,$id,$values['university_id']);
$q=$db->prepare('UPDATE university_sections SET tipo=:tipo,titulo=:titulo,orden=:orden,activo=:activo WHERE id=:id AND university_id=:university_id');
$q->execute([...$values,'id'=>$id]);success_response(university_section_find($db,$id,$values['university_id']));

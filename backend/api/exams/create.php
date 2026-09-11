<?php
declare(strict_types=1);
require_once __DIR__.'/../../middleware/require_admin.php';
require_once __DIR__.'/../../helpers/exams.php';
require_method('POST');$values=exam_values(read_json_request());$db=get_database();university_find($db,$values['university_id']);
$q=$db->prepare('INSERT INTO university_exams (university_id,titulo,descripcion_general,duracion,cantidad_preguntas,activo) VALUES (:university_id,:titulo,:descripcion_general,:duracion,:cantidad_preguntas,:activo)');
try {$q->execute($values);}catch(PDOException $e){if(($e->errorInfo[1]??null)===1062)error_response('Esta universidad ya tiene un examen.',422);throw $e;}
success_response(exam_find($db,(int)$db->lastInsertId(),$values['university_id']));

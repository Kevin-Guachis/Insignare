<?php
declare(strict_types=1);
require_once __DIR__.'/universities.php';

// SQL identifiers come exclusively from this allowlist, never from request input.
function academic_catalog_type($type): array {
    $types = [
        'faculty' => ['table'=>'university_faculties', 'parent'=>'university_id'],
        'career' => ['table'=>'university_careers', 'parent'=>'faculty_id'],
        'subject' => ['table'=>'university_subjects', 'parent'=>'career_id'],
    ];
    if (!is_string($type) || !isset($types[$type])) error_response('Tipo inválido.',422);
    return $types[$type];
}

function academic_catalog_source(string $type): string {
    switch ($type) {
        case 'faculty': return 'university_faculties n';
        case 'career': return 'university_careers n JOIN university_faculties f ON f.id=n.faculty_id';
        case 'subject': return 'university_subjects n JOIN university_careers c ON c.id=n.career_id JOIN university_faculties f ON f.id=c.faculty_id';
        default: error_response('Tipo inválido.',422);
    }
}

function academic_catalog_scope(string $type): string {
    return $type === 'faculty' ? 'n.university_id' : 'f.university_id';
}

function academic_catalog_row(array $row): array {
    foreach (['id','university_id','faculty_id','career_id','orden','activo'] as $key) {
        if (isset($row[$key])) $row[$key]=(int)$row[$key];
    }
    return $row;
}

function academic_catalog_find(PDO $db,string $type,int $id,int $university): array {
    $q=$db->prepare('SELECT n.* FROM '.academic_catalog_source($type).' WHERE n.id=:id AND '.academic_catalog_scope($type).'=:university');
    $q->execute(['id'=>$id,'university'=>$university]);
    $row=$q->fetch();
    if (!$row) error_response('Registro no encontrado en esta universidad.',404);
    return academic_catalog_row($row);
}

function academic_catalog_tree(PDO $db,int $university,bool $public): array {
    $rows=[];
    foreach (['faculty','career','subject'] as $type) {
        $visible=$public ? ' AND n.activo=1' : '';
        if ($public && $type!=='faculty') $visible.=' AND f.activo=1';
        if ($public && $type==='subject') $visible.=' AND c.activo=1';
        $q=$db->prepare('SELECT n.* FROM '.academic_catalog_source($type).' WHERE '.academic_catalog_scope($type).'=:university'.$visible.' ORDER BY n.orden,n.id');
        $q->execute(['university'=>$university]);
        $rows[$type]=array_map('academic_catalog_row',$q->fetchAll());
    }
    $subjects=[];
    foreach ($rows['subject'] as $row) $subjects[$row['career_id']][]=$row;
    $careers=[];
    foreach ($rows['career'] as $row) {
        $row['subjects']=$subjects[$row['id']]??[];
        $careers[$row['faculty_id']][]=$row;
    }
    return array_map(static function(array $row) use ($careers): array {
        $row['careers']=$careers[$row['id']]??[];
        return $row;
    },$rows['faculty']);
}

function academic_catalog_save(PDO $db,array $input): array {
    $type=$input['type']??null;
    $definition=academic_catalog_type($type);
    $university=university_id($input['university_id']??null);
    university_find($db,$university);
    $id=isset($input['id']) ? university_id($input['id']) : null;
    if ($id!==null) academic_catalog_find($db,$type,$id,$university);
    $name=$input['nombre']??null;
    if (!is_string($name) || trim($name)==='' || preg_match('//u',$name)!==1 || preg_match('/[\x00-\x1f\x7f]/',$name)) error_response('Nombre inválido.',422);
    $name=trim($name);
    if (preg_match_all('/./us',$name)>190) error_response('El nombre admite hasta 190 caracteres.',422);
    $order=$input['orden']??0;
    $active=$input['activo']??1;
    if (!is_int($order)||$order<0||$order>2147483647||!in_array($active,[0,1],true)) error_response('Orden o estado inválido.',422);
    $parent=$type==='faculty' ? $university : university_id($input[$definition['parent']]??null);
    if ($type!=='faculty') academic_catalog_find($db,$type==='career'?'faculty':'career',$parent,$university);
    $values=['nombre'=>$name,'orden'=>$order,'activo'=>$active,'parent'=>$parent];
    $table=$definition['table'];
    $parentColumn=$definition['parent'];
    if ($id===null) {
        $q=$db->prepare("INSERT INTO $table (nombre,orden,activo,$parentColumn) VALUES (:nombre,:orden,:activo,:parent)");
    } else {
        $values['id']=$id;
        $q=$db->prepare("UPDATE $table SET nombre=:nombre,orden=:orden,activo=:activo,$parentColumn=:parent WHERE id=:id");
    }
    $q->execute($values);
    return academic_catalog_find($db,$type,$id??(int)$db->lastInsertId(),$university);
}

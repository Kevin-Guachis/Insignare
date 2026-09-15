<?php
declare(strict_types=1);
require_once __DIR__.'/response.php';
require_once __DIR__.'/../config/database.php';
function siov_types(): array {
 return [
 'areas'=>['codigo'=>16,'nombre'=>255,'color'=>7,'descripcion'=>8000],
 'questions'=>['area_id'=>'areas','texto'=>4000],
 'careers'=>['area_id'=>'areas','nombre'=>255,'relacionada'=>'bool'],
 'universities'=>['codigo'=>16,'nombre'=>255,'url'=>500,'tipoPrueba'=>255],
 'career_universities'=>['career_id'=>'careers','university_id'=>'universities','facultad'=>255,'titulo'=>255,'duracion'=>255,'modalidad'=>255,'campoLaboral'=>8000],
 ];
}
function siov_type($type): string {
 if(!is_string($type)||!array_key_exists($type,siov_types()))error_response('Tipo de contenido inválido.',422);
 return $type;
}
function siov_id($value): int {
 if(filter_var($value,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]])===false)error_response('Identificador inválido.',422);
 return (int)$value;
}
function siov_row(array $row): array {
 foreach(['id','area_id','career_id','university_id','orden','activo','relacionada','cantidad','dimension_id','minutos_totales'] as $key)if(isset($row[$key]))$row[$key]=(int)$row[$key];
 return $row;
}
function siov_rows(PDO $db,string $type,bool $public=false): array {
 return array_map('siov_row',$db->query('SELECT * FROM siov_'.$type.($public?' WHERE activo=1':'').' ORDER BY orden,id')->fetchAll());
}
function siov_values(PDO $db,string $type,array $input): array {
 $out=[];
 foreach(siov_types()[$type] as $key=>$rule){
  $v=$input[$key]??'';
  if($rule==='bool'){if(!in_array($v,[0,1],true))error_response('Estado inválido.',422);$out[$key]=$v;continue;}
  if(is_string($rule)){
   $id=siov_id($v);$q=$db->prepare('SELECT id FROM siov_'.$rule.' WHERE id=?');$q->execute([$id]);
   if(!$q->fetch())error_response('La relación seleccionada no existe.',422);
   $out[$key]=$id;continue;
  }
  if(!is_string($v)||strlen($v)>$rule||str_contains($v,"\0"))error_response('Campo inválido: '.$key,422);
  $out[$key]=trim($v);
  if(in_array($key,['codigo','nombre','texto','color','url'])&&$out[$key]==='')error_response('Campo obligatorio: '.$key,422);
 }
 if(isset($out['codigo'])&&!preg_match('/^[A-Z0-9_-]{1,16}$/D',$out['codigo']))error_response('Código inválido.',422);
 if(isset($out['color'])&&!preg_match('/^#[0-9a-fA-F]{6}$/D',$out['color']))error_response('Color inválido.',422);
 if(isset($out['url'])&&(!filter_var($out['url'],FILTER_VALIDATE_URL)||!in_array(strtolower(parse_url($out['url'],PHP_URL_SCHEME)??''),['https','http'],true)))error_response('URL inválida.',422);
 $out['orden']=$input['orden']??0;$out['activo']=$input['activo']??1;
 if(!is_int($out['orden'])||$out['orden']<0||$out['orden']>2147483647||!in_array($out['activo'],[0,1],true))error_response('Orden o estado inválido.',422);
 return $out;
}

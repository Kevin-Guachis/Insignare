<?php
declare(strict_types=1);
require_once __DIR__.'/../../helpers/material_resources.php';
require_method('GET');
$id=news_id($_GET['id']??null);
$q=get_database()->prepare('SELECT r.* FROM material_resources r JOIN universities u ON u.id=r.university_id WHERE r.id=:id AND r.visible=1 AND u.activo=1');
$q->execute(['id'=>$id]);$row=$q->fetch();
if(!$row||!preg_match('~^/api/news/document\.php\?file=([a-f0-9]{32}\.pdf)$~D',$row['file_path'],$match))error_response('Documento no encontrado.',404);
$path=__DIR__.'/../../uploads/documents/'.$match[1];
if(!is_file($path))error_response('Documento no encontrado.',404);
$name=clean_document_name($row['file_name']);
$mode=($_GET['download']??'')==='1'?'attachment':'inline';
header('Content-Type: application/pdf');
header("Content-Disposition: ".$mode."; filename=\"documento.pdf\"; filename*=UTF-8''".rawurlencode($name));
header('Content-Length: '.filesize($path));
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; sandbox");
readfile($path);

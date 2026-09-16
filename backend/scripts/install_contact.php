<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
require_once __DIR__.'/../config/database.php';
try {
 $sql=file_get_contents(__DIR__.'/../database/contact_settings_schema.sql');
 if($sql===false)throw new RuntimeException();
 get_database()->exec($sql);
 echo "Configuración de Contacto instalada sin sobrescribir valores existentes.\n";
} catch(Throwable $error){
 fwrite(STDERR,"No se pudo instalar Contacto. Revisa la conexión y los permisos de base de datos.\n");exit(1);
}

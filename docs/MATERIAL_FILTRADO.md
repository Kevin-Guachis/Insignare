# Material Filtrado

Importar manualmente backend/database/material_resources_schema.sql en la base configurada.
Requiere la tabla universities existente. No crea universidades ni inserta datos de prueba.

Ruta pública: /material-filtrado. Panel: Material Filtrado.

APIs bajo /api/material-resources/:
- index.php: GET público; POST crear, PUT editar/visibilidad y DELETE eliminar, protegidos.
- admin.php: GET protegido, incluye ocultos.
- upload.php: GET protegido informa límites efectivos de PHP; POST protegido recibe el campo multipart documento y reutiliza la subida PDF compartida.
- file.php?id=ID: PDF público visible de universidad activa; download=1 fuerza descarga.

PDFs: backend/uploads/documents/, nombres físicos aleatorios y nombre visible en file_name.
El directorio existente debe ser escribible por PHP. Mantener su protección contra ejecución.
El máximo de la aplicación es 800 MB (800 * 1024 * 1024 bytes). Para admitirlo,
PHP debe admitir upload_max_filesize=800M y post_max_size=820M. Material Filtrado
consulta los valores activos antes de transferir y explica si PHP admite menos.
También se comprueba CONTENT_LENGTH para detectar peticiones que excedan
post_max_size, incluso cuando PHP vacía $_FILES. Un límite HTTP del hosting puede
rechazar antes de ejecutar PHP; el cliente informa el error HTTP 413.
backend/.user.ini ya contiene los límites deseados, pero su existencia no garantiza
que el servidor los aplique. Consulta también README.md.
No se eliminan archivos físicos compartidos al borrar/reemplazar recursos; se actualiza la referencia.

WhatsApp reutiliza frontend/src/config/siteConfig.js, igual que el botón flotante actual.
El formulario abre WhatsApp con el mensaje y no envía sus datos a la API ni a la BD.
No desarrolla ni modifica el simulador externo.

## Validación y seguridad de PDF

Se conservan administrador autenticado, POST y control de origen, subida HTTP
sin errores de PHP, extensión .pdf, tamaño real no vacío y máximo de 800 MB.
El validador lee 8 KiB iniciales y hasta 64 KiB finales: firma %PDF, objetos PDF,
startxref con posición dentro del contenido y cierre %%EOF sin código añadido.
No recorre imágenes, busca etiquetas PHP ni intenta descifrar el documento.
Se amplió la ventana de cierre y se eliminó la exigencia de bytes exactos en la
posición startxref, que no era un análisis completo del formato.

fileinfo es complementario: si existe se usa sobre la muestra inicial y se
rechazan tipos contradictorios o fallos de detección. application/pdf,
application/x-pdf y el tipo genérico application/octet-stream continúan a las
comprobaciones estructurales. Si fileinfo falta se aplican exactamente las mismas
comprobaciones de firma y estructura: nunca se acepta solo por extensión o por
el Content-Type enviado por el navegador. Los PDF cifrados no se rechazan por cifrado.

Esta comprobación de formato es acotada, no un parser completo. La prohibición de
ejecutar scripts depende del directorio protegido: conservar Require all denied,
SetHandler none y RemoveHandler/RemoveType en uploads/documents/.htaccess.
Los nombres son aleatorios de 128 bits con extensión fija .pdf; se reserva el
destino de forma exclusiva para no reemplazar documentos existentes. Se mantienen
las comprobaciones de escritura y move_uploaded_file. Los endpoints de entrega
admiten únicamente identificadores/nombres controlados y usan readfile,
Content-Type application/pdf, nosniff y CSP sandbox, sin interpretar el contenido.

Los cuatro formularios PDF (Material Filtrado, Noticias, Ofertas Académicas y
Documentos de Universidades) comparten un modal SweetAlert con nombre de archivo,
barra de progreso y etapas. El modal se cierra antes de mostrar éxito o error y
mantiene el estilo de las alertas del panel. El transporte está centralizado en
frontend/src/services/pdfUpload.js y el modal en frontend/src/utils/alerts.js.

La interfaz muestra Subiendo (porcentaje enviado), Validando PDF (espera de la
respuesta de subida, incluido su almacenamiento) y Guardando recurso (guardado de
la referencia del recurso). No se simula un porcentaje de validación. La consulta
de límites espera hasta 15 s; la subida permite 1 hora con un máximo de 2 minutos
sin progreso y 5 minutos de espera tras enviarse; guardar el recurso espera hasta
60 s. Los errores liberan el botón mediante finally. Si el guardado agota su
tiempo, se pide comprobar los datos antes de repetir para evitar duplicados.

## Pruebas y despliegue de esta corrección

Pruebas locales ejecutadas con y sin fileinfo: PDF pequeño, PDF de imagen generado
de 799 MB con bytes <?= y <?php en el stream, PDF cifrado RC4 generado con jsPDF
(contraseña de prueba insignare-test), 19 PDF existentes, relleno tras EOF y
archivos vacíos, falsos, truncados o con referencia fuera del archivo.
Pico de memoria de la prueba grande: 4 MB con memory_limit=32M.
La imagen sintética comprueba streams binarios; no se dispuso del escaneo original
que dio el error. También se prueban límites PHP menores, progreso, error 413 y
recuperación por tiempos de espera. Sintaxis PHP, ESLint y build verificados.

Para la mejora posterior del modal compartido, las pruebas de los cuatro
endpoints y ESLint pasaron. Su compilación de producción quedó pendiente porque
Vite no pudo iniciar procesos en el sandbox (EPERM) y se rechazó la ejecución
fuera del sandbox. Ejecutar `npm run build` desde frontend antes de publicar esta
mejora; el dist anterior no incluye el modal.

Repetir desde la raíz:

```powershell
php -d memory_limit=32M backend/tests/pdf_upload_test.php --large
php -d extension=fileinfo -d memory_limit=32M backend/tests/pdf_upload_test.php --large
node --test frontend/tests/material-upload.test.mjs
```

La segunda orden es para PHP con fileinfo disponible pero no activado; no duplicar
la carga si ya está habilitado. Las pruebas eliminan sus PDF temporales grandes.

En Hostinger actualizar backend/helpers/pdf_upload.php,
backend/api/news/upload_document.php y backend/uploads/documents/.htaccess,
respetando la ubicación equivalente del backend en el hosting. Publicar el
contenido generado de frontend/dist/ en el directorio público del frontend.
El endpoint compartido beneficia a Noticias, Ofertas Académicas y Documentos de
Universidades sin cambiar sus contratos POST. No cambiar base de datos.
Los tests, la fixture cifrada y esta documentación no necesitan publicarse.

No se ha accedido a Hostinger: después del despliegue verificar los límites que
devuelve GET /api/material-resources/upload.php con sesión de administrador y
que una URL directa de uploads/documents devuelve 403. El servidor PHP integrado
no aplica .htaccess, por lo que esa protección debe comprobarse en Apache/LiteSpeed.

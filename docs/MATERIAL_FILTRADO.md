# Material Filtrado

Importar manualmente backend/database/material_resources_schema.sql en la base configurada.
Requiere la tabla universities existente. No crea universidades ni inserta datos de prueba.

Ruta pública: /material-filtrado. Panel: Material Filtrado.

APIs bajo /api/material-resources/:
- index.php: GET público; POST crear, PUT editar/visibilidad y DELETE eliminar, protegidos.
- admin.php: GET protegido, incluye ocultos.
- upload.php: POST protegido, campo multipart documento, reutiliza subida PDF actual.
- file.php?id=ID: PDF público visible de universidad activa; download=1 fuerza descarga.

PDFs: backend/uploads/documents/, nombres físicos aleatorios y nombre visible en file_name.
El directorio existente debe ser escribible por PHP. Mantener su protección contra ejecución.
PHP debe admitir upload_max_filesize=800M y post_max_size=820M. Consulta la configuración de subidas PDF en README.md.
No se eliminan archivos físicos compartidos al borrar/reemplazar recursos; se actualiza la referencia.

WhatsApp reutiliza frontend/src/config/siteConfig.js, igual que el botón flotante actual.
El formulario abre WhatsApp con el mensaje y no envía sus datos a la API ni a la BD.
No desarrolla ni modifica el simulador externo.

Sin pruebas, build ni lint ejecutados, según lo solicitado. SQL pendiente de importación manual.
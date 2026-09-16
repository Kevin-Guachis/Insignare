# Testimonios y opiniones

Ruta pública: `/testimonials/` (enlace ALUMNOS existente).
Panel: Testimonios → Testimonios con fotos / Opiniones de alumnos.

## Preparación
Importar `backend/database/testimonials_schema.sql` en la base configurada.
Crea `testimonials` y `student_reviews`; no inserta testimonios ficticios ni cambia datos existentes.
Instalación desde la raíz: `php backend/scripts/install_testimonials.php`.
El comando usa la conexión existente, crea las tablas ausentes y comprueba sus columnas sin borrar datos.
La estructura ya fue aplicada a la base local durante la corrección del error MySQL 1146 (tablas ausentes).

## API
- `/api/testimonials/index.php`: GET público paginado; POST, PUT y DELETE administrativos.
- `/api/testimonials/admin.php`: GET administrativo de todos los testimonios.
- `/api/testimonials/upload.php`: POST administrativo multipart, campo `imagen`.
- `/api/reviews/index.php`: GET público paginado y POST público; PUT y DELETE administrativos.
- `/api/reviews/admin.php`: GET administrativo con todas las opiniones e indicadores.

Los GET públicos aceptan `page` y devuelven `items` y `hasMore` (24 por página).
Las opiniones se publican con `activo=1`, sin moderación previa. Ocultar no elimina;
eliminar es definitivo, con confirmación SweetAlert. No existen estados de aprobación.

## Archivos y datos
Fotografías: JPG/JPEG, PNG y WEBP, hasta 5 MB, mismas validaciones y nombres
aleatorios que noticias. Se almacenan en `backend/uploads/images/` y se sirven
mediante el endpoint seguro existente. No se borran archivos compartidos al eliminar
un registro; se elimina el testimonio de la base.

Nombre: 120 caracteres; comentario: 2000; estrellas: entero de 1 a 5.
Solo se guardan nombre, comentario, calificación, visibilidad y fechas técnicas.
No se incorporan IP, correo, teléfono, perfiles ni cookies de seguimiento.
Los indicadores incluyen opiniones visibles y ocultas, excluyendo las eliminadas.
Se conserva la protección actual de sesión, origen y JSON; los textos se renderizan
con React sin interpretar HTML.

## Revisión manual
Después de importar SQL, agregar un testimonio con fotografía desde el panel;
enviar una opinión en la página pública; revisar indicadores y editar, ocultar,
reactivar y eliminar registros. Comprobar escritorio/tablet/móvil.
No se ejecutaron pruebas, build ni lint en esta entrega, según lo solicitado.

## Galería independiente
La galería utiliza titulo, imagen, orden y activo; las opiniones mantienen nombre,
calificacion, comentario y activo en student_reviews. El instalador aplica
testimonials_gallery_migration.sql a esquemas antiguos: nombre pasa a titulo;
comentario y detalle se conservan como comentario_legacy y detalle_legacy,
sin exposición en API ni edición pública. Migración aplicada a la base local.

Ambos carruseles avanzan cada 5000 ms, con pausa manual y durante hover, foco
o visor abierto. Las opiniones se muestran completas. El visor permite cerrar
con Escape, navegar con flechas y conserva las proporciones originales.
No se ejecutaron pruebas, build ni lint en este ajuste.
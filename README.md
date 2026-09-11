# Insignare

- Frontend: React + Vite.
- Backend: PHP 8+ con PDO MySQL y sesiones. Acceso administrativo y gestión de noticias del Home.

## Preparación local

Necesitas PHP 8+ con la extensión `pdo_mysql`, MySQL y Node/npm para Vite.
Comprueba `php --version`, `php -m` y `mysql --version`. Si no están en PATH,
usa la ruta de sus ejecutables o agrégalos al PATH.

Desde la raíz, crea la base con tu usuario MySQL (la contraseña se pide en terminal):

```sh
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS insignare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p insignare_db
```

Dentro del cliente MySQL:

```sql
SOURCE backend/database/schema.sql;
EXIT;
```

También puedes importar `backend/database/schema.sql` con MySQL Workbench,
seleccionando antes `insignare_db`. El esquema no incluye usuarios ni contraseñas.

Copia `backend/config/database.example.php` a `backend/config/database.local.php`
y ajusta estos valores con tus credenciales reales:

```php
<?php
return [
    'host' => 'localhost',
    'port' => 3306,
    'database' => 'insignare_db',
    'username' => 'TU_USUARIO_MYSQL',
    'password' => 'TU_CONTRASEÑA_MYSQL',
];
```

El archivo local está ignorado por Git. No pongas credenciales en React ni en el ejemplo.

## Crear el único administrador

Desde una terminal interactiva:

```sh
cd backend
php scripts/create_admin.php
```

Solicita nombre, correo y contraseña oculta (PowerShell en Windows, stty en Unix).
La contraseña debe tener al menos 10 caracteres y hasta 72 bytes para evitar
truncamiento con bcrypt/PASSWORD_DEFAULT. No se imprime ni se almacena en texto plano.
El script comprueba correo duplicado y rechaza un segundo administrador; serializa
la creación mediante un bloqueo MySQL. No existe registro público ni usuario precargado.

## Ejecutar

Terminal 1, desde la raíz:

```sh
php -S localhost:8000 -t backend
```

Terminal 2, desde la raíz:

```sh
cd frontend
npm install
npm run dev
```

Abre `/gestion-insignare` en el origen de Vite. Login correcto lleva a
`/gestion-insignare/panel`. El proxy envía `/api` a `http://localhost:8000`,
conservando Host y las cookies. No uses dos orígenes distintos en el código React.

## API y seguridad

- POST `/api/auth/login.php`: JSON `email` y `password`.
- GET `/api/auth/session.php`: sesión actual o `authenticated: false`.
- POST `/api/auth/logout.php`: JSON vacío `{}`.
- GET `/api/admin/me.php`: requiere sesión; devuelve 401 sin ella.

Las peticiones POST requieren `Content-Type: application/json` y
`X-Requested-With: XMLHttpRequest`; el servicio frontend las añade. No se permite
CORS entre orígenes. Se comprueba Origin cuando está presente.
No se usa localStorage, sessionStorage ni JWT.

La cookie es HttpOnly, SameSite=Lax y Secure bajo HTTPS; usa el ámbito `/api`.
El login renueva el ID de sesión. Las únicas claves de sesión son
`admin_id`, `admin_name` y `admin_email`.
La ruta de React solo protege la vista: todos los futuros endpoints privados deben
incluir `backend/middleware/require_admin.php`.

Referencias: [sesiones PHP](https://www.php.net/manual/en/session.security.ini.php)
y [password_hash](https://www.php.net/manual/en/function.password-hash.php).

## Validación

Desde frontend: `npm run build` y `npm run lint`.

En PowerShell, desde la raíz:

```powershell
Get-ChildItem backend -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
```

Con PHP, la base configurada y el administrador creado:

1. Login incorrecto: mensaje genérico, sin sesión nueva.
2. Login correcto: panel con nombre y correo.
3. Refrescar el panel: permanece autenticado.
4. Ventana privada: el panel redirige al login y `/api/admin/me.php` responde 401.
5. Con sesión: `/api/admin/me.php` responde 200 y datos básicos.
6. Cerrar sesión: vuelve al login; panel protegido y endpoint 401.
7. Comprobar Home, noticias y `/siov/index.html`.

## Producción futura

Servir frontend y `/api` bajo el mismo origen HTTPS. El servidor de PHP incorporado
es solo para desarrollo. El proxy de Vite no se incluye en el build.
En Apache/Hostinger, conservar las restricciones de `backend/.htaccess` y no exponer
configuración, scripts ni SQL. Configurar `database.local.php` únicamente en el servidor.
Si hay un proxy HTTPS delante de PHP, configurar HTTPS desde el servidor de confianza;
no confiar automáticamente en cabeceras reenviadas por clientes.

## Noticias del Home

Con la conexión local ya configurada, importa en insignare_db, en este orden:

```sql
SOURCE backend/database/news_schema.sql;
SOURCE backend/database/seed_news.sql;
```

También puedes ejecutar estos archivos desde MySQL Workbench. El seed es opcional:
agrega UCE, EPN y ESPE sin reemplazar noticias existentes. La tabla news incluye
un slug estable adicional para conservar /noticias/:slug, incluso al editar el título.

En /gestion-insignare/panel:
1. Pulsa Nueva noticia, completa título, categoría y fecha; agrega imagen y textos.
2. Guarda y comprueba el Home y el detalle.
3. Edita desde la tabla. Ocultar cambia activo a 0, sin borrar el registro.
4. Para restaurar una noticia, edítala y marca Visible en el Home.
5. Cierra sesión: las operaciones administrativas deben responder 401.

Endpoints:
- GET /api/news/list.php: solo noticias activas.
- GET /api/news/admin_list.php: todas las noticias, requiere administrador.
- POST /api/news/create.php y update.php: JSON; update incluye id.
- POST /api/news/delete.php: JSON con id; ocultación.
- POST /api/news/upload.php: FormData con campo imagen, requiere administrador.
- GET /api/news/image.php?file=...: sirve exclusivamente imágenes subidas válidas.

El servicio existente añade cookies y la cabecera X-Requested-With también a
FormData, dejando que el navegador defina su Content-Type y boundary.
Las imágenes admitidas son JPG/JPEG, PNG y WebP, hasta 5 MiB, 8000 px por lado
y 40 megapíxeles. Se comprueba el tipo real y se generan nombres aleatorios.
uploads/images debe ser escribible por PHP; no habilitar ejecución ni acceso
directo a esa carpeta. Las imágenes públicas se sirven mediante image.php.

Si PHP tiene un límite menor de subida, inicia el servidor local así:
```sh
php -d upload_max_filesize=5M -d post_max_size=6M -S localhost:8000 -t backend
```

TopStories, FeaturedNews y NewsDetail comparten los datos de la API. El Home
refresca cada 30 segundos mientras la pestaña está visible, al recuperar foco
y al recibir cambios del panel en otra pestaña del mismo origen.
No hay caché de autenticación ni noticias en localStorage/sessionStorage.
Los PDF se administran mediante el campo documento; ver la sección siguiente.

## Documentos PDF de noticias

Para una base existente, ejecuta UNA vez backend/database/news_document_schema.sql
después de news_schema.sql. Añade documento VARCHAR(255) NULL sin borrar noticias.
En instalaciones nuevas: news_schema.sql, seed_news.sql (opcional) y después
news_document_schema.sql. No vuelvas a ejecutar la migración si la columna ya existe.

Cada noticia admite un PDF. Se conserva el documento anterior de UCE y, para EPN,
Lineamientos para la admisión. La guía de estudio EPN permanece en frontend/public/documents;
ya no se añade automáticamente por slug.

En el formulario, selecciona Documento PDF para subir o reemplazar, o pulsa Quitar
documento. Los cambios se aplican al guardar. Quitar guarda NULL. Eliminar la referencia
no borra físicamente archivos anteriores; no hay limpieza automática de archivos huérfanos.
El nombre almacenado y mostrado después de guardar es el nombre seguro generado por el servidor.

- POST /api/news/upload_document.php: FormData, campo documento; requiere administrador.
- GET /api/news/document.php?file=nombre.pdf: sirve el PDF con Content-Type application/pdf.
- create.php/update.php reciben documento como ruta o null.
- Archivos nuevos: backend/uploads/documents/<32 caracteres hexadecimales>.pdf.
- MySQL guarda únicamente /api/news/document.php?file=..., nunca el contenido binario.
- El detalle conserva los estilos y visor actuales y ofrece Ver documento PDF en nueva pestaña.
- Extensión PDF, firma/cierre PDF, comprobación MIME cuando fileinfo está disponible,
  máximo 10 MiB. Los archivos se sirven por PHP; .htaccess bloquea acceso directo en Apache.

Para permitir hasta 10 MiB en desarrollo:
```sh
php -d upload_max_filesize=10M -d post_max_size=12M -S localhost:8000 -t backend
```
En producción configura esos límites y permisos de escritura de uploads/documents
en el servidor. Conserva la prohibición de ejecución/acceso directo a uploads.

## Convenciones del panel administrativo

- Usar Bootstrap Icons para acciones de filas: bi-pencil para editar, bi-eye para elementos activos y bi-eye-slash para inactivos, bi-trash para eliminar.
- Colores: editar en azul institucional (var(--color-accent)); visibilidad activa en amarillo oscuro (#a87800), inactiva en gris (#64748b); eliminar en rojo (#dc2626). El color no sustituye el nombre accesible.
- Los controles son botones reales con type, title (tooltip), aria-label descriptivo e iconos aria-hidden. Mantener foco visible, hover, estado disabled y área de interacción mínima de 44 px.
- Usar admin-news-primary para acciones principales y admin-news-secondary para acciones secundarias o iconos. Guardar configuración afecta únicamente al formulario de contacto; Servicios tiene su propio guardado.
- Separar módulos en tarjetas admin-news__card, con título claro, descripción breve cuando aporte contexto y 24 px entre tarjetas independientes.
- Mantener tablas en escritorio. A 650 px o menos, presentar las filas como tarjetas con etiquetas data-label, acciones que puedan saltar de línea y textos largos que se ajusten. Evitar desbordamiento horizontal del documento.
- Antes de eliminar, mostrar una confirmación que identifique el registro, con Cancelar y Eliminar. Deshabilitar los controles durante la operación y presentar errores sin perder los datos.


## Ingreso a la U: fase 1

Importa backend/database/universities_schema.sql en la base configurada. Crea la tabla
universities (id, nombre, slug único, logo, descripcion, imagen_portada, orden, activo,
created_at, updated_at), con utf8mb4. No inserta universidades ni credenciales ficticias.

En el panel, abre Universidades y crea un registro. El slug admite minúsculas, números
y guiones; debe ser único. Cambiarlo modifica la URL pública. Logo y portada son opcionales.
Las acciones de editar, activar/desactivar y eliminar usan Bootstrap Icons, los colores
y etiquetas accesibles definidos en las convenciones anteriores. La eliminación pide
confirmación y conserva los archivos físicos, que podrían estar compartidos.

Rutas públicas:
- /ingreso-a-la-u: listado de universidades activas, ordenadas por orden e id.
- /ingreso-a-la-u/:slug: una única plantilla UniversityPage. Un slug inexistente o inactivo muestra 404.
El Navbar existente se conserva; el módulo puede abrirse directamente por su ruta.

API en backend/api/universities:
- GET list.php: público, solo activas.
- GET admin.php: listado administrativo.
- POST create.php: crear.
- PUT update.php: editar, incluido orden y activo.
- DELETE delete.php: eliminar por id.
- POST upload.php: FormData con imagen; sirve para logo y portada.

Todos los endpoints administrativos reutilizan require_admin y las sesiones existentes.
La subida reutiliza la implementación actual de noticias sin modificarla: JPG/JPEG,
PNG y WebP, hasta 5 MiB, 8000 px por lado y 40 megapíxeles, con validación del tipo,
nombres aleatorios y almacenamiento en backend/uploads/images. MySQL guarda las rutas.
Los slugs duplicados devuelven un error de validación, sin detalles SQL.

Organización frontend:
- pages/IngresoAU.jsx: listado.
- components/university/UniversityCard.jsx y UniversityPage.jsx: tarjeta y plantilla.
- components/admin/UniversitiesAdmin.jsx y UniversityForm.jsx: administración.
- services/universities.js y hooks/useUniversities.js: API y actualización de datos.
- styles/universities.css: estilos públicos limitados a este módulo.
Se reutilizan el servicio fetch, estilos administrativos, Header y Footer existentes.
Sin nuevas dependencias. Las vistas públicas refrescan al recuperar foco, cada 30 segundos
y tras recibir una notificación del panel en otra pestaña del mismo origen.

Prueba: crear una universidad, subir logo/portada, editarla, abrir listado y detalle,
desactivar/activar y comprobar que no se publica estando inactiva. Revisar también
rechazo de slug duplicado y acceso 401 a las operaciones sin sesión.

Pendiente para fase 2: proceso de admisión, examen, documentos y galería.


## Ingreso a la U: fase 2, secciones por universidad

Importa backend/database/university_sections_schema.sql después de universities_schema.sql.
Crea university_sections: id, university_id, tipo, titulo, orden, activo y timestamps.
La clave foránea apunta a universities. Eliminar definitivamente una universidad elimina
también sus secciones (ON DELETE CASCADE); desactivarla conserva todos sus datos.
No se insertan secciones predeterminadas: cada universidad define las que necesita.

Tipos disponibles:
- admission: Proceso de admisión.
- exam: Estructura del examen.
- academic_offer: Oferta académica.
- documents: Documentos.
- gallery: Galería.

Dentro de Universidades, edita una universidad guardada y utiliza Secciones.
La universidad se asigna automáticamente. El formulario de secciones es independiente
del formulario de información general. Permite título, tipo, orden y estado, con
acciones Bootstrap Icons, confirmación al eliminar y tabla adaptable a tarjetas móviles.

API en backend/api/university-sections:
- GET list.php?university_id=ID: público, devuelve únicamente secciones activas de una universidad activa.
- GET admin.php?university_id=ID: todas las secciones, requiere sesión.
- POST create.php: university_id, tipo, titulo, orden, activo.
- PUT update.php: los mismos campos e id.
- DELETE delete.php: id y university_id.

Los endpoints reutilizan require_admin y las respuestas JSON existentes. El helper
university_sections.php valida tipos, títulos, orden, estado y pertenencia de la sección.
No se permite mover una sección a otra universidad mediante la edición.

Frontend:
- UniversitySectionsAdmin.jsx: lista y formulario dentro de la edición.
- universitySections.js: servicio API, con cookies y notificaciones entre pestañas.
- useUniversitySections.js: carga por universidad, refresco y estados de error.
- UniversitySectionRenderer.jsx: selecciona un componente por tipo, filtra y ordena.
- universitySectionTypes.js: etiquetas del selector administrativo.
Por ahora todas las secciones muestran su título y Contenido próximamente.

Para agregar un tipo futuro:
1. Añadir el identificador a UNIVERSITY_SECTION_TYPES en el helper PHP.
2. Añadir su etiqueta a universitySectionTypes.js.
3. Crear el componente público y registrarlo en renderers de UniversitySectionRenderer.
4. Crear la estructura específica de contenido cuando se implemente esa fase.
El campo tipo es VARCHAR; no requiere cambiar un ENUM. Los tipos desconocidos no se renderizan.

Pendiente: contenido real de admisión, examen, oferta académica, documentos y galería.


## Ingreso a la U: fase 3, proceso de admisión

Importa backend/database/admissions_schema.sql después de los esquemas de universidades
y secciones. Crea:
- university_admissions: un proceso por universidad (university_id UNIQUE), título,
  descripción general, orden, estado y timestamps.
- admission_steps: etapas vinculadas al proceso, con título, descripción, fecha opcional,
  imagen opcional, texto/URL de botón opcionales, orden, estado y timestamps.

La eliminación definitiva de una universidad elimina su proceso; eliminar el proceso
elimina sus etapas mediante claves foráneas. No se borran archivos físicos compartidos.
Eliminar o desactivar una sección NO elimina el proceso: el contenido permanece guardado.
La ubicación pública del bloque depende del orden de university_sections; el orden del
proceso se conserva como metadato, pues solo existe un proceso por universidad.

Uso administrativo:
1. Edita una universidad y crea una sección de tipo admission, si todavía no existe.
2. En esa sección pulsa el icono Administrar proceso de admisión.
3. Completa título, descripción general y estado; pulsa Guardar proceso.
4. Agrega etapas con Nueva etapa. Fecha, imagen y botón son opcionales.
5. Ordena mediante el campo Orden; los empates se resuelven por id.
6. Edita, activa/desactiva o elimina usando los iconos y confirmaciones habituales.

API bajo backend/api/admissions:
- GET get.php?university_id=ID: proceso público con etapas activas.
- GET steps.php?university_id=ID: solo etapas públicas activas y ordenadas.
- GET admin.php?university_id=ID: proceso y todas las etapas, requiere sesión.
- POST create.php y PUT update.php: university_id, titulo, descripcion_general, orden,
  activo; update requiere también id.
- DELETE delete.php: id y university_id; elimina el proceso y sus etapas.
- POST step_create.php y PUT step_update.php: admission_id, university_id, titulo,
  descripcion, fecha, imagen, boton_texto, boton_url, orden, activo. Editar requiere id.
- DELETE step_delete.php: id, admission_id y university_id.
- POST upload.php: FormData con imagen; reutiliza la validación y almacenamiento de noticias.

Todos los endpoints administrativos usan require_admin, PDO y respuestas JSON existentes.
Los identificadores se validan junto a su padre. Solo se publica si universidad, sección
admission y proceso están activos; además se filtran las etapas inactivas. Sin proceso
publicable, get devuelve admission:null y steps:[], sin mostrar información administrativa.

Imágenes: JPG/JPEG, PNG y WebP, hasta 5 MiB, con los mismos límites de dimensiones,
nombres aleatorios y backend/uploads/images ya utilizados. Los botones aceptan rutas
locales que comiencen con / o URLs HTTP/HTTPS; no se aceptan protocolos ejecutables.
El texto del botón es obligatorio cuando se indica URL. Sin URL, no aparece botón.
El contenido se renderiza como texto, nunca como HTML arbitrario.

Frontend:
- services/admissions.js y hooks/useAdmission.js: API y actualización pública.
- AdmissionAdmin.jsx y AdmissionStepForm.jsx: formularios independientes.
- AdmissionSectionContainer.jsx: carga por university_id.
- AdmissionSection.jsx: recibe admission y steps y presenta tarjetas responsive.
- UniversitySectionRenderer registra admission con su contenedor real; los demás tipos
  mantienen sus placeholders de fase 2.

Para futuros bloques, crea su esquema/helper/API y componente de contenido, regístralo
por tipo en UniversitySectionRenderer y añade su editor desde las secciones correspondientes.
No introduzcas condiciones por slug EPN/UCE. Las etapas actuales no tienen tipo propio;
cualquier futura variante de etapa debe diseñarse en una fase específica.

Validación recomendada: crear proceso y etapas con/sin imagen, probar 2 y 10 etapas,
orden y visibilidad, fechas/URLs inválidas, proceso duplicado, pertenencia a universidad,
eliminación con confirmación y protección 401 sin sesión.


## Ingreso a la U: fase 4, estructura del examen

Importa backend/database/exams_schema.sql después de los esquemas de universidades
y secciones. Crea:
- university_exams: un bloque por universidad (university_id UNIQUE), titulo,
  descripcion_general, duracion, cantidad_preguntas, activo y timestamps.
- exam_categories: exam_id, nombre, descripcion, cantidad_preguntas, imagen,
  orden, activo y timestamps. Las áreas son registros dinámicos, no columnas fijas.

Duración es texto (por ejemplo, 60 minutos). Las cantidades de preguntas son enteros
no negativos opcionales: NULL significa que todavía no se ha publicado el dato.
El valor 0 se conserva y se muestra. El total del examen se administra por separado;
no se recalcula al ocultar categorías ni se obliga a coincidir con su suma.

Para administrar:
1. Edita una universidad y agrega una sección de tipo exam si no existe.
2. Pulsa Administrar estructura del examen en las acciones de esa sección.
3. Guarda título, descripción, duración, cantidad total y estado del examen.
4. Agrega categorías con nombre, descripción, imagen opcional, cantidad, orden y estado.
5. Usa los iconos para editar, activar/desactivar y eliminar con confirmación.
Los formularios del examen y las categorías son independientes y mantienen las
convenciones de Bootstrap Icons, colores y responsive del panel.

Endpoints en backend/api/exams:
- GET get.php?university_id=ID: examen y categorías públicas.
- GET categories.php?university_id=ID: categorías públicas activas y ordenadas.
- GET admin.php?university_id=ID: examen y todas sus categorías; requiere sesión.
- POST create.php: university_id, titulo, descripcion_general, duracion,
  cantidad_preguntas y activo.
- PUT update.php: mismos campos e id.
- DELETE delete.php: id y university_id.
- POST category_create.php: exam_id, university_id, nombre, descripcion,
  cantidad_preguntas, imagen, orden y activo.
- PUT category_update.php: mismos campos e id.
- DELETE category_delete.php: id, exam_id y university_id.
- POST upload.php: FormData con imagen; reutiliza validación y almacenamiento existentes.

El helper exams.php usa PDO y respuestas JSON existentes. Todas las operaciones
administrativas requieren require_admin y validan la pertenencia de los registros.
Solo se publica cuando universidad, sección exam y examen están activos; las categorías
también se filtran por activo y se ordenan por orden e id. Sin examen publicable,
get devuelve exam:null y categories:[].

Las imágenes mantienen JPG/JPEG, PNG y WebP, límite 5 MiB y dimensiones actuales,
nombres aleatorios y backend/uploads/images. No se modifica la subida de noticias.
La eliminación del examen elimina sus categorías por clave foránea; eliminar la
universidad elimina el examen. No se borran archivos físicos que podrían estar compartidos.
Desactivar o eliminar la sección conserva el examen para poder reutilizarlo.

Frontend creado:
- services/exams.js y hooks/useExam.js.
- ExamAdmin.jsx y ExamCategoryForm.jsx.
- ExamSectionContainer.jsx (carga) y ExamSection.jsx (presentación).
La integración se registra únicamente en el tipo exam de UniversitySectionRenderer.
Las tarjetas admiten cualquier cantidad de categorías; en móvil usan una columna.

Para agregar otro tipo de sección, sigue la convención de fase 2: registrar el tipo
en backend y configuración frontend, crear su helper/API y componente, y asociarlo
en UniversitySectionRenderer. No agregar condiciones específicas para EPN o UCE.
El bloque admission y sus endpoints permanecen independientes.

Validación: probar 3, 5 y 10 categorías, datos opcionales y cero, subida de imágenes,
edición, orden, visibilidad, examen único por universidad, rechazo de cantidades
negativas/decimales, pertenencia de categorías y protección 401 sin sesión.


## Ingreso a la U: fase 5, oferta académica

Importa backend/database/academic_offers_schema.sql después de universidades y secciones.
Crea university_academic_offers: id, university_id, titulo, descripcion, imagen,
documento, documento_nombre, boton_texto, boton_url, orden, activo y timestamps.
Una universidad puede tener varias ofertas por periodo, modalidad u otro criterio.
No existe una tabla de carreras ni lógica específica para una universidad.

Para administrar:
1. Edita una universidad y agrega una sección academic_offer si no existe.
2. Pulsa Administrar oferta académica en las acciones de esa sección.
3. Crea ofertas con título, descripción opcional, imagen, PDF y/o enlace.
4. Usa los iconos para editar, activar/desactivar y eliminar con confirmación.
El orden público es orden e id. La sección conserva su propia posición en la página.

API en backend/api/academic-offers:
- GET list.php?university_id=ID: ofertas activas de universidad y sección activas.
- GET admin.php?university_id=ID: todas las ofertas, requiere sesión.
- POST create.php: university_id, titulo, descripcion, imagen, documento,
  documento_nombre, boton_texto, boton_url, orden, activo.
- PUT update.php: mismos campos e id.
- DELETE delete.php: id y university_id.
- POST upload_image.php: FormData con imagen.
- POST upload_document.php: FormData con documento.

El helper academic_offers.php valida pertenencia, campos, estado, orden, rutas de
archivos subidos y URLs HTTP/HTTPS o rutas locales. Si hay URL, se requiere texto
del botón. Todos los endpoints administrativos reutilizan require_admin y JSON/PDO.

Formatos y almacenamiento reutilizados:
- JPG/JPEG, PNG y WebP: hasta 5 MiB y límites de dimensiones existentes.
- PDF: hasta 10 MiB, con validaciones existentes.
- backend/uploads/images y backend/uploads/documents.
- Nombres físicos aleatorios; documento_nombre conserva el nombre original limpio.
El servidor PHP debe admitir esos tamaños (upload_max_filesize y post_max_size).
Quitar un archivo elimina su referencia al guardar, no su archivo físico.
La eliminación de la universidad elimina sus ofertas por clave foránea.
Los archivos físicos se conservan porque podrían estar compartidos.

Frontend:
- services/academicOffers.js y hooks/useAcademicOffers.js.
- AcademicOffersAdmin.jsx y AcademicOfferForm.jsx.
- AcademicOfferSectionContainer.jsx y AcademicOfferSection.jsx.
La integración sustituye únicamente el placeholder academic_offer del renderer.
Sin PDF no aparece Ver documento; sin URL no aparece botón de enlace. Los PDF abren
en nueva pestaña, usando el nombre visible, sin mostrar el identificador físico.
El bloque admite solo imagen, solo PDF, ambos o imagen con enlace.
El contenido se centra en escritorio; imágenes y botones se adaptan en móvil.

Validación: crear/subir/editar, combinar archivos, quitar referencias, ordenar,
activar/desactivar, eliminar, comprobar rutas públicas y protección 401 sin sesión.
No se modifican las funcionalidades de admisión, examen, noticias ni autenticación.


## Ingreso a la U: fase 6, documentos universitarios

Importa backend/database/university_documents_schema.sql después de universidades y
secciones. Crea university_documents: id, university_id, titulo, descripcion, archivo,
documento_nombre, orden, activo y timestamps. Una universidad admite múltiples documentos.

Dentro de Editar universidad > Secciones, crea una sección documents si no existe y
pulsa Administrar documentos. Crea un título y selecciona un PDF obligatorio. La descripción
es opcional. Editar permite reemplazar el PDF, cambiar orden y estado. Las acciones utilizan
Bootstrap Icons con tooltip, aria-label y los colores habituales. Eliminar pide confirmación.

API en backend/api/university-documents:
- GET list.php?university_id=ID: documentos activos de universidad y sección activas.
- GET admin.php?university_id=ID: listado completo, protegido.
- POST create.php: university_id, titulo, descripcion, archivo, documento_nombre, orden, activo.
- PUT update.php: mismos campos e id.
- DELETE delete.php: id y university_id.
- POST upload.php: FormData con documento; devuelve documento (ruta) y documento_nombre.
El servicio frontend adapta la ruta devuelta al campo archivo del nuevo módulo.

Se reutilizan require_admin, PDO, respuestas JSON y el flujo PDF existente sin modificar
noticias ni ofertas. Solo PDF, hasta 10 MiB: extensión, firma/cierre PDF, contenido y MIME
mediante fileinfo cuando está disponible en PHP, tal como en el cargador existente.
Los límites upload_max_filesize y post_max_size del servidor deben permitir ese tamaño.

Almacenamiento: backend/uploads/documents/<nombre aleatorio>.pdf.
archivo guarda la URL segura /api/news/document.php?file=..., que sirve application/pdf.
documento_nombre guarda el nombre original limpio para la vista pública y el administrador.
No mostrar el identificador físico como etiqueta. El archivo es obligatorio y debe
corresponder a un PDF ya subido; no se aceptan rutas externas ni rutas arbitrarias.
Eliminar borra el registro, no el archivo físico que podría estar compartido.
Eliminar una universidad elimina sus documentos mediante clave foránea.

Frontend:
- services/universityDocuments.js y hooks/useUniversityDocuments.js.
- UniversityDocumentsAdmin.jsx y UniversityDocumentForm.jsx.
- DocumentsSectionContainer.jsx y DocumentsSection.jsx.
Solo se sustituye el renderer documents. La lista pública muestra Documentos importantes,
título, descripción opcional, nombre visible y Ver documento en nueva pestaña con
noopener noreferrer. En móvil cada documento aparece en su propia tarjeta.

Validación: creación y reemplazo desde el panel, nombre original, apertura PDF, orden,
estado, eliminación, rechazo de PDF falso y ruta inválida, pertenencia a universidad,
protección 401 y convivencia con admisión, examen y oferta académica.


## Galería universitaria (Fase 7)

Importar backend/database/university_gallery_schema.sql en la base existente.
Crea university_gallery con clave foránea a universities y orden, estado, título
opcional, descripción e imagen. No modifica datos de otros módulos.

API en backend/api/university-gallery/:
- GET list.php?university_id=ID: imágenes activas, ordenadas por orden e id; requiere universidad y sección gallery activas.
- GET admin.php?university_id=ID: todas las imágenes (administrador).
- POST create.php: university_id, titulo, descripcion, imagen, orden, activo.
- PUT update.php: los mismos campos e id.
- DELETE delete.php: id y university_id; requiere confirmación en el panel.
- POST upload.php: FormData con imagen; devuelve imagen (URL segura).

Las escrituras y el listado administrativo reutilizan require_admin, PDO y JSON.
El upload reutiliza el validador existente: JPG/JPEG, PNG y WEBP, hasta 5 MiB,
validación de contenido y dimensiones, nombre aleatorio y almacenamiento en
backend/uploads/images/. La base guarda la URL /api/news/image.php?file=...
Eliminar borra el registro, conservando el archivo físico que puede estar compartido.

Administración: Universidades > Editar > Secciones > Galería > Administrar galería.
GalleryImageForm permite subir/reemplazar, ordenar y activar imágenes.
Se mantienen Bootstrap Icons, tooltips, aria-label y confirmación de eliminación.
GallerySection utiliza tarjetas en grid: tres columnas grandes, dos intermedias,
una hasta 600px. El listado administrativo reutiliza las tarjetas móviles actuales.
El servicio universityGallery y su hook actualizan al guardar, al enfocar y cada
30 segundos. No se cambian las demás secciones.

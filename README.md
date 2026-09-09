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

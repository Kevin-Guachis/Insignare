# Migración SIOV a React

## Fuente y alcance
Fuente de verdad: `frontend/public/siov/index.html`, conservado íntegro.
Huella SHA-256 en `backend/database/siov_original.sha256`.
La semilla `siov_original.json` conserva exactamente las 80 preguntas, sus asignaciones,
las cinco áreas, profesiones, tres universidades y 73 ofertas del original.
No se verificó ni actualizó editorialmente esa oferta: se conserva como referencial.

Pantallas: introducción y alcance; ficha del estudiante; test Sí/No; resultados.
Se mantienen avance automático a 180 ms, anterior/siguiente, respuestas al volver,
detección de pendientes, ranking, desempate estable por orden de área, gráficos de
barras/radar, interpretación, carreras relacionadas, tablas por universidad,
comparador de dos/tres carreras, TOP 10, contacto, reinicio y PDF completo.

Se conserva la fórmula original con los datos iniciales:
- puntos: número de respuestas Sí por área;
- porcentaje: Math.round(puntos / 16 * 100);
- relacionadas: Math.max(porcentaje - índice * 1.5, 40).toFixed(0);
- universidades y TOP 10: dos primeras áreas;
- pantalla TOP 10: orden por afinidad, estable ante empate;
- PDF TOP 10: primeras diez ofertas filtradas, tal como el original;
- el PDF incluye las primeras quince profesiones del área principal.

Decisiones justificadas:
- Datos personales y respuestas solo en estado React; no se transmiten ni persisten.
  El formulario original no validaba los campos obligatorios (novalidate y sin
  checkValidity); se conserva esa posibilidad de continuar vacío.
- El PDF se genera y descarga localmente. Nunca se sube al backend.
- El reinicio elimina también la selección del comparador para no heredar otro test.
- Se cancela el avance pendiente al volver o pulsar varias veces, evitando saltos
  por temporizadores acumulados del original.
- Al editar/activar preguntas el denominador pasa a ser el número real de preguntas
  activas del área. Con la semilla sigue siendo 16. No se cambia un test en curso.
- El catálogo se valida antes del inicio: mínimo tres áreas con preguntas para que
  la interpretación de las tres primeras sea posible.
- Bootstrap global se sustituye por CSS acotado a .siov-page para no afectar el sitio.
  Chart.js 4.4.4 y jsPDF 2.5.1 son las mismas versiones originales, servidas localmente.
- Header/Footer y transiciones del sitio permanecen. App y Navbar solo reciben
  correcciones mínimas de lint preexistente: estado derivado de transición y bindings sin uso.

## Datos y APIs
Importación inicial (desde raíz, con PHP configurado):
```sh
php backend/scripts/import_siov.php
```
Crea seis tablas mediante `backend/database/siov_schema.sql`:
`siov_areas`, `siov_questions`, `siov_careers`, `siov_universities`,
`siov_career_universities`, `siov_metrics`.
La importación usa transacción y se niega a sobrescribir un catálogo existente.
No ejecutar de nuevo para actualizar contenido: utilizar el panel.

El catálogo universitario SIOV guarda los nombres, URL y tipo de prueba del original;
es independiente de los bloques informativos de Ingreso a la U. No crea, activa
ni modifica universidades públicas de ese otro módulo.
Las carreras pueden estar en la lista de profesiones relacionadas y/o tener ofertas
en una o varias universidades. Cada relación conserva facultad, título, duración,
modalidad, campo laboral y orden. Las claves foráneas impiden borrados con dependencias.

Endpoints en `/api/siov/`:
- GET content.php: catálogo activo público.
- GET admin.php: catálogo completo y métricas, protegido con require_admin.
- POST / PUT save.php: crear/editar; campo type selecciona una lista cerrada de entidades.
- DELETE delete.php: type e id; protegido, con confirmación en el panel.
- POST metrics.php: solo acumuladores públicos, sin iniciar sesión.

Administración: panel → SIOV → Preguntas / Áreas / Carreras / Universidades /
Carrera ↔ Universidad / Métricas. Permite crear, editar, ordenar, activar/desactivar
y eliminar con Bootstrap Icons y las convenciones existentes. No admite SQL, HTML
ejecutable ni URLs javascript en el contenido.

## Métricas y privacidad
Solo se guarda un contador global por evento y dimensión:
- started: pulsación de iniciar el test;
- completed: finalización; suma de duración redondeada a minutos, máximo 240;
- area: distribución por área predominante al finalizar (una por test);
- career: carreras seleccionadas al pulsar Comparar (una por carrera distinta);
- university: clic en oferta oficial de universidad.

No son visitantes únicos: no hay identificadores, cookies métricas, sesiones,
huellas digitales, IP, nombres, emails, cédulas, teléfonos, respuestas, puntuaciones
individuales, fechas de eventos ni perfiles. Se conservan únicamente cantidad y
minutos_totales acumulados; el promedio se calcula en el panel. No se reintentan
eventos automáticamente para evitar contar dos veces. Un fallo de métricas no bloquea
el test. Como cualquier contador público sin identificar usuarios, puede recibir
eventos artificiales; no debe usarse como estadística auditada de personas únicas.

**Despliegue:** desactivar logs de acceso para /siov y /api/siov en Apache/Nginx,
proxy/CDN/analítica del hosting, y evitar registrar cuerpos de solicitudes. El código
PHP no registra esos datos, pero no puede controlar los logs del proveedor.
No se deben habilitar grabaciones de sesiones ni analítica que capture los campos.
La cookie de autenticación administrativa existente no se usa al registrar métricas:
el fetch lleva credentials: omit y referrerPolicy: no-referrer.

## Archivos y validación
React en `frontend/src/components/siov/`:
SiovIntro, SiovStudent, SiovTest, SiovResults, SiovCharts, SiovCareer,
SiovUniversities, SiovContact; model.js, libraries.js y report.js.
Entrada: pages/Siov.jsx. API: services/siov.js. Administración: components/admin/SiovAdmin.jsx.
Estilos: styles/siov.css. Logo PDF: assets/images/siov-report-logo.png.
Recursos existentes del original: public/siov/vendor/ (licencias conservadas).

Validar con PHP local activo:
```sh
node --test frontend/tests/siov-model.test.mjs
cd frontend
npm run build
npm run lint
```
La prueba compara la semilla y API con el HTML, y 200 escenarios de cálculo/ranking/TOP 10.
Se comprobó en navegador: recorrido completo de 80 preguntas, volver, pendientes,
gráficos, comparador, PDF de nueve páginas, reinicio, solicitudes de métricas sin
datos personales y responsive 320/390/950/1440. También se prueba administración
con registros temporales y rechazo de escrituras sin sesión.

No retirar todavía el HTML de respaldo; conservarlo para revisión funcional del cliente.

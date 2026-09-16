# Configuración de Contacto

Panel → Contacto edita exclusivamente /contacto. El Footer conserva su configuración independiente.

Instalación desde la raíz: `php backend/scripts/install_contact.php`.
Alternativa: importar `backend/database/contact_settings_schema.sql` en la base configurada.
El registro único id=1 se inicializa con la información pública anterior sin sobrescribir datos existentes.
La instalación ya se aplicó a la base local.

Endpoints:
- GET /api/contact/get.php: configuración pública.
- GET /api/contact/admin.php: configuración protegida por require_admin.
- POST /api/contact/update.php: actualización protegida, JSON y validación de origen existentes.

Campos obligatorios: dirección, URL de mapa, teléfono 1, WhatsApp 1 y correo.
WhatsApp: código de país y dígitos, sin + ni espacios.
Mapa: URL HTTPS de Google Maps para insertar (atributo src), o maps?q=latitud,longitud&output=embed.
Redes sociales: HTTPS; dejar vacío para ocultarlas. YouTube es opcional.
Los datos se mantienen separados de usuarios; no se recopila información de visitantes.

Se reutilizan api.js, autenticación, SweetAlert y estilos administrativos y públicos existentes.
No se ejecutaron pruebas, build ni lint, según lo solicitado.
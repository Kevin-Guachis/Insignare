CREATE TABLE IF NOT EXISTS site_settings (
 id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
 logo VARCHAR(255) NULL,
 descripcion TEXT NOT NULL,
 direccion VARCHAR(500) NOT NULL,
 telefono1 VARCHAR(40) NOT NULL,
 telefono2 VARCHAR(40) NOT NULL DEFAULT '',
 correo VARCHAR(190) NOT NULL,
 whatsapp VARCHAR(20) NOT NULL,
 CONSTRAINT site_settings_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO site_settings (id,logo,descripcion,direccion,telefono1,telefono2,correo,whatsapp)
SELECT 1,NULL,'Somos un equipo de profesionales politécnicos especializados en la formación académica de estudiantes, comprometidos con brindar una educación de calidad que fortalezca sus habilidades y conocimientos para afrontar los desafíos académicos.','Juan Genaro Jaramillo 764 & Río Frío. Sangolquí, Ecuador','+593 96 275 9826','+593 96 906 9558','instituto.politecnico.insignare@gmail.com','593962759826'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE id=1);

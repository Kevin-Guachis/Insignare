CREATE TABLE IF NOT EXISTS contact_settings (
 id TINYINT UNSIGNED PRIMARY KEY,
 direccion VARCHAR(500) NOT NULL,
 mapa_url VARCHAR(2000) NOT NULL,
 telefono1 VARCHAR(40) NOT NULL,
 telefono2 VARCHAR(40) NOT NULL DEFAULT '',
 whatsapp1 VARCHAR(15) NOT NULL,
 whatsapp2 VARCHAR(15) NOT NULL DEFAULT '',
 correo VARCHAR(190) NOT NULL,
 instagram VARCHAR(500) NOT NULL DEFAULT '',
 tiktok VARCHAR(500) NOT NULL DEFAULT '',
 facebook VARCHAR(500) NOT NULL DEFAULT '',
 youtube VARCHAR(500) NOT NULL DEFAULT '',
 CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO contact_settings (id,direccion,mapa_url,telefono1,telefono2,whatsapp1,whatsapp2,correo,instagram,tiktok,facebook)
VALUES (1,'Juan Genaro Jaramillo 764 & Río Frío, Sangolquí, Ecuador',
'https://www.google.com/maps?q=Instituto+Politécnico+Insignare,+Juan+Genaro+Jaramillo+764,+Sangolquí,+Ecuador&output=embed',
'0962759826','0969069558','593962759826','593969069558','instituto.politecnico.insignare@gmail.com',
'https://www.instagram.com/inst_insignare/','https://www.tiktok.com/@inst_insignare','https://www.facebook.com/inst.insignare')
ON DUPLICATE KEY UPDATE id=1;

CREATE TABLE IF NOT EXISTS footer_services (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(190) NOT NULL,
 enlace VARCHAR(500) NULL,
 orden INT UNSIGNED NOT NULL DEFAULT 0,
 activo TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Inicializar solo una tabla vacía; ejecutar una vez para conservar el contenido actual.
INSERT INTO footer_services (nombre,enlace,orden,activo)
SELECT nombre,NULL,orden,1 FROM (
 SELECT 'Ingreso a la universidad' AS nombre, 1 AS orden UNION ALL
 SELECT 'Material gratuito',2 UNION ALL SELECT 'Calculadoras',3
) initial_services WHERE NOT EXISTS (SELECT 1 FROM footer_services);

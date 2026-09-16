CREATE TABLE IF NOT EXISTS material_resources (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 university_id BIGINT UNSIGNED NOT NULL,
 type ENUM('prueba','material') NOT NULL,
 subject VARCHAR(190) NOT NULL DEFAULT '',
 year SMALLINT UNSIGNED NOT NULL,
 title VARCHAR(190) NOT NULL,
 description TEXT NOT NULL,
 file_path VARCHAR(255) NOT NULL,
 file_name VARCHAR(255) NOT NULL,
 display_order INT UNSIGNED NOT NULL DEFAULT 0,
 visible TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT material_resources_university FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE RESTRICT,
 INDEX material_resources_filters (visible,university_id,type,year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

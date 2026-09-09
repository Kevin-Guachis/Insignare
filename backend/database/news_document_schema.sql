-- Ejecutar una sola vez después de news_schema.sql.
ALTER TABLE news ADD COLUMN documento VARCHAR(255) NULL DEFAULT NULL AFTER imagen;

-- Conservar las asociaciones anteriores; los archivos originales no se borran.
UPDATE news SET documento='/documents/uce-admision-artes-2026-2027.pdf' WHERE slug='admision-uce' AND documento IS NULL;
UPDATE news SET documento='/documents/epn-lineamientos-admision.pdf' WHERE slug='admision-epn' AND documento IS NULL;

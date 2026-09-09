-- Ejecutar después de news_schema.sql. No sobrescribe noticias ya existentes.
INSERT INTO news (slug, titulo, categoria, fecha, imagen, descripcion, contenido)
SELECT 'admision-uce', 'ADMISIÓN UCE', 'Admisiones', '2026-07-31',
'/images/news/admision-uce.jpg', 'Información del examen de admisión de Artes 2026–2027.',
'INFORMACIÓN EXAMEN ADMISIÓN ARTES 2026–2027'
WHERE NOT EXISTS (SELECT 1 FROM news WHERE slug = 'admision-uce');

INSERT INTO news (slug, titulo, categoria, fecha, imagen, descripcion, contenido)
SELECT 'admision-epn', 'ADMISIÓN EPN', 'Admisiones', '2026-06-22',
'/images/news/admision-epn.webp', 'Lineamientos para la admisión EPN y guía de estudio.',
'LINEAMIENTOS PARA LA ADMISIÓN EPN\n\nGUÍA DE ESTUDIO EPN'
WHERE NOT EXISTS (SELECT 1 FROM news WHERE slug = 'admision-epn');

INSERT INTO news (slug, titulo, categoria, fecha, imagen, descripcion, contenido)
SELECT 'admision-espe', 'ADMISIÓN ESPE', 'Admisiones', '2026-06-22',
'/images/news/admision-espe.jpg', 'Información de admisión ESPE.', ''
WHERE NOT EXISTS (SELECT 1 FROM news WHERE slug = 'admision-espe');

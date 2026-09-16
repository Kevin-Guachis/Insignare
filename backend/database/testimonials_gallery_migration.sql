-- Aplicar a instalaciones anteriores de Testimonios. No elimina datos.
ALTER TABLE testimonials
 CHANGE COLUMN nombre titulo VARCHAR(190) NOT NULL,
 CHANGE COLUMN comentario comentario_legacy TEXT NULL,
 CHANGE COLUMN detalle detalle_legacy VARCHAR(190) NULL;

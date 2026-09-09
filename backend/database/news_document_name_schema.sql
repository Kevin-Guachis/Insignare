ALTER TABLE news ADD COLUMN documento_nombre VARCHAR(255) NULL DEFAULT NULL AFTER documento;
UPDATE news SET documento_nombre=SUBSTRING_INDEX(documento,'/',-1) WHERE documento LIKE '/documents/%' AND documento_nombre IS NULL;

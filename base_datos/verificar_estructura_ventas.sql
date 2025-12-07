-- =============================================
-- SCRIPT DE VERIFICACIÓN: Estructura de tabla ventas
-- =============================================
-- Ejecuta este script para ver la estructura actual

USE inventario_libreria;

-- Ver estructura completa de la tabla ventas
DESCRIBE ventas;

-- Ver también las columnas específicas
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'inventario_libreria'
AND TABLE_NAME = 'ventas'
ORDER BY ORDINAL_POSITION;

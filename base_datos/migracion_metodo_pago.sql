-- =============================================
-- MIGRACIÓN: Agregar campo metodo_pago a tabla ventas
-- Sistema de Gestión de Inventario - Librería
-- Fecha: Diciembre 2025
-- =============================================

USE inventario_libreria;

-- Primero, verificar la estructura actual de la tabla
SELECT 'Estructura ANTES de la migración:' AS Info;
DESCRIBE ventas;

-- Agregar columna metodo_pago a la tabla ventas
-- NOTA: Algunos sistemas tienen 'total' y otros 'total_venta'
-- Esta migración funciona con ambos casos

-- Intentar agregar después de 'total_venta' (si existe)
SET @sql = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'inventario_libreria'
     AND TABLE_NAME = 'ventas'
     AND COLUMN_NAME = 'total_venta') > 0,
    'ALTER TABLE ventas ADD COLUMN metodo_pago ENUM(''Efectivo'', ''Tarjeta'', ''Transferencia'') DEFAULT ''Efectivo'' AFTER total_venta',
    'ALTER TABLE ventas ADD COLUMN metodo_pago ENUM(''Efectivo'', ''Tarjeta'', ''Transferencia'') DEFAULT ''Efectivo'' AFTER total'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que la columna se agregó correctamente
SELECT 'Estructura DESPUÉS de la migración:' AS Info;
DESCRIBE ventas;

-- Mensaje de confirmación
SELECT '✅ Migración completada: Campo metodo_pago agregado exitosamente' AS Resultado;

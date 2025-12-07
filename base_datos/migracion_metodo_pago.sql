-- =============================================
-- MIGRACIÓN: Agregar campo metodo_pago a tabla ventas
-- Sistema de Gestión de Inventario - Librería
-- Fecha: Diciembre 2025
-- =============================================

USE inventario_libreria;

-- Agregar columna metodo_pago a la tabla ventas
ALTER TABLE ventas
ADD COLUMN metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia')
DEFAULT 'Efectivo'
AFTER total;

-- Verificar que la columna se agregó correctamente
DESCRIBE ventas;

-- Mensaje de confirmación
SELECT 'Migración completada: Campo metodo_pago agregado exitosamente' AS Resultado;

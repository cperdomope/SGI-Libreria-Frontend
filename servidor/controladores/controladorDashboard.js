const db = require('../configuracion/db');

exports.obtenerEstadisticas = async (req, res) => {
    try {
        // 1. Total de Libros en el catálogo
        const [totalLibros] = await db.query('SELECT COUNT(*) as total FROM libros');

        // 2. Libros con Stock Bajo (Menor o igual al mínimo)
        const [alertasStock] = await db.query('SELECT COUNT(*) as total FROM libros WHERE stock_actual <= stock_minimo');

        // 3. Ventas del Mes Actual
        // Usamos funciones de fecha de MySQL para filtrar solo este mes y año
        const [ventasMes] = await db.query(`
            SELECT COALESCE(SUM(cantidad), 0) as total 
            FROM movimientos 
            WHERE tipo_movimiento = 'SALIDA' 
            AND MONTH(fecha_movimiento) = MONTH(CURRENT_DATE())
            AND YEAR(fecha_movimiento) = YEAR(CURRENT_DATE())
        `);

        // Enviamos todo en un solo objeto JSON
        res.json({
            total_libros: totalLibros[0].total,
            alertas_stock: alertasStock[0].total,
            ventas_mes: ventasMes[0].total
        });

    } catch (error) {
        console.error("Error en dashboard:", error);
        res.status(500).json({ error: 'Error al calcular estadísticas' });
    }
};
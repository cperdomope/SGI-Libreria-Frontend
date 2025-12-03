const db = require('../configuracion/db');

exports.obtenerEstadisticas = async (req, res) => {
    try {
        // 1. Ventas del día (Total e Ingresos)
        const [ventasDia] = await db.query(`
            SELECT
                COUNT(*) as cantidad,
                COALESCE(SUM(total_venta), 0) as ingresos
            FROM ventas
            WHERE DATE(fecha_venta) = CURDATE()
        `);

        // 2. Ventas del mes (Total e Ingresos)
        const [ventasMes] = await db.query(`
            SELECT
                COUNT(*) as cantidad,
                COALESCE(SUM(total_venta), 0) as ingresos
            FROM ventas
            WHERE MONTH(fecha_venta) = MONTH(CURDATE())
            AND YEAR(fecha_venta) = YEAR(CURDATE())
        `);

        // 3. Productos más vendidos (TOP 5)
        const [productosMasVendidos] = await db.query(`
            SELECT
                l.titulo,
                l.isbn,
                a.nombre as autor,
                SUM(dv.cantidad) as total_vendido,
                SUM(dv.cantidad * dv.precio_unitario) as ingresos_generados
            FROM detalle_ventas dv
            INNER JOIN libros l ON dv.libro_id = l.id
            LEFT JOIN autores a ON l.autor_id = a.id
            GROUP BY l.id, l.titulo, l.isbn, a.nombre
            ORDER BY total_vendido DESC
            LIMIT 5
        `);

        // 4. Clientes con más compras (TOP 5)
        const [mejoresClientes] = await db.query(`
            SELECT
                c.nombre_completo,
                c.documento,
                COUNT(v.id) as total_compras,
                SUM(v.total_venta) as total_gastado
            FROM ventas v
            INNER JOIN clientes c ON v.cliente_id = c.id
            GROUP BY c.id, c.nombre_completo, c.documento
            ORDER BY total_compras DESC
            LIMIT 5
        `);

        // 5. Libros con stock bajo (stock_actual < stock_minimo)
        const [librosStockBajo] = await db.query(`
            SELECT
                l.id,
                l.titulo,
                l.isbn,
                a.nombre as autor,
                l.stock_actual,
                l.stock_minimo
            FROM libros l
            LEFT JOIN autores a ON l.autor_id = a.id
            WHERE l.stock_actual < l.stock_minimo
            ORDER BY (l.stock_minimo - l.stock_actual) DESC
            LIMIT 10
        `);

        // 6. Total de libros en catálogo
        const [totalLibros] = await db.query('SELECT COUNT(*) as total FROM libros');

        // 7. Total de clientes registrados
        const [totalClientes] = await db.query('SELECT COUNT(*) as total FROM clientes');

        // Enviar todas las estadísticas
        res.json({
            ventas_hoy: {
                cantidad: ventasDia[0].cantidad,
                ingresos: parseFloat(ventasDia[0].ingresos)
            },
            ventas_mes: {
                cantidad: ventasMes[0].cantidad,
                ingresos: parseFloat(ventasMes[0].ingresos)
            },
            productos_mas_vendidos: productosMasVendidos.map(p => ({
                titulo: p.titulo,
                autor: p.autor,
                total_vendido: p.total_vendido,
                ingresos_generados: parseFloat(p.ingresos_generados)
            })),
            mejores_clientes: mejoresClientes.map(c => ({
                nombre: c.nombre_completo,
                documento: c.documento,
                total_compras: c.total_compras,
                total_gastado: parseFloat(c.total_gastado)
            })),
            libros_stock_bajo: librosStockBajo.map(l => ({
                id: l.id,
                titulo: l.titulo,
                autor: l.autor,
                stock_actual: l.stock_actual,
                stock_minimo: l.stock_minimo,
                faltante: l.stock_minimo - l.stock_actual
            })),
            total_libros: totalLibros[0].total,
            total_clientes: totalClientes[0].total,
            alertas_stock: librosStockBajo.length
        });

    } catch (error) {
        console.error("Error en dashboard:", error);
        res.status(500).json({ error: 'Error al calcular estadísticas' });
    }
};
const pool = require('../configuracion/db');

// Crear una nueva venta (Transacción Completa)
const crearVenta = async (req, res) => {
    const { cliente_id, items, total } = req.body; 
    // items es un array: [{ libro_id, cantidad, precio_unitario }, ...]
    
    // Validación básica
    if (!items || items.length === 0) {
        return res.status(400).json({ mensaje: 'No hay productos en la venta' });
    }

    const connection = await pool.getConnection(); // Necesitamos una conexión exclusiva para la transacción

    try {
        await connection.beginTransaction(); // INICIO DE LA TRANSACCIÓN

        // 1. Insertar la cabecera de la venta
        const [resultadoVenta] = await connection.query(
            'INSERT INTO ventas (cliente_id, usuario_id, total_venta, fecha_venta) VALUES (?, 1, ?, NOW())',
            [cliente_id || null, total]
        );
        
        const ventaId = resultadoVenta.insertId;

        // 2. Procesar cada item del carrito
        for (const item of items) {
            // A. Insertar en detalle_ventas
            await connection.query(
                'INSERT INTO detalle_ventas (venta_id, libro_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [ventaId, item.libro_id, item.cantidad, item.precio_unitario]
            );

            // B. Descontar del inventario (Tabla libros)
            await connection.query(
                'UPDATE libros SET stock_actual = stock_actual - ? WHERE id = ?',
                [item.cantidad, item.libro_id]
            );
        }

        await connection.commit(); // CONFIRMAR CAMBIOS (Todo salió bien)
        
        res.status(201).json({ 
            mensaje: 'Venta registrada con éxito', 
            ventaId: ventaId 
        });

    } catch (error) {
        await connection.rollback(); // REVERTIR CAMBIOS (Algo salió mal)
        console.error('Error en transacción de venta:', error);
        res.status(500).json({ mensaje: 'Error al procesar la venta, inventario no descontado.' });
    } finally {
        connection.release(); // Liberar la conexión al pool
    }
};

// Obtener historial de ventas (Para reportes o listados)
const obtenerVentas = async (req, res) => {
    try {
        // Hacemos JOIN para traer el nombre del cliente
        const sql = `
            SELECT v.id, v.fecha_venta, v.total_venta as total, c.nombre_completo as cliente
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            ORDER BY v.fecha_venta DESC
        `;
        const [filas] = await pool.query(sql);
        res.json(filas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener ventas' });
    }
};

// Obtener detalle de una venta específica
const obtenerDetalleVenta = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Obtener datos de la venta
        const sqlVenta = `
            SELECT v.id, v.fecha_venta, v.total_venta as total,
                   c.nombre_completo as cliente, c.documento, c.email, c.telefono
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = ?
        `;
        const [venta] = await pool.query(sqlVenta, [id]);

        if (venta.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        // 2. Obtener items de la venta
        const sqlItems = `
            SELECT dv.id, dv.cantidad, dv.precio_unitario,
                   l.titulo, l.isbn, a.nombre as autor
            FROM detalle_ventas dv
            INNER JOIN libros l ON dv.libro_id = l.id
            LEFT JOIN autores a ON l.autor_id = a.id
            WHERE dv.venta_id = ?
        `;
        const [items] = await pool.query(sqlItems, [id]);

        // 3. Combinar datos
        res.json({
            venta: venta[0],
            items: items
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener detalle de venta' });
    }
};

module.exports = {
    crearVenta,
    obtenerVentas,
    obtenerDetalleVenta
};
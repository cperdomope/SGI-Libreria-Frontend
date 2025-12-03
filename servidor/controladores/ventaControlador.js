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
        // Asumo que tienes un campo usuario_id o vendedor_id, si no, lo puedes omitir o pasar null
        const [resultadoVenta] = await connection.query(
            'INSERT INTO ventas (cliente_id, total, fecha_venta) VALUES (?, ?, NOW())',
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
                'UPDATE libros SET stock = stock - ? WHERE id = ?',
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
            SELECT v.id, v.fecha_venta, v.total, c.nombre_completo as cliente
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

module.exports = {
    crearVenta,
    obtenerVentas
};
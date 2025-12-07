const db = require('../configuracion/db'); 

// 1. POST: Registrar venta (AJUSTADO A TUS IMÁGENES)
exports.crearVenta = async (req, res) => {
    const { cliente_id, total, items, metodo_pago } = req.body;

    // Validación básica
    if (!cliente_id || !items || items.length === 0) {
        return res.status(400).json({ mensaje: "Faltan datos para procesar la venta." });
    }

    // Validar método de pago
    const metodoPagoValido = metodo_pago || 'Efectivo';
    const metodosPermitidos = ['Efectivo', 'Tarjeta', 'Transferencia'];
    if (!metodosPermitidos.includes(metodoPagoValido)) {
        return res.status(400).json({ mensaje: "Método de pago inválido." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction(); // --- INICIO DE LA TRANSACCIÓN ---

        // =================================================================================
        // PASO A: Insertar en la tabla 'ventas' (Según tu imagen 2)
        // Campos: cliente_id, usuario_id, total_venta, metodo_pago, fecha_venta
        // =================================================================================
        const queryVenta = `
            INSERT INTO ventas (cliente_id, usuario_id, total_venta, metodo_pago, fecha_venta)
            VALUES (?, ?, ?, ?, NOW())
        `;

        // Usar el ID del usuario autenticado (del token JWT) y el método de pago del request
        const usuarioId = req.usuario?.id || 1; // Fallback a 1 si no hay usuario autenticado
        const [ventaResult] = await connection.query(queryVenta, [cliente_id, usuarioId, total, metodoPagoValido]);
        const ventaId = ventaResult.insertId;

        // =================================================================================
        // PASO B: Insertar Detalles y Actualizar Stock (Según tu imagen 1)
        // Campos nuevos: Se agrega 'subtotal'
        // =================================================================================
        for (const item of items) {
            // 1. Calcular subtotal en el backend por seguridad
            const subtotalCalculado = item.cantidad * item.precio_unitario;

            // 2. Insertar en 'detalle_ventas' incluyendo la columna 'subtotal'
            await connection.query(
                `INSERT INTO detalle_ventas (venta_id, libro_id, cantidad, precio_unitario, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [ventaId, item.libro_id, item.cantidad, item.precio_unitario, subtotalCalculado]
            );

            // 3. Descontar stock del libro
            await connection.query(
                `UPDATE libros SET stock_actual = stock_actual - ? WHERE id = ?`,
                [item.cantidad, item.libro_id]
            );
        }

        await connection.commit(); // --- CONFIRMAR TRANSACCIÓN ---
        console.log(`Venta #${ventaId} registrada correctamente.`);
        
        res.status(201).json({ 
            mensaje: "Venta registrada exitosamente", 
            ventaId: ventaId 
        });

    } catch (error) {
        if (connection) await connection.rollback(); // --- DESHACER SI FALLA ---
        console.error("Error en transacción:", error);
        res.status(500).json({ mensaje: "Error al procesar la venta", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// 2. GET: Listar ventas (Ajustado para mostrar lo que tienes en la BD)
exports.obtenerVentas = async (req, res) => {
    try {
        const sql = `
            SELECT 
                v.id, 
                v.fecha_venta, 
                v.total_venta as total, 
                v.metodo_pago,
                c.nombre_completo as cliente, 
                c.documento
            FROM ventas v
            JOIN clientes c ON v.cliente_id = c.id
            ORDER BY v.fecha_venta DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener ventas" });
    }
};

// 3. GET: Obtener detalle completo de una venta (información + items)
exports.obtenerDetalleVenta = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener información de la venta
        const [ventaInfo] = await db.query(`
            SELECT
                v.id,
                v.fecha_venta,
                v.total_venta as total,
                v.metodo_pago,
                c.nombre_completo as cliente,
                c.documento,
                c.telefono
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = ?
        `, [id]);

        if (ventaInfo.length === 0) {
            return res.status(404).json({ mensaje: "Venta no encontrada" });
        }

        // Obtener items de la venta
        const [items] = await db.query(`
            SELECT
                d.id,
                d.cantidad,
                d.precio_unitario,
                d.subtotal,
                l.titulo,
                l.isbn,
                a.nombre as autor
            FROM detalle_ventas d
            JOIN libros l ON d.libro_id = l.id
            LEFT JOIN autores a ON l.autor_id = a.id
            WHERE d.venta_id = ?
        `, [id]);

        // Devolver en el formato que espera el frontend
        res.json({
            venta: ventaInfo[0],
            items: items
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener detalle" });
    }
};
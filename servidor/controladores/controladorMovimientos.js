const db = require('../configuracion/db');

exports.registrarMovimiento = async (req, res) => {
    // Recibimos los datos del formulario (Frontend)
    // usuario_id lo ponemos fijo en 1 por ahora, hasta que hagamos el Login
    const { libro_id, tipo_movimiento, cantidad, usuario_id = 1 } = req.body;

    // 1. Validaciones básicas
    if (!libro_id || !tipo_movimiento || !cantidad) {
        return res.status(400).json({ error: 'Faltan datos: libro, tipo o cantidad' });
    }

    try {
        // 2. Si es una VENTA (SALIDA), verificar primero si hay stock suficiente
        if (tipo_movimiento === 'SALIDA') {
             const [libro] = await db.query('SELECT stock_actual, titulo FROM libros WHERE id = ?', [libro_id]);
             
             if (libro.length === 0) return res.status(404).json({ error: 'El libro no existe' });
             
             if (libro[0].stock_actual < cantidad) {
                 return res.status(400).json({ 
                     error: `No hay suficiente stock. Tienes ${libro[0].stock_actual} unidades.` 
                 });
             }
        }

        // 3. Registrar el movimiento en la tabla 'movimientos' (Historial)
        await db.query(
            'INSERT INTO movimientos (libro_id, tipo_movimiento, cantidad, usuario_id) VALUES (?, ?, ?, ?)',
            [libro_id, tipo_movimiento, cantidad, usuario_id]
        );

        // 4. Actualizar el stock en la tabla 'libros' (Matemática)
        // Si es ENTRADA sumamos (+), si es SALIDA restamos (-)
        const operador = tipo_movimiento === 'ENTRADA' ? '+' : '-';
        
        await db.query(
            `UPDATE libros SET stock_actual = stock_actual ${operador} ? WHERE id = ?`,
            [cantidad, libro_id]
        );

        res.json({ mensaje: '¡Movimiento registrado con éxito!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al procesar el movimiento' });
    }
};
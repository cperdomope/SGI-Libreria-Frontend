const db = require('../configuracion/db'); // Asegúrate que esta ruta sea correcta en tu proyecto

// Obtener libros (Optimizado para POS)
exports.obtenerLibros = async (req, res) => {
    try {
        const [filas] = await db.query(`
            SELECT 
                l.id, 
                l.isbn, 
                l.titulo, 
                CAST(l.precio_venta AS DECIMAL(10,2)) AS precio, 
                CAST(l.stock_actual AS UNSIGNED) AS stock, 
                l.stock_minimo, 
                a.nombre AS autor, 
                c.nombre AS categoria 
            FROM libros l 
            LEFT JOIN autores a ON l.autor_id = a.id 
            LEFT JOIN categorias c ON l.categoria_id = c.id
        `);
        res.json(filas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los libros' });
    }
};

// Crear libro
exports.crearLibro = async (req, res) => {
    const { isbn, titulo, autor_id, categoria_id, precio_venta, stock_minimo } = req.body;
    try {
        await db.query(
            `INSERT INTO libros (isbn, titulo, autor_id, categoria_id, precio_venta, stock_minimo, stock_actual) 
             VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [isbn, titulo, autor_id, categoria_id, precio_venta, stock_minimo || 5]
        );
        res.json({ mensaje: 'Libro creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El ISBN ya existe' });
        res.status(500).json({ error: 'Error al crear' });
    }
};

// Actualizar libro
exports.actualizarLibro = async (req, res) => {
    const { id } = req.params;
    const { isbn, titulo, autor_id, categoria_id, precio_venta, stock_minimo } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE libros 
             SET isbn=?, titulo=?, autor_id=?, categoria_id=?, precio_venta=?, stock_minimo=? 
             WHERE id=?`,
            [isbn, titulo, autor_id, categoria_id, precio_venta, stock_minimo, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Libro no encontrado' });
        
        res.json({ mensaje: 'Libro actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el libro' });
    }
};

// Eliminar libro
exports.eliminarLibro = async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await db.query('DELETE FROM libros WHERE id = ?', [id]);
        if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Libro no encontrado' });
        res.json({ mensaje: 'Libro eliminado correctamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ error: 'No se puede borrar: Tiene historial.' });
        res.status(500).json({ error: 'Error interno al eliminar' });
    }
};
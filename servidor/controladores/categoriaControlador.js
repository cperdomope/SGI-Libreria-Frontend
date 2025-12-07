const db = require('../configuracion/db');

// Listar categorías
exports.obtenerCategorias = async (req, res) => {
    try {
        const [categorias] = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

// Crear categoría
exports.crearCategoria = async (req, res) => {
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }

    try {
        const [resultado] = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre.trim()]);
        res.status(201).json({
            mensaje: 'Categoría creada exitosamente',
            id: resultado.insertId,
            nombre: nombre.trim()
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

// Actualizar categoría
exports.actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }

    try {
        const [resultado] = await db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre.trim(), id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ mensaje: 'Categoría actualizada exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

// Eliminar categoría
exports.eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si hay libros asociados
        const [libros] = await db.query('SELECT COUNT(*) as total FROM libros WHERE categoria_id = ?', [id]);

        if (libros[0].total > 0) {
            return res.status(400).json({
                error: `No se puede eliminar. Hay ${libros[0].total} libro(s) asociado(s) a esta categoría.`
            });
        }

        const [resultado] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ mensaje: 'Categoría eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};

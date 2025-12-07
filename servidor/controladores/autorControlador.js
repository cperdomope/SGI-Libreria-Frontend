const db = require('../configuracion/db');

// Listar autores
exports.obtenerAutores = async (req, res) => {
    try {
        const [autores] = await db.query('SELECT * FROM autores ORDER BY nombre ASC');
        res.json(autores);
    } catch (error) {
        console.error('Error al obtener autores:', error);
        res.status(500).json({ error: 'Error al obtener autores' });
    }
};

// Crear autor
exports.crearAutor = async (req, res) => {
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del autor es obligatorio' });
    }

    try {
        const [resultado] = await db.query('INSERT INTO autores (nombre) VALUES (?)', [nombre.trim()]);
        res.status(201).json({
            mensaje: 'Autor creado exitosamente',
            id: resultado.insertId,
            nombre: nombre.trim()
        });
    } catch (error) {
        console.error('Error al crear autor:', error);
        res.status(500).json({ error: 'Error al crear autor' });
    }
};

// Actualizar autor
exports.actualizarAutor = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del autor es obligatorio' });
    }

    try {
        const [resultado] = await db.query('UPDATE autores SET nombre = ? WHERE id = ?', [nombre.trim(), id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Autor no encontrado' });
        }

        res.json({ mensaje: 'Autor actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar autor:', error);
        res.status(500).json({ error: 'Error al actualizar autor' });
    }
};

// Eliminar autor
exports.eliminarAutor = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si hay libros asociados
        const [libros] = await db.query('SELECT COUNT(*) as total FROM libros WHERE autor_id = ?', [id]);

        if (libros[0].total > 0) {
            return res.status(400).json({
                error: `No se puede eliminar. Hay ${libros[0].total} libro(s) asociado(s) a este autor.`
            });
        }

        const [resultado] = await db.query('DELETE FROM autores WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Autor no encontrado' });
        }

        res.json({ mensaje: 'Autor eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar autor:', error);
        res.status(500).json({ error: 'Error al eliminar autor' });
    }
};

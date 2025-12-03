const pool = require('../configuracion/db'); 

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
    try {
        const [filas] = await pool.query('SELECT * FROM clientes ORDER BY nombre_completo ASC');
        res.json(filas);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener clientes' });
    }
};

// Obtener un cliente por ID
const obtenerClientePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [filas] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
        
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
        
        res.json(filas[0]);
    } catch (error) {
        console.error('Error al obtener el cliente:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

// Crear un nuevo cliente
const crearCliente = async (req, res) => {
    const { nombre_completo, documento, email, telefono, direccion } = req.body;

    if (!nombre_completo || !documento) {
        return res.status(400).json({ mensaje: 'El nombre completo y el documento son obligatorios' });
    }

    try {
        const [existeDoc] = await pool.query('SELECT id FROM clientes WHERE documento = ?', [documento]);
        if (existeDoc.length > 0) {
            return res.status(400).json({ mensaje: 'Ya existe un cliente con este documento' });
        }

        const [resultado] = await pool.query(
            'INSERT INTO clientes (nombre_completo, documento, email, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
            [nombre_completo, documento, email || null, telefono || null, direccion || null]
        );

        res.status(201).json({
            id: resultado.insertId,
            nombre_completo,
            documento,
            mensaje: 'Cliente creado exitosamente'
        });

    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ mensaje: 'Error al registrar el cliente en la base de datos' });
    }
};

// Actualizar un cliente existente
const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, documento, email, telefono, direccion } = req.body;

    try {
        const [existe] = await pool.query('SELECT id FROM clientes WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        if (documento) {
            const [conflicto] = await pool.query('SELECT id FROM clientes WHERE documento = ? AND id != ?', [documento, id]);
            if (conflicto.length > 0) {
                return res.status(400).json({ mensaje: 'El documento ya pertenece a otro cliente' });
            }
        }

        const [resultado] = await pool.query(
            'UPDATE clientes SET nombre_completo = ?, documento = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?',
            [nombre_completo, documento, email, telefono, direccion, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(400).json({ mensaje: 'No se pudo actualizar' });
        }

        res.json({ mensaje: 'Cliente actualizado correctamente', id });

    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ mensaje: 'Error interno al actualizar' });
    }
};

// Eliminar cliente
const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ mensaje: 'No se puede eliminar: El cliente tiene registros asociados' });
        }
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el cliente' });
    }
};

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};
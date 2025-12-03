const db = require('../configuracion/db');

// Obtener todos los proveedores
exports.obtenerProveedores = async (req, res) => {
    try {
        const [proveedores] = await db.query('SELECT * FROM proveedores ORDER BY nombre_empresa ASC');
        res.json(proveedores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

// Crear nuevo proveedor
exports.crearProveedor = async (req, res) => {
    const { nombre_empresa, nit, nombre_contacto, email, telefono, direccion } = req.body;

    try {
        const [resultado] = await db.query(
            'INSERT INTO proveedores (nombre_empresa, nit, nombre_contacto, email, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre_empresa, nit || null, nombre_contacto || null, email || null, telefono || null, direccion || null]
        );
        res.status(201).json({
            mensaje: 'Proveedor creado exitosamente',
            id: resultado.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe un proveedor con ese email o teléfono' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
};

// Actualizar proveedor
exports.actualizarProveedor = async (req, res) => {
    const { id } = req.params;
    const { nombre_empresa, nit, nombre_contacto, email, telefono, direccion } = req.body;

    try {
        const [resultado] = await db.query(
            'UPDATE proveedores SET nombre_empresa=?, nit=?, nombre_contacto=?, email=?, telefono=?, direccion=? WHERE id=?',
            [nombre_empresa, nit || null, nombre_contacto || null, email || null, telefono || null, direccion || null, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json({ mensaje: 'Proveedor actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
};

// Eliminar proveedor
exports.eliminarProveedor = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await db.query('DELETE FROM proveedores WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json({ mensaje: 'Proveedor eliminado correctamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: tiene registros relacionados' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
};

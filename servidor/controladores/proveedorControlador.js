/**
 * =====================================================
 * CONTROLADOR DE PROVEEDORES
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Gestiona el CRUD de proveedores de la librería.
 * Los proveedores son las empresas que suministran los libros
 * y otros productos al inventario.
 *
 * @requires ../configuracion/db - Pool de conexiones MySQL
 *
 * TABLA: mdc_proveedores
 * - id: INT (PK, AUTO_INCREMENT)
 * - nombre_empresa: VARCHAR(100) NOT NULL
 * - nit: VARCHAR(20)
 * - nombre_contacto: VARCHAR(100)
 * - email: VARCHAR(100)
 * - telefono: VARCHAR(20)
 * - direccion: VARCHAR(200)
 * - fecha_registro: TIMESTAMP
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

const db = require('../configuracion/db');

// =====================================================
// CONTROLADORES CRUD
// =====================================================

/**
 * Obtiene el listado de todos los proveedores.
 * Ordenados alfabéticamente por nombre de empresa.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con array de proveedores
 */
exports.obtenerProveedores = async (req, res) => {
  try {
    const [proveedores] = await db.query(
      `SELECT id, nombre_empresa, nit, nombre_contacto, email, telefono, direccion, fecha_registro
       FROM mdc_proveedores
       ORDER BY nombre_empresa ASC`
    );

    res.json({
      exito: true,
      datos: proveedores,
      total: proveedores.length
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Proveedores] Error al listar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener los proveedores',
      codigo: 'PROVEEDORES_LIST_ERROR'
    });
  }
};

/**
 * Crea un nuevo proveedor.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.body - Datos del proveedor
 * @param {string} req.body.nombre_empresa - Razón social (obligatorio)
 * @param {string} [req.body.nit] - NIT de la empresa
 * @param {string} [req.body.nombre_contacto] - Persona de contacto
 * @param {string} [req.body.email] - Correo corporativo
 * @param {string} [req.body.telefono] - Teléfono de contacto
 * @param {string} [req.body.direccion] - Dirección física
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con el proveedor creado
 */
exports.crearProveedor = async (req, res) => {
  const { nombre_empresa, nit, nombre_contacto, email, telefono, direccion } = req.body;

  // Validación
  if (!nombre_empresa || nombre_empresa.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El nombre de la empresa es obligatorio'
    });
  }

  try {
    const [resultado] = await db.query(
      `INSERT INTO mdc_proveedores
       (nombre_empresa, nit, nombre_contacto, email, telefono, direccion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre_empresa.trim(),
        nit || null,
        nombre_contacto || null,
        email || null,
        telefono || null,
        direccion || null
      ]
    );

    res.status(201).json({
      exito: true,
      mensaje: 'Proveedor creado exitosamente',
      datos: {
        id: resultado.insertId,
        nombre_empresa: nombre_empresa.trim()
      }
    });

  } catch (error) {
    // Manejar posibles duplicados si hay constraints UNIQUE
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        exito: false,
        mensaje: 'Ya existe un proveedor con esos datos',
        codigo: 'PROVEEDOR_DUPLICADO'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Proveedores] Error al crear:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear el proveedor',
      codigo: 'PROVEEDOR_CREATE_ERROR'
    });
  }
};

/**
 * Actualiza un proveedor existente.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del proveedor
 * @param {Object} req.body - Nuevos datos del proveedor
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.actualizarProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre_empresa, nit, nombre_contacto, email, telefono, direccion } = req.body;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de proveedor inválido'
    });
  }

  // Validación
  if (!nombre_empresa || nombre_empresa.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El nombre de la empresa es obligatorio'
    });
  }

  try {
    const [resultado] = await db.query(
      `UPDATE mdc_proveedores
       SET nombre_empresa = ?, nit = ?, nombre_contacto = ?,
           email = ?, telefono = ?, direccion = ?
       WHERE id = ?`,
      [
        nombre_empresa.trim(),
        nit || null,
        nombre_contacto || null,
        email || null,
        telefono || null,
        direccion || null,
        id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Proveedor no encontrado',
        codigo: 'PROVEEDOR_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Proveedor actualizado correctamente'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Proveedores] Error al actualizar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar el proveedor',
      codigo: 'PROVEEDOR_UPDATE_ERROR'
    });
  }
};

/**
 * Elimina un proveedor.
 * No permite eliminar si tiene registros relacionados.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del proveedor a eliminar
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.eliminarProveedor = async (req, res) => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de proveedor inválido'
    });
  }

  try {
    const [resultado] = await db.query(
      'DELETE FROM mdc_proveedores WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Proveedor no encontrado',
        codigo: 'PROVEEDOR_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Proveedor eliminado correctamente'
    });

  } catch (error) {
    // FK constraint: proveedor tiene registros relacionados
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se puede eliminar: el proveedor tiene registros relacionados',
        codigo: 'PROVEEDOR_CON_REGISTROS'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Proveedores] Error al eliminar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar el proveedor',
      codigo: 'PROVEEDOR_DELETE_ERROR'
    });
  }
};

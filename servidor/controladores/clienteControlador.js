/**
 * =====================================================
 * CONTROLADOR DE CLIENTES
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Gestiona el CRUD de clientes de la librería.
 * Los clientes son necesarios para registrar ventas
 * y mantener historial de compras.
 *
 * @requires ../configuracion/db - Pool de conexiones MySQL
 *
 * TABLA: mdc_clientes
 * - id: INT (PK, AUTO_INCREMENT)
 * - nombre_completo: VARCHAR(100) NOT NULL
 * - documento: VARCHAR(20) UNIQUE NOT NULL
 * - email: VARCHAR(100)
 * - telefono: VARCHAR(20)
 * - direccion: VARCHAR(200)
 * - fecha_registro: TIMESTAMP
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

const db = require('../configuracion/db');
const { aplicarPaginacion } = require('../utilidades/paginacion');

// =====================================================
// CONTROLADORES CRUD
// =====================================================

/**
 * Obtiene el listado de clientes con paginación opcional.
 * Ordenados alfabéticamente por nombre.
 *
 * PAGINACIÓN (opcional):
 * - Sin parámetros: devuelve TODOS los clientes (retrocompatible)
 * - Con pagina/limite: devuelve página específica
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.pagina] - Número de página
 * @param {number} [req.query.limite] - Registros por página
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con array de clientes y paginación
 *
 * @example
 * GET /api/clientes?pagina=1&limite=20
 */
const obtenerClientes = async (req, res) => {
  try {
    const respuesta = await aplicarPaginacion(
      req,
      (limite, offset) => {
        // Con paginación
        if (limite !== undefined) {
          return db.query(
            'SELECT id, nombre_completo, documento, email, telefono, direccion, fecha_registro FROM mdc_clientes ORDER BY nombre_completo ASC LIMIT ? OFFSET ?',
            [limite, offset]
          );
        }
        // Sin paginación
        return db.query(
          'SELECT id, nombre_completo, documento, email, telefono, direccion, fecha_registro FROM mdc_clientes ORDER BY nombre_completo ASC'
        );
      },
      () => db.query('SELECT COUNT(*) as total FROM mdc_clientes')
    );

    res.json(respuesta);

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Clientes] Error al listar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener los clientes',
      codigo: 'CLIENTES_LIST_ERROR'
    });
  }
};

/**
 * Obtiene un cliente específico por su ID.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del cliente
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con datos del cliente
 */
const obtenerClientePorId = async (req, res) => {
  const { id } = req.params; // ID ya validado por middleware validarId

  try {
    const [filas] = await db.query(
      'SELECT id, nombre_completo, documento, email, telefono, direccion, fecha_registro FROM mdc_clientes WHERE id = ?',
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cliente no encontrado',
        codigo: 'CLIENTE_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      datos: filas[0]
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Clientes] Error al obtener:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el cliente',
      codigo: 'CLIENTE_GET_ERROR'
    });
  }
};

/**
 * Crea un nuevo cliente.
 * El documento debe ser único en el sistema.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.body - Datos del cliente
 * @param {string} req.body.nombre_completo - Nombre completo
 * @param {string} req.body.documento - Documento de identidad (único)
 * @param {string} [req.body.email] - Correo electrónico
 * @param {string} [req.body.telefono] - Teléfono de contacto
 * @param {string} [req.body.direccion] - Dirección física
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con el cliente creado
 */
const crearCliente = async (req, res) => {
  const { nombre_completo, documento, email, telefono, direccion } = req.body;

  // Validaciones
  if (!nombre_completo || nombre_completo.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El nombre completo es obligatorio'
    });
  }

  if (!documento || documento.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El documento es obligatorio'
    });
  }

  try {
    // Verificar documento duplicado antes de insertar
    // Esto proporciona un mensaje más claro que el error de UNIQUE
    const [existeDoc] = await db.query(
      'SELECT id FROM mdc_clientes WHERE documento = ?',
      [documento.trim()]
    );

    if (existeDoc.length > 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Ya existe un cliente con este documento',
        codigo: 'DOCUMENTO_DUPLICADO'
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO mdc_clientes
       (nombre_completo, documento, email, telefono, direccion)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nombre_completo.trim(),
        documento.trim(),
        email || null,
        telefono || null,
        direccion || null
      ]
    );

    res.status(201).json({
      exito: true,
      mensaje: 'Cliente creado exitosamente',
      datos: {
        id: resultado.insertId,
        nombre_completo: nombre_completo.trim(),
        documento: documento.trim()
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Clientes] Error al crear:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear el cliente',
      codigo: 'CLIENTE_CREATE_ERROR'
    });
  }
};

/**
 * Actualiza un cliente existente.
 * Si se cambia el documento, debe seguir siendo único.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del cliente
 * @param {Object} req.body - Nuevos datos del cliente
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
const actualizarCliente = async (req, res) => {
  const { id } = req.params; // ID ya validado por middleware validarId
  const { nombre_completo, documento, email, telefono, direccion } = req.body;

  // Validaciones básicas
  if (!nombre_completo || nombre_completo.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El nombre completo es obligatorio'
    });
  }

  if (!documento || documento.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El documento es obligatorio'
    });
  }

  try {
    // Verificar que el cliente existe
    const [existe] = await db.query(
      'SELECT id FROM mdc_clientes WHERE id = ?',
      [id]
    );

    if (existe.length === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cliente no encontrado',
        codigo: 'CLIENTE_NOT_FOUND'
      });
    }

    // Verificar documento duplicado en otro cliente
    const [conflicto] = await db.query(
      'SELECT id FROM mdc_clientes WHERE documento = ? AND id != ?',
      [documento.trim(), id]
    );

    if (conflicto.length > 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El documento ya pertenece a otro cliente',
        codigo: 'DOCUMENTO_DUPLICADO'
      });
    }

    const [resultado] = await db.query(
      `UPDATE mdc_clientes
       SET nombre_completo = ?, documento = ?, email = ?, telefono = ?, direccion = ?
       WHERE id = ?`,
      [
        nombre_completo.trim(),
        documento.trim(),
        email || null,
        telefono || null,
        direccion || null,
        id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se pudo actualizar el cliente'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Cliente actualizado correctamente'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Clientes] Error al actualizar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar el cliente',
      codigo: 'CLIENTE_UPDATE_ERROR'
    });
  }
};

/**
 * Elimina un cliente.
 * No permite eliminar si tiene ventas asociadas.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del cliente a eliminar
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
const eliminarCliente = async (req, res) => {
  const { id } = req.params; // ID ya validado por middleware validarId

  try {
    const [resultado] = await db.query(
      'DELETE FROM mdc_clientes WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cliente no encontrado',
        codigo: 'CLIENTE_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Cliente eliminado correctamente'
    });

  } catch (error) {
    // FK constraint: cliente tiene ventas asociadas
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se puede eliminar: el cliente tiene ventas registradas',
        codigo: 'CLIENTE_CON_VENTAS'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Clientes] Error al eliminar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar el cliente',
      codigo: 'CLIENTE_DELETE_ERROR'
    });
  }
};

// =====================================================
// EXPORTACIÓN
// =====================================================

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};

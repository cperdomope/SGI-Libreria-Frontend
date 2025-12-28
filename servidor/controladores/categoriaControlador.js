/**
 * =====================================================
 * CONTROLADOR DE CATEGORÍAS
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Gestiona el CRUD de categorías de libros.
 * Las categorías permiten clasificar los libros para
 * facilitar búsquedas y organización del inventario.
 *
 * @requires ../configuracion/db - Pool de conexiones MySQL
 *
 * TABLA: mdc_categorias
 * - id: INT (PK, AUTO_INCREMENT)
 * - nombre: VARCHAR(50) UNIQUE
 *
 * NOTA: El nombre es UNIQUE, no pueden existir duplicados.
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

const db = require('../configuracion/db');

// =====================================================
// CONTROLADORES CRUD
// =====================================================

/**
 * Obtiene el listado de todas las categorías.
 * Ordenadas alfabéticamente por nombre.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con array de categorías
 *
 * @example
 * // Response exitoso:
 * { "exito": true, "datos": [{ "id": 1, "nombre": "Ficción" }] }
 */
exports.obtenerCategorias = async (req, res) => {
  try {
    const [categorias] = await db.query(
      'SELECT id, nombre FROM mdc_categorias ORDER BY nombre ASC'
    );

    res.json({
      exito: true,
      datos: categorias,
      total: categorias.length
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Categorías] Error al listar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener las categorías',
      codigo: 'CATEGORIAS_LIST_ERROR'
    });
  }
};

/**
 * Crea una nueva categoría.
 * El nombre debe ser único en el sistema.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.body - Datos de la categoría
 * @param {string} req.body.nombre - Nombre de la categoría
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con la categoría creada
 */
exports.crearCategoria = async (req, res) => {
  const { nombre } = req.body;

  // Validación
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El nombre de la categoría es obligatorio'
    });
  }

  try {
    const [resultado] = await db.query(
      'INSERT INTO mdc_categorias (nombre) VALUES (?)',
      [nombre.trim()]
    );

    res.status(201).json({
      exito: true,
      mensaje: 'Categoría creada exitosamente',
      datos: {
        id: resultado.insertId,
        nombre: nombre.trim()
      }
    });

  } catch (error) {
    // Manejar nombre duplicado (UNIQUE constraint)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        exito: false,
        mensaje: 'Ya existe una categoría con ese nombre',
        codigo: 'CATEGORIA_DUPLICADA'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Categorías] Error al crear:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear la categoría',
      codigo: 'CATEGORIA_CREATE_ERROR'
    });
  }
};

/**
 * Actualiza una categoría existente.
 * El nuevo nombre debe ser único.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la categoría
 * @param {Object} req.body - Nuevos datos
 * @param {string} req.body.nombre - Nuevo nombre
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de categoría inválido'
    });
  }

  // Validar nombre
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El nombre de la categoría es obligatorio'
    });
  }

  try {
    const [resultado] = await db.query(
      'UPDATE mdc_categorias SET nombre = ? WHERE id = ?',
      [nombre.trim(), id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Categoría no encontrada',
        codigo: 'CATEGORIA_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Categoría actualizada exitosamente'
    });

  } catch (error) {
    // Manejar nombre duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        exito: false,
        mensaje: 'Ya existe otra categoría con ese nombre',
        codigo: 'CATEGORIA_DUPLICADA'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Categorías] Error al actualizar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar la categoría',
      codigo: 'CATEGORIA_UPDATE_ERROR'
    });
  }
};

/**
 * Elimina una categoría.
 * Verifica primero que no tenga libros asociados.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la categoría a eliminar
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.eliminarCategoria = async (req, res) => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de categoría inválido'
    });
  }

  try {
    // Verificar dependencias antes de eliminar
    // Esto proporciona un mensaje más claro que el error de FK
    const [libros] = await db.query(
      'SELECT COUNT(*) as total FROM mdc_libros WHERE categoria_id = ?',
      [id]
    );

    if (libros[0].total > 0) {
      return res.status(400).json({
        exito: false,
        mensaje: `No se puede eliminar: hay ${libros[0].total} libro(s) asociado(s) a esta categoría`,
        codigo: 'CATEGORIA_CON_LIBROS'
      });
    }

    const [resultado] = await db.query(
      'DELETE FROM mdc_categorias WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Categoría no encontrada',
        codigo: 'CATEGORIA_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Categoría eliminada exitosamente'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Categorías] Error al eliminar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar la categoría',
      codigo: 'CATEGORIA_DELETE_ERROR'
    });
  }
};

/**
 * =====================================================
 * CONTROLADOR DE AUTORES
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Gestiona el CRUD de autores de libros.
 * Los autores se relacionan con libros mediante FK autor_id.
 *
 * @requires ../configuracion/db - Pool de conexiones MySQL
 *
 * TABLA: mdc_autores
 * - id: INT (PK, AUTO_INCREMENT)
 * - nombre: VARCHAR(100)
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

const db = require('../configuracion/db');

// =====================================================
// CONTROLADORES CRUD
// =====================================================

/**
 * Obtiene el listado de todos los autores.
 * Ordenados alfabéticamente por nombre.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con array de autores
 *
 * @example
 * // Response exitoso:
 * { "exito": true, "datos": [{ "id": 1, "nombre": "Gabriel García Márquez" }] }
 */
exports.obtenerAutores = async (req, res) => {
  try {
    const [autores] = await db.query(
      'SELECT id, nombre FROM mdc_autores ORDER BY nombre ASC'
    );

    res.json({
      exito: true,
      datos: autores,
      total: autores.length
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Autores] Error al listar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener los autores',
      codigo: 'AUTORES_LIST_ERROR'
    });
  }
};

/**
 * Crea un nuevo autor.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.body - Datos del autor
 * @param {string} req.body.nombre - Nombre del autor
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con el autor creado
 */
exports.crearAutor = async (req, res) => {
  const { nombre } = req.body;

  // Validación
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El nombre del autor es obligatorio'
    });
  }

  try {
    const [resultado] = await db.query(
      'INSERT INTO mdc_autores (nombre) VALUES (?)',
      [nombre.trim()]
    );

    res.status(201).json({
      exito: true,
      mensaje: 'Autor creado exitosamente',
      datos: {
        id: resultado.insertId,
        nombre: nombre.trim()
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Autores] Error al crear:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear el autor',
      codigo: 'AUTOR_CREATE_ERROR'
    });
  }
};

/**
 * Actualiza un autor existente.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del autor
 * @param {Object} req.body - Nuevos datos
 * @param {string} req.body.nombre - Nuevo nombre
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.actualizarAutor = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de autor inválido'
    });
  }

  // Validar nombre
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El nombre del autor es obligatorio'
    });
  }

  try {
    const [resultado] = await db.query(
      'UPDATE mdc_autores SET nombre = ? WHERE id = ?',
      [nombre.trim(), id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Autor no encontrado',
        codigo: 'AUTOR_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Autor actualizado exitosamente'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Autores] Error al actualizar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar el autor',
      codigo: 'AUTOR_UPDATE_ERROR'
    });
  }
};

/**
 * Elimina un autor.
 * Verifica primero que no tenga libros asociados.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del autor a eliminar
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.eliminarAutor = async (req, res) => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de autor inválido'
    });
  }

  try {
    // Verificar dependencias antes de eliminar
    // Esto da mejor mensaje que dejar que falle la FK
    const [libros] = await db.query(
      'SELECT COUNT(*) as total FROM mdc_libros WHERE autor_id = ?',
      [id]
    );

    if (libros[0].total > 0) {
      return res.status(400).json({
        exito: false,
        mensaje: `No se puede eliminar: hay ${libros[0].total} libro(s) asociado(s) a este autor`,
        codigo: 'AUTOR_CON_LIBROS'
      });
    }

    const [resultado] = await db.query(
      'DELETE FROM mdc_autores WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Autor no encontrado',
        codigo: 'AUTOR_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Autor eliminado exitosamente'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Autores] Error al eliminar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar el autor',
      codigo: 'AUTOR_DELETE_ERROR'
    });
  }
};

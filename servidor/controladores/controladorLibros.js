/**
 * =====================================================
 * CONTROLADOR DE LIBROS (INVENTARIO)
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Gestiona el CRUD del inventario principal de libros.
 * Este módulo es el núcleo del sistema ya que los libros son
 * la entidad central relacionada con ventas, movimientos y reportes.
 *
 * @requires ../configuracion/db - Pool de conexiones MySQL
 *
 * TABLAS RELACIONADAS:
 * - mdc_libros: Tabla principal
 * - mdc_autores: FK autor_id
 * - mdc_categorias: FK categoria_id
 * - mdc_movimientos: Historial de entradas/salidas
 * - mdc_detalle_ventas: Ventas realizadas
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

const db = require('../configuracion/db');

// =====================================================
// CONTROLADORES CRUD
// =====================================================

/**
 * Obtiene el listado completo de libros con información relacionada.
 * Optimizado para el módulo POS (Punto de Venta).
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con array de libros
 *
 * @example
 * // Response exitoso:
 * [
 *   {
 *     "id": 1,
 *     "isbn": "978-0307474728",
 *     "titulo": "Cien Años de Soledad",
 *     "precio_venta": 45000.00,
 *     "stock_actual": 15,
 *     "autor": "Gabriel García Márquez",
 *     "categoria": "Ficción"
 *   }
 * ]
 */
exports.obtenerLibros = async (req, res) => {
  try {
    // LEFT JOIN para incluir libros sin autor/categoría asignados
    // CAST asegura tipos correctos para el frontend
    const [filas] = await db.query(`
      SELECT
        l.id,
        l.isbn,
        l.titulo,
        l.autor_id,
        l.categoria_id,
        CAST(l.precio_venta AS DECIMAL(10,2)) AS precio_venta,
        CAST(l.stock_actual AS UNSIGNED) AS stock_actual,
        l.stock_minimo,
        a.nombre AS autor,
        c.nombre AS categoria
      FROM mdc_libros l
      LEFT JOIN mdc_autores a ON l.autor_id = a.id
      LEFT JOIN mdc_categorias c ON l.categoria_id = c.id
      ORDER BY l.titulo ASC
    `);

    res.json({
      exito: true,
      datos: filas,
      total: filas.length
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Libros] Error al listar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener los libros',
      codigo: 'LIBROS_LIST_ERROR'
    });
  }
};

/**
 * Crea un nuevo libro en el inventario.
 * El stock inicial es 0, se incrementa mediante movimientos de ENTRADA.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.body - Datos del libro
 * @param {string} req.body.isbn - Código ISBN único
 * @param {string} req.body.titulo - Título del libro
 * @param {number} [req.body.autor_id] - ID del autor (opcional)
 * @param {number} [req.body.categoria_id] - ID de categoría (opcional)
 * @param {number} req.body.precio_venta - Precio de venta
 * @param {number} [req.body.stock_minimo=5] - Umbral de alerta de stock
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.crearLibro = async (req, res) => {
  const { isbn, titulo, autor_id, categoria_id, precio_venta, stock_minimo } = req.body;

  // Validaciones básicas
  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El título del libro es obligatorio'
    });
  }

  if (!precio_venta || precio_venta <= 0) {
    return res.status(400).json({
      exito: false,
      mensaje: 'El precio de venta debe ser mayor a cero'
    });
  }

  try {
    // Stock inicial en 0: se incrementa con movimientos de ENTRADA
    // Esto garantiza trazabilidad completa del inventario
    const [resultado] = await db.query(
      `INSERT INTO mdc_libros
       (isbn, titulo, autor_id, categoria_id, precio_venta, stock_minimo, stock_actual)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        isbn || null,
        titulo.trim(),
        autor_id || null,
        categoria_id || null,
        precio_venta,
        stock_minimo || 5
      ]
    );

    res.status(201).json({
      exito: true,
      mensaje: 'Libro creado exitosamente',
      id: resultado.insertId
    });

  } catch (error) {
    // Manejar error de ISBN duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        exito: false,
        mensaje: 'El ISBN ingresado ya existe en el sistema',
        codigo: 'ISBN_DUPLICADO'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Libros] Error al crear:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear el libro',
      codigo: 'LIBRO_CREATE_ERROR'
    });
  }
};

/**
 * Actualiza los datos de un libro existente.
 * No modifica el stock (eso se hace vía movimientos).
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del libro a actualizar
 * @param {Object} req.body - Nuevos datos del libro
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.actualizarLibro = async (req, res) => {
  const { id } = req.params;
  const { isbn, titulo, autor_id, categoria_id, precio_venta, stock_minimo } = req.body;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de libro inválido'
    });
  }

  // Validaciones básicas
  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El título del libro es obligatorio'
    });
  }

  try {
    // No actualizamos stock_actual directamente
    // Los cambios de stock deben pasar por el módulo de movimientos
    const [resultado] = await db.query(
      `UPDATE mdc_libros
       SET isbn = ?, titulo = ?, autor_id = ?, categoria_id = ?,
           precio_venta = ?, stock_minimo = ?
       WHERE id = ?`,
      [
        isbn || null,
        titulo.trim(),
        autor_id || null,
        categoria_id || null,
        precio_venta,
        stock_minimo || 5,
        id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Libro no encontrado',
        codigo: 'LIBRO_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Libro actualizado correctamente'
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        exito: false,
        mensaje: 'El ISBN ingresado ya existe en otro libro',
        codigo: 'ISBN_DUPLICADO'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Libros] Error al actualizar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar el libro',
      codigo: 'LIBRO_UPDATE_ERROR'
    });
  }
};

/**
 * Elimina un libro del inventario.
 * Solo permite eliminar si no tiene historial de movimientos o ventas.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del libro a eliminar
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 */
exports.eliminarLibro = async (req, res) => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      exito: false,
      mensaje: 'ID de libro inválido'
    });
  }

  try {
    const [resultado] = await db.query(
      'DELETE FROM mdc_libros WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Libro no encontrado',
        codigo: 'LIBRO_NOT_FOUND'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Libro eliminado correctamente'
    });

  } catch (error) {
    // FK constraint: libro tiene movimientos o ventas asociadas
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se puede eliminar: el libro tiene historial de movimientos o ventas',
        codigo: 'LIBRO_CON_HISTORIAL'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Libros] Error al eliminar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar el libro',
      codigo: 'LIBRO_DELETE_ERROR'
    });
  }
};

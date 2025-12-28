/**
 * =====================================================
 * CONTROLADOR DE MOVIMIENTOS (KARDEX)
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Gestiona el registro de entradas y salidas de inventario.
 * Cada movimiento actualiza automáticamente el stock del libro
 * y mantiene un historial completo para auditoría.
 *
 * @requires ../configuracion/db - Pool de conexiones MySQL
 *
 * TIPOS DE MOVIMIENTO:
 * - ENTRADA: Compra a proveedor, devolución de cliente, ajuste positivo
 * - SALIDA: Venta (automático desde módulo ventas), pérdida, ajuste negativo
 *
 * IMPORTANTE - TRANSACCIONES:
 * Este módulo usa transacciones porque realiza dos operaciones
 * que deben ser atómicas: insertar movimiento + actualizar stock.
 * Si una falla, ambas se revierten.
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

const db = require('../configuracion/db');

// =====================================================
// CONSTANTES
// =====================================================

/**
 * Tipos de movimiento válidos.
 * Deben coincidir con el ENUM de la tabla mdc_movimientos.
 *
 * @constant {Object}
 */
const TIPOS_MOVIMIENTO = {
  ENTRADA: 'ENTRADA',
  SALIDA: 'SALIDA'
};

// =====================================================
// CONTROLADOR
// =====================================================

/**
 * Registra un movimiento de inventario (entrada o salida).
 * Actualiza automáticamente el stock del libro afectado.
 *
 * FLUJO:
 * 1. Validar datos de entrada
 * 2. Si es SALIDA, verificar stock suficiente
 * 3. Iniciar transacción
 * 4. Insertar registro en mdc_movimientos (historial)
 * 5. Actualizar stock en mdc_libros
 * 6. Confirmar transacción
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.body - Datos del movimiento
 * @param {number} req.body.libro_id - ID del libro afectado
 * @param {string} req.body.tipo_movimiento - 'ENTRADA' o 'SALIDA'
 * @param {number} req.body.cantidad - Cantidad de unidades
 * @param {string} [req.body.observaciones] - Notas adicionales
 * @param {Object} req.usuario - Usuario autenticado (del middleware JWT)
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con mensaje de éxito o error
 *
 * @example
 * // Request body para entrada de mercancía:
 * {
 *   "libro_id": 1,
 *   "tipo_movimiento": "ENTRADA",
 *   "cantidad": 50,
 *   "observaciones": "Compra a proveedor Editorial Nacional"
 * }
 */
exports.registrarMovimiento = async (req, res) => {
  let { libro_id, tipo_movimiento, cantidad, observaciones } = req.body;

  // ─────────────────────────────────────────────────
  // VALIDACIÓN DE ENTRADA
  // ─────────────────────────────────────────────────

  // Validar campos requeridos
  if (!libro_id || !tipo_movimiento || !cantidad) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Datos incompletos: se requiere libro_id, tipo_movimiento y cantidad'
    });
  }

  // Convertir y validar libro_id
  libro_id = parseInt(libro_id, 10);
  if (isNaN(libro_id) || libro_id <= 0) {
    return res.status(400).json({
      exito: false,
      mensaje: 'El libro_id debe ser un número válido mayor a cero'
    });
  }

  // Convertir y validar cantidad
  cantidad = parseInt(cantidad, 10);
  if (isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({
      exito: false,
      mensaje: 'La cantidad debe ser un número entero mayor a cero'
    });
  }

  // Validar tipo de movimiento
  if (!Object.values(TIPOS_MOVIMIENTO).includes(tipo_movimiento)) {
    return res.status(400).json({
      exito: false,
      mensaje: `Tipo de movimiento inválido. Use: ${Object.values(TIPOS_MOVIMIENTO).join(' o ')}`
    });
  }

  // Validar autenticación
  // SEGURIDAD: No usar fallback a ID 1, debe fallar si no hay usuario
  if (!req.usuario?.id) {
    return res.status(401).json({
      exito: false,
      mensaje: 'Se requiere autenticación para registrar movimientos'
    });
  }

  // ─────────────────────────────────────────────────
  // INICIO DE TRANSACCIÓN
  // ─────────────────────────────────────────────────

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // ─────────────────────────────────────────────────
    // VERIFICAR EXISTENCIA DEL LIBRO
    // ─────────────────────────────────────────────────

    const [libroRows] = await connection.query(
      'SELECT id, stock_actual, titulo FROM mdc_libros WHERE id = ?',
      [libro_id]
    );

    if (libroRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        exito: false,
        mensaje: 'El libro especificado no existe',
        codigo: 'LIBRO_NOT_FOUND'
      });
    }

    const libro = libroRows[0];

    // ─────────────────────────────────────────────────
    // VALIDAR STOCK PARA SALIDAS
    // Evitar stock negativo
    // ─────────────────────────────────────────────────

    if (tipo_movimiento === TIPOS_MOVIMIENTO.SALIDA) {
      if (libro.stock_actual < cantidad) {
        await connection.rollback();
        return res.status(400).json({
          exito: false,
          mensaje: `Stock insuficiente para "${libro.titulo}". Disponible: ${libro.stock_actual}, Solicitado: ${cantidad}`,
          codigo: 'STOCK_INSUFICIENTE'
        });
      }
    }

    // ─────────────────────────────────────────────────
    // PASO 1: REGISTRAR MOVIMIENTO EN HISTORIAL
    // ─────────────────────────────────────────────────

    await connection.query(
      `INSERT INTO mdc_movimientos
       (libro_id, tipo_movimiento, cantidad, usuario_id, observaciones)
       VALUES (?, ?, ?, ?, ?)`,
      [libro_id, tipo_movimiento, cantidad, req.usuario.id, observaciones || null]
    );

    // ─────────────────────────────────────────────────
    // PASO 2: ACTUALIZAR STOCK DEL LIBRO
    // ENTRADA suma (+), SALIDA resta (-)
    // ─────────────────────────────────────────────────

    const operador = tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA ? '+' : '-';

    await connection.query(
      `UPDATE mdc_libros SET stock_actual = stock_actual ${operador} ? WHERE id = ?`,
      [cantidad, libro_id]
    );

    // ─────────────────────────────────────────────────
    // CONFIRMAR TRANSACCIÓN
    // ─────────────────────────────────────────────────

    await connection.commit();

    // Log solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Movimiento] ${tipo_movimiento} de ${cantidad} unidades para libro #${libro_id}`);
    }

    // Calcular nuevo stock para informar al usuario
    const nuevoStock = tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA
      ? libro.stock_actual + cantidad
      : libro.stock_actual - cantidad;

    res.status(201).json({
      exito: true,
      mensaje: 'Movimiento registrado exitosamente',
      datos: {
        tipo: tipo_movimiento,
        cantidad: cantidad,
        libro: libro.titulo,
        stock_anterior: libro.stock_actual,
        stock_actual: nuevoStock
      }
    });

  } catch (error) {
    // Rollback si hay error
    if (connection) {
      await connection.rollback();
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Movimiento] Error:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al procesar el movimiento',
      codigo: 'MOVIMIENTO_ERROR'
    });

  } finally {
    // Siempre liberar la conexión
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Obtiene el historial de movimientos.
 * Puede filtrarse por libro_id vía query params.
 *
 * @async
 * @param {Object} req - Request de Express
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.libro_id] - Filtrar por libro específico
 * @param {Object} res - Response de Express
 * @returns {Promise<void>} JSON con array de movimientos
 */
exports.obtenerMovimientos = async (req, res) => {
  const { libro_id } = req.query;

  try {
    let sql = `
      SELECT
        m.id,
        m.tipo_movimiento,
        m.cantidad,
        m.fecha_movimiento,
        m.observaciones,
        l.titulo AS libro,
        l.isbn,
        u.nombre_completo AS usuario
      FROM mdc_movimientos m
      JOIN mdc_libros l ON m.libro_id = l.id
      JOIN mdc_usuarios u ON m.usuario_id = u.id
    `;

    const params = [];

    // Filtro opcional por libro
    if (libro_id) {
      sql += ' WHERE m.libro_id = ?';
      params.push(libro_id);
    }

    sql += ' ORDER BY m.fecha_movimiento DESC';

    const [rows] = await db.query(sql, params);

    res.json({
      exito: true,
      datos: rows,
      total: rows.length
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Movimiento] Error al listar:', error);
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el historial de movimientos',
      codigo: 'MOVIMIENTOS_LIST_ERROR'
    });
  }
};

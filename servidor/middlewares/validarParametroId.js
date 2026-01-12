/**
 * =====================================================
 * MIDDLEWARE DE VALIDACIÓN DE PARÁMETRO ID
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Middleware reutilizable para validar parámetros ID
 * en las rutas. Evita duplicación de código de validación.
 *
 * @author Equipo de Desarrollo SGI
 * @version 1.0.0
 */

/**
 * Middleware que valida que el parámetro ID sea un número válido.
 *
 * PROBLEMA QUE RESUELVE:
 * Este código se repetía 13+ veces en diferentes controladores:
 * ```
 * if (!id || isNaN(parseInt(id))) {
 *   return res.status(400).json({ exito: false, mensaje: '...' });
 * }
 * ```
 *
 * USO:
 * Aplicar este middleware en rutas que tengan parámetros como :id
 *
 * COMPORTAMIENTO:
 * - Si el ID es válido: continúa al siguiente middleware/controlador
 * - Si el ID es inválido: responde con error 400 y detiene la ejecución
 *
 * @param {string} nombreParametro - Nombre del parámetro a validar (ej: 'id')
 * @param {string} [nombreEntidad] - Nombre de la entidad para mensajes (ej: 'libro', 'cliente')
 * @returns {Function} Middleware de Express
 *
 * @example
 * // En las rutas:
 * router.get('/libros/:id', validarParametroId('id', 'libro'), obtenerLibroPorId);
 * router.put('/clientes/:id', validarParametroId('id', 'cliente'), actualizarCliente);
 * router.delete('/autores/:id', validarParametroId('id', 'autor'), eliminarAutor);
 */
const validarParametroId = (nombreParametro = 'id', nombreEntidad = 'recurso') => {
  return (req, res, next) => {
    const valor = req.params[nombreParametro];

    // Validar que el parámetro existe
    if (!valor) {
      return res.status(400).json({
        exito: false,
        mensaje: `El parámetro '${nombreParametro}' es requerido`,
        codigo: 'PARAMETRO_FALTANTE'
      });
    }

    // Convertir a número
    const id = parseInt(valor, 10);

    // Validar que sea un número válido y positivo
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        exito: false,
        mensaje: `ID de ${nombreEntidad} inválido. Debe ser un número entero positivo.`,
        codigo: 'ID_INVALIDO'
      });
    }

    // Almacenar el ID parseado en req.params para que los controladores
    // no tengan que parsearlo nuevamente
    req.params[nombreParametro] = id;

    // Continuar al siguiente middleware/controlador
    next();
  };
};

/**
 * Middleware específico para validar el parámetro 'id' (el más común).
 * Alias de validarParametroId('id') para uso más simple.
 *
 * @param {string} [nombreEntidad='recurso'] - Nombre de la entidad
 * @returns {Function} Middleware de Express
 *
 * @example
 * // Uso simplificado:
 * router.get('/libros/:id', validarId('libro'), obtenerLibroPorId);
 */
const validarId = (nombreEntidad = 'recurso') => {
  return validarParametroId('id', nombreEntidad);
};

/**
 * Middleware para validar múltiples IDs en diferentes parámetros.
 * Útil para rutas con múltiples parámetros.
 *
 * @param {Object} configuracion - Objeto con parámetros a validar
 * @returns {Function} Middleware de Express
 *
 * @example
 * // Para ruta como /ventas/:ventaId/detalles/:detalleId
 * router.get(
 *   '/ventas/:ventaId/detalles/:detalleId',
 *   validarMultiplesIds({
 *     ventaId: 'venta',
 *     detalleId: 'detalle'
 *   }),
 *   obtenerDetalleVenta
 * );
 */
const validarMultiplesIds = (configuracion) => {
  return (req, res, next) => {
    for (const [nombreParametro, nombreEntidad] of Object.entries(configuracion)) {
      const valor = req.params[nombreParametro];

      if (!valor) {
        return res.status(400).json({
          exito: false,
          mensaje: `El parámetro '${nombreParametro}' es requerido`,
          codigo: 'PARAMETRO_FALTANTE'
        });
      }

      const id = parseInt(valor, 10);

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          exito: false,
          mensaje: `ID de ${nombreEntidad} inválido. Debe ser un número entero positivo.`,
          codigo: 'ID_INVALIDO'
        });
      }

      req.params[nombreParametro] = id;
    }

    next();
  };
};

// =====================================================
// EXPORTACIÓN
// =====================================================

module.exports = {
  validarParametroId,
  validarId,
  validarMultiplesIds
};

/**
 * =====================================================
 * UTILIDADES DE RESPUESTAS HTTP
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Funciones reutilizables para generar respuestas
 * HTTP estandarizadas. Evita duplicación de estructura de respuestas.
 *
 * PROBLEMA QUE RESUELVE:
 * Este código se repetía en múltiples controladores:
 * ```
 * res.json({
 *   exito: true,
 *   datos: filas,
 *   total: filas.length
 * });
 * ```
 *
 * @author Equipo de Desarrollo SGI
 * @version 1.0.0
 */

// =====================================================
// RESPUESTAS DE ÉXITO
// =====================================================

/**
 * Genera una respuesta de éxito estándar.
 *
 * @param {*} datos - Datos a enviar en la respuesta
 * @param {string} [mensaje] - Mensaje opcional de éxito
 * @param {Object} [metadataAdicional] - Metadata adicional
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.json(respuestaExito(libros, 'Libros obtenidos correctamente'));
 */
const respuestaExito = (datos, mensaje = null, metadataAdicional = {}) => {
  const respuesta = {
    exito: true,
    datos
  };

  // Agregar total si es un array
  if (Array.isArray(datos)) {
    respuesta.total = datos.length;
  }

  // Agregar mensaje si se proporciona
  if (mensaje) {
    respuesta.mensaje = mensaje;
  }

  // Agregar metadata adicional (ej: paginación)
  return { ...respuesta, ...metadataAdicional };
};

/**
 * Genera una respuesta de éxito para operación create/update/delete.
 *
 * @param {string} mensaje - Mensaje de éxito
 * @param {Object} [datos] - Datos opcionales (ej: ID del registro creado)
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(201).json(respuestaOperacionExitosa('Libro creado correctamente', { id: 123 }));
 */
const respuestaOperacionExitosa = (mensaje, datos = {}) => {
  return {
    exito: true,
    mensaje,
    ...datos
  };
};

/**
 * Genera una respuesta de éxito para operación create.
 * Helper específico para creación de recursos.
 *
 * @param {string} recurso - Nombre del recurso creado (ej: 'libro', 'cliente')
 * @param {number|string} id - ID del recurso creado
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(201).json(respuestaCreado('libro', resultado.insertId));
 */
const respuestaCreado = (recurso, id) => {
  return {
    exito: true,
    mensaje: `${recurso.charAt(0).toUpperCase() + recurso.slice(1)} creado exitosamente`,
    id
  };
};

/**
 * Genera una respuesta de éxito para operación update.
 *
 * @param {string} recurso - Nombre del recurso actualizado
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.json(respuestaActualizado('cliente'));
 */
const respuestaActualizado = (recurso) => {
  return {
    exito: true,
    mensaje: `${recurso.charAt(0).toUpperCase() + recurso.slice(1)} actualizado correctamente`
  };
};

/**
 * Genera una respuesta de éxito para operación delete.
 *
 * @param {string} recurso - Nombre del recurso eliminado
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.json(respuestaEliminado('autor'));
 */
const respuestaEliminado = (recurso) => {
  return {
    exito: true,
    mensaje: `${recurso.charAt(0).toUpperCase() + recurso.slice(1)} eliminado correctamente`
  };
};

// =====================================================
// RESPUESTAS DE ERROR
// =====================================================

/**
 * Genera una respuesta de error estándar.
 *
 * @param {string} mensaje - Mensaje de error
 * @param {string} [codigo] - Código de error (ej: 'LIBRO_NOT_FOUND')
 * @param {Object} [detalles] - Detalles adicionales del error
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(404).json(respuestaError('Libro no encontrado', 'LIBRO_NOT_FOUND'));
 */
const respuestaError = (mensaje, codigo = null, detalles = {}) => {
  const respuesta = {
    exito: false,
    mensaje
  };

  if (codigo) {
    respuesta.codigo = codigo;
  }

  return { ...respuesta, ...detalles };
};

/**
 * Genera una respuesta de error 400 (Bad Request) - Validación fallida.
 *
 * @param {string} mensaje - Mensaje de error de validación
 * @param {Array|Object} [errores] - Errores de validación detallados
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(400).json(
 *   respuestaErrorValidacion('Datos inválidos', ['El título es obligatorio'])
 * );
 */
const respuestaErrorValidacion = (mensaje, errores = null) => {
  const respuesta = {
    exito: false,
    mensaje,
    codigo: 'VALIDACION_ERROR'
  };

  if (errores) {
    respuesta.errores = errores;
  }

  return respuesta;
};

/**
 * Genera una respuesta de error 404 (Not Found).
 *
 * @param {string} recurso - Nombre del recurso no encontrado
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(404).json(respuestaNoEncontrado('libro'));
 */
const respuestaNoEncontrado = (recurso) => {
  return {
    exito: false,
    mensaje: `${recurso.charAt(0).toUpperCase() + recurso.slice(1)} no encontrado`,
    codigo: `${recurso.toUpperCase()}_NOT_FOUND`
  };
};

/**
 * Genera una respuesta de error 409 (Conflict) - Duplicado.
 *
 * @param {string} campo - Campo que está duplicado (ej: 'ISBN', 'documento')
 * @param {string} [recurso] - Nombre del recurso
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(409).json(respuestaDuplicado('ISBN', 'libro'));
 */
const respuestaDuplicado = (campo, recurso = null) => {
  const mensaje = recurso
    ? `Ya existe un ${recurso} con este ${campo}`
    : `El ${campo} ya está registrado`;

  return {
    exito: false,
    mensaje,
    codigo: `${campo.toUpperCase()}_DUPLICADO`
  };
};

/**
 * Genera una respuesta de error 500 (Internal Server Error).
 *
 * @param {string} operacion - Operación que falló (ej: 'crear el libro')
 * @param {Error} [error] - Objeto de error (solo en desarrollo)
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(500).json(
 *   respuestaErrorServidor('obtener libros', error)
 * );
 */
const respuestaErrorServidor = (operacion, error = null) => {
  const respuesta = {
    exito: false,
    mensaje: `Error al ${operacion}. Intente nuevamente.`,
    codigo: 'SERVER_ERROR'
  };

  // Solo incluir detalles del error en desarrollo
  if (process.env.NODE_ENV === 'development' && error) {
    respuesta.detalleError = error.message;
    respuesta.stack = error.stack;
  }

  return respuesta;
};

/**
 * Genera una respuesta de error 403 (Forbidden) - Sin permisos.
 *
 * @param {string} [mensaje] - Mensaje personalizado
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(403).json(respuestaNoAutorizado('No tienes permisos para eliminar usuarios'));
 */
const respuestaNoAutorizado = (mensaje = 'No tienes permisos para realizar esta acción') => {
  return {
    exito: false,
    mensaje,
    codigo: 'FORBIDDEN'
  };
};

/**
 * Genera una respuesta de error 401 (Unauthorized) - No autenticado.
 *
 * @param {string} [mensaje] - Mensaje personalizado
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * res.status(401).json(respuestaNoAutenticado());
 */
const respuestaNoAutenticado = (mensaje = 'Se requiere autenticación') => {
  return {
    exito: false,
    mensaje,
    codigo: 'UNAUTHORIZED'
  };
};

// =====================================================
// HELPERS DE LOGGING
// =====================================================

/**
 * Log de error en consola solo en desarrollo.
 *
 * @param {string} modulo - Nombre del módulo (ej: '[Libros]')
 * @param {string} operacion - Operación que falló
 * @param {Error} error - Objeto de error
 *
 * @example
 * logError('[Libros]', 'crear libro', error);
 */
const logError = (modulo, operacion, error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`${modulo} Error al ${operacion}:`, error.message);
    console.error('Stack:', error.stack);
  }
};

// =====================================================
// EXPORTACIÓN
// =====================================================

module.exports = {
  // Respuestas de éxito
  respuestaExito,
  respuestaOperacionExitosa,
  respuestaCreado,
  respuestaActualizado,
  respuestaEliminado,

  // Respuestas de error
  respuestaError,
  respuestaErrorValidacion,
  respuestaNoEncontrado,
  respuestaDuplicado,
  respuestaErrorServidor,
  respuestaNoAutorizado,
  respuestaNoAutenticado,

  // Helpers
  logError
};

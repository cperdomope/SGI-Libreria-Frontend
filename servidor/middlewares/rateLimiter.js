/**
 * =====================================================
 * MIDDLEWARE DE RATE LIMITING
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Limita el número de peticiones por IP para prevenir:
 * - Ataques de fuerza bruta
 * - Spam de peticiones
 * - Abuso de recursos del servidor
 * - Scraping excesivo
 *
 * INSTALACIÓN REQUERIDA:
 * npm install express-rate-limit
 *
 * @requires express-rate-limit
 * @author Equipo de Desarrollo SGI
 * @version 1.0.0
 */

// Intentar cargar express-rate-limit
let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (error) {
  // Si no está instalado, exportar middlewares vacíos
  console.warn('[Rate Limit] express-rate-limit no está instalado. Rate limiting desactivado.');
  console.warn('[Rate Limit] Instala con: npm install express-rate-limit');

  // Exportar funciones dummy que no hacen nada
  module.exports = {
    limiterGeneral: (req, res, next) => next(),
    limiterAuth: (req, res, next) => next(),
    limiterAPI: (req, res, next) => next(),
    limiterEstricto: (req, res, next) => next()
  };
  return; // Detener ejecución del resto del archivo
}

// =====================================================
// CONFIGURACIÓN DE RATE LIMITERS
// =====================================================

/**
 * Rate Limiter General - Para rutas públicas.
 *
 * Configuración permisiva para endpoints de consulta general.
 * Permite gran volumen de peticiones.
 */
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 1000, // Máximo 1000 peticiones por ventana
  message: {
    exito: false,
    mensaje: 'Demasiadas peticiones desde esta IP. Intente nuevamente en 15 minutos.',
    codigo: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Retornar info de rate limit en headers RateLimit-*
  legacyHeaders: false, // Desactivar headers X-RateLimit-* (obsoletos)
  skip: (req) => {
    // Opcional: Saltar rate limiting en desarrollo
    return process.env.NODE_ENV === 'development';
  }
});

/**
 * Rate Limiter para Autenticación - Endpoints sensibles.
 *
 * Configuración estricta para login/registro.
 * Previene ataques de fuerza bruta.
 */
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 10, // Máximo 10 intentos por ventana
  message: {
    exito: false,
    mensaje: 'Demasiados intentos de autenticación. Por seguridad, intente nuevamente en 15 minutos.',
    codigo: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos (solo fallidos)
  skip: (req) => process.env.NODE_ENV === 'development'
});

/**
 * Rate Limiter para API General - Endpoints protegidos.
 *
 * Configuración moderada para usuarios autenticados.
 * Permite uso normal pero previene abuso.
 */
const limiterAPI = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 500, // Máximo 500 peticiones por ventana
  message: {
    exito: false,
    mensaje: 'Ha excedido el límite de peticiones permitidas. Intente nuevamente en 15 minutos.',
    codigo: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

/**
 * Rate Limiter Estricto - Operaciones críticas.
 *
 * Configuración muy restrictiva para operaciones sensibles:
 * - Eliminación de registros
 * - Cambios masivos
 * - Exportación de datos
 */
const limiterEstricto = rateLimit({
  windowMs: 60 * 60 * 1000, // Ventana de 1 hora
  max: 20, // Máximo 20 peticiones por hora
  message: {
    exito: false,
    mensaje: 'Ha excedido el límite de operaciones sensibles. Intente nuevamente en 1 hora.',
    codigo: 'STRICT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

// =====================================================
// FUNCIÓN HELPER PARA RATE LIMITING PERSONALIZADO
// =====================================================

/**
 * Crea un rate limiter personalizado con configuración específica.
 *
 * @param {Object} opciones - Opciones de configuración
 * @param {number} opciones.windowMs - Ventana de tiempo en ms
 * @param {number} opciones.max - Máximo de peticiones
 * @param {string} opciones.mensaje - Mensaje de error personalizado
 * @returns {Function} Middleware de rate limiting
 *
 * @example
 * const limiterCustom = crearLimiter({
 *   windowMs: 60000,
 *   max: 5,
 *   mensaje: 'Solo 5 peticiones por minuto permitidas'
 * });
 */
const crearLimiter = (opciones) => {
  return rateLimit({
    windowMs: opciones.windowMs,
    max: opciones.max,
    message: {
      exito: false,
      mensaje: opciones.mensaje,
      codigo: 'CUSTOM_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development'
  });
};

// =====================================================
// EXPORTACIÓN
// =====================================================

module.exports = {
  limiterGeneral,
  limiterAuth,
  limiterAPI,
  limiterEstricto,
  crearLimiter
};

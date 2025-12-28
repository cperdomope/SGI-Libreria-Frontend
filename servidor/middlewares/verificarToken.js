/**
 * =====================================================
 * MIDDLEWARE DE VERIFICACIÓN DE TOKEN JWT
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Este middleware intercepta las peticiones a rutas protegidas,
 * verifica la validez del token JWT y extrae la información del usuario
 * para hacerla disponible en los controladores.
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica la autenticación mediante token JWT.
 * Debe usarse en todas las rutas que requieran usuario autenticado.
 *
 * @function verificarToken
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.headers - Headers de la petición
 * @param {string} req.headers.authorization - Header con formato "Bearer TOKEN"
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * @returns {void} Continúa la cadena o responde con error
 *
 * @example
 * // Uso en archivo de rutas
 * const verificarToken = require('../middlewares/verificarToken');
 * router.get('/ruta-protegida', verificarToken, controlador.funcion);
 *
 * // El controlador puede acceder a req.usuario
 * // req.usuario = { id, rol, nombre, email }
 */
const verificarToken = (req, res, next) => {
  // ─────────────────────────────────────────────────
  // PASO 1: Extraer el header de autorización
  // El cliente debe enviar: Authorization: Bearer <token>
  // ─────────────────────────────────────────────────
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Acceso denegado. Token no proporcionado.',
      exito: false,
      codigo: 'TOKEN_MISSING'
    });
  }

  // ─────────────────────────────────────────────────
  // PASO 2: Extraer el token del header
  // Formato esperado: "Bearer eyJhbGciOiJIUzI1NiIs..."
  // El split separa "Bearer" del token real
  // ─────────────────────────────────────────────────
  const partes = authHeader.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Formato de token inválido. Use: Bearer <token>',
      exito: false,
      codigo: 'TOKEN_FORMAT_INVALID'
    });
  }

  const token = partes[1];

  // ─────────────────────────────────────────────────
  // PASO 3: Verificar que JWT_SECRET esté configurado
  // Sin esta clave, no es posible verificar tokens
  // ─────────────────────────────────────────────────
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Middleware] JWT_SECRET no configurado');
    }
    return res.status(500).json({
      error: 'Error de configuración del servidor',
      exito: false,
      codigo: 'CONFIG_ERROR'
    });
  }

  // ─────────────────────────────────────────────────
  // PASO 4: Verificar y decodificar el token
  // jwt.verify() lanza excepción si el token es inválido
  // ─────────────────────────────────────────────────
  try {
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);

    // ─────────────────────────────────────────────────
    // PASO 5: Adjuntar datos del usuario al request
    // Esto permite que los controladores accedan a req.usuario
    // sin necesidad de decodificar el token nuevamente
    // ─────────────────────────────────────────────────
    req.usuario = datosUsuario;

    // ─────────────────────────────────────────────────
    // PASO 6: Continuar con el siguiente middleware/controlador
    // ─────────────────────────────────────────────────
    next();

  } catch (error) {
    // ─────────────────────────────────────────────────
    // MANEJO DE ERRORES DE TOKEN
    // Diferentes tipos de error requieren diferentes respuestas
    // ─────────────────────────────────────────────────

    // Token expirado: el usuario debe volver a iniciar sesión
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
        exito: false,
        codigo: 'TOKEN_EXPIRED'
      });
    }

    // Token malformado o firma inválida
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido. Por favor, inicie sesión nuevamente.',
        exito: false,
        codigo: 'TOKEN_INVALID'
      });
    }

    // Cualquier otro error de verificación
    return res.status(401).json({
      error: 'Error de autenticación',
      exito: false,
      codigo: 'AUTH_ERROR'
    });
  }
};

module.exports = verificarToken;

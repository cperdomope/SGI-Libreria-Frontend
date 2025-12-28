/**
 * =====================================================
 * MIDDLEWARE DE VERIFICACIÓN DE ROLES (RBAC)
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Este middleware implementa Control de Acceso Basado en Roles (RBAC).
 * Verifica que el usuario autenticado tenga los permisos necesarios para
 * acceder a recursos protegidos según su rol asignado.
 *
 * @requires verificarToken - Debe ejecutarse ANTES de este middleware
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

// =====================================================
// DEFINICIÓN DE ROLES DEL SISTEMA
// =====================================================

/**
 * Constantes que mapean los roles del sistema con sus IDs en la base de datos.
 * Estos valores deben coincidir con la tabla mdc_roles.
 *
 * @constant {Object} ROLES
 * @property {number} ADMINISTRADOR - ID 1: Acceso total al sistema
 * @property {number} VENDEDOR - ID 2: Acceso limitado (solo ventas y consultas)
 */
const ROLES = {
  ADMINISTRADOR: 1,
  VENDEDOR: 2
};

// =====================================================
// MIDDLEWARE PRINCIPAL
// =====================================================

/**
 * Crea un middleware que verifica si el usuario tiene uno de los roles permitidos.
 * Este es un patrón de "factory function" que permite configurar los roles dinámicamente.
 *
 * @function verificarRol
 * @param {number[]} rolesPermitidos - Array con los IDs de roles que pueden acceder
 * @returns {Function} Middleware de Express configurado
 *
 * @example
 * // Restringir a solo administradores
 * router.delete('/usuarios/:id',
 *   verificarToken,
 *   verificarRol([ROLES.ADMINISTRADOR]),
 *   controlador.eliminar
 * );
 *
 * @example
 * // Permitir a administradores y vendedores
 * router.get('/ventas',
 *   verificarToken,
 *   verificarRol([ROLES.ADMINISTRADOR, ROLES.VENDEDOR]),
 *   controlador.listar
 * );
 */
const verificarRol = (rolesPermitidos) => {
  /**
   * Middleware interno que ejecuta la verificación de roles.
   *
   * @param {Object} req - Objeto de solicitud Express (debe contener req.usuario)
   * @param {Object} res - Objeto de respuesta Express
   * @param {Function} next - Función para continuar la cadena
   */
  return (req, res, next) => {
    // ─────────────────────────────────────────────────
    // VALIDACIÓN 1: Verificar que el usuario esté autenticado
    // req.usuario es establecido por verificarToken, si no existe
    // significa que el middleware se usó incorrectamente
    // ─────────────────────────────────────────────────
    if (!req.usuario) {
      return res.status(401).json({
        error: 'No autenticado',
        mensaje: 'Debe iniciar sesión para acceder a este recurso',
        codigo: 'NOT_AUTHENTICATED'
      });
    }

    // ─────────────────────────────────────────────────
    // VALIDACIÓN 2: Verificar que el rol esté en la lista permitida
    // El rol viene del payload del token JWT (establecido en login)
    // ─────────────────────────────────────────────────
    const rolUsuario = req.usuario.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      // ─────────────────────────────────────────────────
      // LOG DE AUDITORÍA: Registrar intentos de acceso no autorizado
      // Solo en desarrollo para no saturar logs de producción
      // ─────────────────────────────────────────────────
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[RBAC] Acceso denegado - Usuario: ${req.usuario.id} ` +
          `(Rol: ${rolUsuario}) -> ${req.method} ${req.originalUrl}`
        );
      }

      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'No tiene permisos suficientes para realizar esta acción',
        codigo: 'FORBIDDEN'
      });
    }

    // ─────────────────────────────────────────────────
    // AUTORIZADO: El usuario tiene el rol adecuado
    // Continuar con el siguiente middleware/controlador
    // ─────────────────────────────────────────────────
    next();
  };
};

// =====================================================
// MIDDLEWARES PRE-CONFIGURADOS
// =====================================================
// Estos atajos simplifican el uso común en las rutas

/**
 * Middleware que solo permite acceso a Administradores.
 * Útil para operaciones críticas como eliminar usuarios o configuración.
 *
 * @example
 * router.delete('/usuarios/:id', verificarToken, soloAdministrador, eliminar);
 */
const soloAdministrador = verificarRol([ROLES.ADMINISTRADOR]);

/**
 * Middleware que permite acceso a Administradores y Vendedores.
 * Útil para operaciones generales del sistema.
 *
 * @example
 * router.get('/libros', verificarToken, administradorOVendedor, listar);
 */
const administradorOVendedor = verificarRol([ROLES.ADMINISTRADOR, ROLES.VENDEDOR]);

// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
  verificarRol,           // Factory function para roles personalizados
  soloAdministrador,      // Preset: solo admins
  administradorOVendedor, // Preset: admins y vendedores
  ROLES                   // Constantes de roles
};

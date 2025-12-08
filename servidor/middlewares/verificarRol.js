/**
 * Middleware de Verificación de Roles
 *
 * Valida que el usuario autenticado tenga el rol necesario para acceder a un endpoint.
 * Debe usarse DESPUÉS de verificarToken.js para asegurar que req.usuario existe.
 */

/**
 * Constantes de Roles
 * Estos IDs corresponden a la tabla 'roles' en la base de datos
 */
const ROLES = {
    ADMINISTRADOR: 1,
    VENDEDOR: 2
};

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 *
 * @param {Array<number>} rolesPermitidos - Array de IDs de roles que pueden acceder
 * @returns {Function} Middleware de Express
 *
 * @example
 * // Solo administradores
 * router.delete('/libros/:id', verificarToken, verificarRol([ROLES.ADMINISTRADOR]), eliminarLibro);
 *
 * @example
 * // Administradores o Vendedores
 * router.get('/ventas', verificarToken, verificarRol([ROLES.ADMINISTRADOR, ROLES.VENDEDOR]), obtenerVentas);
 */
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        // Verificar que req.usuario existe (debe haber pasado por verificarToken primero)
        if (!req.usuario) {
            return res.status(401).json({
                error: 'No autenticado',
                mensaje: 'Debe iniciar sesión para acceder a este recurso'
            });
        }

        // Obtener el rol del usuario desde el token JWT
        const rolUsuario = req.usuario.rol;

        // Validar que el rol del usuario esté en la lista de roles permitidos
        if (!rolesPermitidos.includes(rolUsuario)) {
            // Log para auditoría (opcional)
            console.warn(`[ACCESO DENEGADO] Usuario ID ${req.usuario.id} (Rol ${rolUsuario}) intentó acceder a recurso restringido: ${req.method} ${req.originalUrl}`);

            return res.status(403).json({
                error: 'Acceso denegado',
                mensaje: 'No tiene permisos suficientes para realizar esta acción'
            });
        }

        // El usuario tiene el rol adecuado, continuar
        next();
    };
};

/**
 * Middlewares pre-configurados para uso común
 */

// Solo Administradores
const soloAdministrador = verificarRol([ROLES.ADMINISTRADOR]);

// Administradores y Vendedores
const administradorOVendedor = verificarRol([ROLES.ADMINISTRADOR, ROLES.VENDEDOR]);

module.exports = {
    verificarRol,
    soloAdministrador,
    administradorOVendedor,
    ROLES
};

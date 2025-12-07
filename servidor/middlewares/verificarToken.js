const jwt = require('jsonwebtoken');

/**
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * Verifica que el token JWT sea válido antes de permitir acceso a rutas protegidas
 *
 * Uso: router.get('/ruta-protegida', verificarToken, controlador.funcion)
 */
const verificarToken = (req, res, next) => {
    // 1. Extraer el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: 'Token no proporcionado',
            exito: false
        });
    }

    // 2. El formato esperado es: "Bearer TOKEN_AQUI"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Formato de token inválido',
            exito: false
        });
    }

    // 3. Verificar que el token sea válido
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Agregar la información del usuario al request para que los controladores la usen
        req.usuario = decoded;

        // 5. Continuar con el siguiente middleware/controlador
        next();

    } catch (error) {
        // Token expirado, malformado o inválido
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                error: 'Token expirado',
                exito: false
            });
        }

        return res.status(403).json({
            error: 'Token inválido',
            exito: false
        });
    }
};

module.exports = verificarToken;

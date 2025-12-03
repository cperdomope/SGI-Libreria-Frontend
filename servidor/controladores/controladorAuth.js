const db = require('../configuracion/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar si el email existe
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = usuarios[0];

        // 2. Comparar contraseña (La que envía el usuario VS la encriptada en BD)
        const passwordEsCorrecta = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordEsCorrecta) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // 3. Generar el Token (El "Carnet" de acceso)
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol_id, nombre: usuario.nombre_completo },
            'SECRETO_SENA_PROYECTO', // En producción esto iría en .env
            { expiresIn: '8h' } // La sesión dura 8 horas
        );

        // 4. Responder con los datos
        res.json({
            mensaje: 'Bienvenido al sistema',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
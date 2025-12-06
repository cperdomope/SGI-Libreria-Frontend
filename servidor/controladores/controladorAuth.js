// =====================================================
// CONTROLADOR DE AUTENTICACIÓN
// Sistema de Gestión de Inventario - Librería
// Proyecto SENA - AA5-EV01
// =====================================================
// Este módulo maneja el registro e inicio de sesión de usuarios
// utilizando bcrypt para encriptar contraseñas y JWT para tokens

const db = require('../configuracion/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =====================================================
// FUNCIÓN: REGISTRO DE USUARIO
// =====================================================
// Descripción: Registra un nuevo usuario en el sistema
// Método HTTP: POST
// Endpoint: /api/auth/registro
// Body (JSON): { nombre_completo, email, password, rol_id }
// =====================================================
exports.registro = async (req, res) => {
    // Extraer datos del cuerpo de la petición
    const { nombre_completo, email, password, rol_id } = req.body;

    try {
        // 1. VALIDACIÓN: Verificar que todos los campos estén presentes
        if (!nombre_completo || !email || !password || !rol_id) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios',
                campos_requeridos: ['nombre_completo', 'email', 'password', 'rol_id']
            });
        }

        // 2. VALIDACIÓN: Verificar si el email ya existe en la base de datos
        const [usuarioExistente] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(409).json({
                error: 'El correo electrónico ya está registrado'
            });
        }

        // 3. ENCRIPTACIÓN: Hash de la contraseña usando bcrypt
        // El número 10 representa el "salt rounds" (nivel de seguridad)
        const passwordEncriptada = await bcrypt.hash(password, 10);

        // 4. INSERCIÓN: Guardar el nuevo usuario en la base de datos
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre_completo, email, password_hash, rol_id, estado) VALUES (?, ?, ?, ?, 1)',
            [nombre_completo, email, passwordEncriptada, rol_id]
        );

        // 5. RESPUESTA EXITOSA: Confirmación del registro
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            exito: true,
            usuario: {
                id: resultado.insertId,
                nombre_completo,
                email,
                rol_id
            }
        });

    } catch (error) {
        // Manejo de errores del servidor
        console.error('Error en registro:', error);
        res.status(500).json({
            error: 'Error al registrar el usuario',
            detalles: error.message
        });
    }
};

// =====================================================
// FUNCIÓN: INICIO DE SESIÓN (LOGIN)
// =====================================================
// Descripción: Autentica un usuario y genera un token JWT
// Método HTTP: POST
// Endpoint: /api/auth/login
// Body (JSON): { email, password }
// =====================================================
exports.login = async (req, res) => {
    // Extraer credenciales del cuerpo de la petición
    const { email, password } = req.body;

    try {
        // 1. VALIDACIÓN: Verificar que email y password estén presentes
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son obligatorios'
            });
        }

        // 2. BÚSQUEDA: Buscar el usuario por email en la base de datos
        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        // Verificar si el usuario existe
        if (usuarios.length === 0) {
            return res.status(401).json({
                error: 'Credenciales incorrectas',
                exito: false
            });
        }

        const usuario = usuarios[0];

        // 3. VERIFICACIÓN: Verificar si el usuario está activo
        if (usuario.estado !== 1) {
            return res.status(403).json({
                error: 'Usuario inactivo. Contacte al administrador',
                exito: false
            });
        }

        // 4. COMPARACIÓN: Comparar la contraseña ingresada con el hash almacenado
        // bcrypt.compare() desencripta y compara de forma segura
        const passwordEsCorrecta = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordEsCorrecta) {
            return res.status(401).json({
                error: 'Credenciales incorrectas',
                exito: false
            });
        }

        // 5. GENERACIÓN DE TOKEN: Crear token JWT para la sesión
        // El token contiene información del usuario (payload)
        // Se firma con una clave secreta y tiene un tiempo de expiración
        const token = jwt.sign(
            {
                id: usuario.id,
                rol: usuario.rol_id,
                nombre: usuario.nombre_completo,
                email: usuario.email
            },
            process.env.JWT_SECRET || 'SECRETO_SENA_PROYECTO', // Clave secreta (debe estar en .env)
            { expiresIn: '8h' } // El token expira en 8 horas
        );

        // 6. RESPUESTA EXITOSA: Autenticación satisfactoria
        res.json({
            mensaje: 'Autenticación satisfactoria',
            exito: true,
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                email: usuario.email,
                rol_id: usuario.rol_id
            }
        });

    } catch (error) {
        // Manejo de errores del servidor
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error en la autenticación',
            exito: false,
            detalles: error.message
        });
    }
};
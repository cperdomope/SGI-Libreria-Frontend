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
// VALIDACIÓN CRÍTICA: JWT_SECRET DEBE EXISTIR
// =====================================================
if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET no está definido en las variables de entorno (.env)');
}

// =====================================================
// SISTEMA DE CONTROL DE INTENTOS FALLIDOS
// =====================================================
// Estructura en memoria para trackear intentos de login
// Formato: { email: { intentos: number, bloqueadoHasta: Date } }
const intentosLogin = new Map();

// Configuración de seguridad
const MAX_INTENTOS = 3;
const TIEMPO_BLOQUEO_MINUTOS = 3;

// Función para verificar si un usuario está bloqueado
const verificarBloqueo = (email) => {
    const registro = intentosLogin.get(email);

    if (!registro) {
        return { bloqueado: false };
    }

    // Si está bloqueado, verificar si ya pasó el tiempo de bloqueo
    if (registro.bloqueadoHasta && new Date() < registro.bloqueadoHasta) {
        const minutosRestantes = Math.ceil((registro.bloqueadoHasta - new Date()) / 60000);
        return {
            bloqueado: true,
            minutosRestantes
        };
    }

    // Si ya pasó el tiempo de bloqueo, limpiar el registro
    if (registro.bloqueadoHasta && new Date() >= registro.bloqueadoHasta) {
        intentosLogin.delete(email);
        return { bloqueado: false };
    }

    return { bloqueado: false };
};

// Función para registrar un intento fallido
const registrarIntentoFallido = (email) => {
    const registro = intentosLogin.get(email) || { intentos: 0, bloqueadoHasta: null };

    registro.intentos += 1;

    // Si alcanza el máximo de intentos, bloquear
    if (registro.intentos >= MAX_INTENTOS) {
        const bloqueadoHasta = new Date();
        bloqueadoHasta.setMinutes(bloqueadoHasta.getMinutes() + TIEMPO_BLOQUEO_MINUTOS);
        registro.bloqueadoHasta = bloqueadoHasta;
    }

    intentosLogin.set(email, registro);

    return {
        intentosRestantes: Math.max(0, MAX_INTENTOS - registro.intentos),
        bloqueado: registro.intentos >= MAX_INTENTOS
    };
};

// Función para limpiar intentos después de login exitoso
const limpiarIntentos = (email) => {
    intentosLogin.delete(email);
};

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
                error: 'Email y contraseña son obligatorios',
                exito: false
            });
        }

        // 2. VERIFICAR BLOQUEO: Comprobar si el usuario está bloqueado por intentos fallidos
        const estadoBloqueo = verificarBloqueo(email);
        if (estadoBloqueo.bloqueado) {
            return res.status(429).json({
                error: `Su cuenta ha sido bloqueada temporalmente por seguridad. Por favor, espere ${estadoBloqueo.minutosRestantes} minuto(s) antes de intentar nuevamente.`,
                exito: false,
                bloqueado: true,
                minutosRestantes: estadoBloqueo.minutosRestantes
            });
        }

        // 3. BÚSQUEDA: Buscar el usuario por email en la base de datos
        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        // Verificar si el usuario existe
        if (usuarios.length === 0) {
            // Registrar intento fallido
            const resultado = registrarIntentoFallido(email);

            return res.status(401).json({
                error: 'Credenciales incorrectas',
                exito: false,
                intentosRestantes: resultado.intentosRestantes,
                mensaje: resultado.bloqueado
                    ? `Su cuenta ha sido bloqueada por ${TIEMPO_BLOQUEO_MINUTOS} minutos por seguridad. Por favor, espere antes de intentar nuevamente.`
                    : `El correo electrónico o la contraseña son incorrectos. Tiene ${resultado.intentosRestantes} intento(s) restante(s).`
            });
        }

        const usuario = usuarios[0];

        // 4. VERIFICACIÓN: Verificar si el usuario está activo
        if (usuario.estado !== 1) {
            return res.status(403).json({
                error: 'Usuario inactivo. Contacte al administrador del sistema.',
                exito: false
            });
        }

        // 5. COMPARACIÓN: Comparar la contraseña ingresada con el hash almacenado
        // bcrypt.compare() desencripta y compara de forma segura
        const passwordEsCorrecta = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordEsCorrecta) {
            // Registrar intento fallido
            const resultado = registrarIntentoFallido(email);

            return res.status(401).json({
                error: 'Credenciales incorrectas',
                exito: false,
                intentosRestantes: resultado.intentosRestantes,
                mensaje: resultado.bloqueado
                    ? `Su cuenta ha sido bloqueada por ${TIEMPO_BLOQUEO_MINUTOS} minutos por seguridad. Por favor, espere antes de intentar nuevamente.`
                    : `El correo electrónico o la contraseña son incorrectos. Tiene ${resultado.intentosRestantes} intento(s) restante(s).`
            });
        }

        // 6. LOGIN EXITOSO: Limpiar intentos fallidos
        limpiarIntentos(email);

        // 7. GENERACIÓN DE TOKEN: Crear token JWT para la sesión
        // El token contiene información del usuario (payload)
        // Se firma con una clave secreta y tiene un tiempo de expiración
        const token = jwt.sign(
            {
                id: usuario.id,
                rol: usuario.rol_id,
                nombre: usuario.nombre_completo,
                email: usuario.email
            },
            process.env.JWT_SECRET, // Clave secreta (validada al inicio del módulo)
            { expiresIn: '8h' } // El token expira en 8 horas
        );

        // 8. RESPUESTA EXITOSA: Autenticación satisfactoria
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
            error: 'Error interno del servidor. Intente más tarde.',
            exito: false,
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
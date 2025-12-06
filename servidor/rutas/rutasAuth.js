// =====================================================
// RUTAS DE AUTENTICACIÓN
// Sistema de Gestión de Inventario - Librería
// Proyecto SENA - AA5-EV01
// =====================================================
// Este archivo define las rutas (endpoints) para el servicio web
// de autenticación: registro e inicio de sesión

const express = require('express');
const router = express.Router();
const controladorAuth = require('../controladores/controladorAuth');

// =====================================================
// RUTA: REGISTRO DE USUARIO
// =====================================================
// Método: POST
// URL: http://localhost:3000/api/auth/registro
// Descripción: Registra un nuevo usuario en el sistema
// Body (JSON): {
//   "nombre_completo": "Juan Pérez",
//   "email": "juan@email.com",
//   "password": "contraseña123",
//   "rol_id": 2
// }
// Respuesta exitosa (201): { mensaje, exito: true, usuario }
// Respuesta error (400/409/500): { error, detalles }
router.post('/registro', controladorAuth.registro);

// =====================================================
// RUTA: INICIO DE SESIÓN (LOGIN)
// =====================================================
// Método: POST
// URL: http://localhost:3000/api/auth/login
// Descripción: Autentica un usuario y retorna un token JWT
// Body (JSON): {
//   "email": "juan@email.com",
//   "password": "contraseña123"
// }
// Respuesta exitosa (200): {
//   mensaje: "Autenticación satisfactoria",
//   exito: true,
//   token: "eyJhbGciOiJIUzI1...",
//   usuario: { id, nombre, email, rol_id }
// }
// Respuesta error (401/403/500): {
//   error: "Credenciales incorrectas",
//   exito: false
// }
router.post('/login', controladorAuth.login);

// Exportar el router para usarlo en el servidor principal
module.exports = router;
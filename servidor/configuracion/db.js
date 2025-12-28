/**
 * =====================================================
 * CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Este módulo configura y exporta un pool de conexiones MySQL.
 * Adaptado para soportar conexiones seguras (SSL) requeridas por servicios Cloud (Aiven).
 *
 * @requires mysql2 - Driver MySQL con soporte para promesas
 * @requires dotenv - Para cargar variables de entorno
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.1.0 (Actualizado para Nube)
 */

const mysql = require('mysql2');
require('dotenv').config();

// =====================================================
// VALIDACIÓN DE VARIABLES DE ENTORNO
// =====================================================

/**
 * Variables requeridas para la conexión a la base de datos.
 * Se agrega DB_PORT como requerido para la conexión remota.
 */
const variablesRequeridas = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];

// Verificar que todas las variables estén definidas
const variablesFaltantes = variablesRequeridas.filter(
  variable => !process.env[variable]
);

if (variablesFaltantes.length > 0) {
  throw new Error(
    `FATAL: Variables de entorno faltantes: ${variablesFaltantes.join(', ')}. ` +
    'Verifica el archivo .env'
  );
}

// =====================================================
// CONFIGURACIÓN DEL POOL DE CONEXIONES
// =====================================================

/**
 * Configuración del pool de conexiones MySQL.
 * Se añade configuración de puerto explícito y SSL para Aiven.
 *
 * @type {Object} Configuración del pool
 */
const configuracionPool = {
  // ─────────────────────────────────────────────────
  // CREDENCIALES: Obtenidas de variables de entorno
  // ─────────────────────────────────────────────────
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // <--- IMPORTANTE: Puerto específico de la nube (15096)

  // ─────────────────────────────────────────────────
  // SEGURIDAD SSL (Requerido por Aiven)
  // ─────────────────────────────────────────────────
  ssl: {
      rejectUnauthorized: false // Permite conectar sin descargar certificados manuales
  },

  // ─────────────────────────────────────────────────
  // CODIFICACIÓN UTF-8 (Soporte para ñ, tildes, etc.)
  // ─────────────────────────────────────────────────
  charset: 'utf8mb4', // Charset completo con emojis

  // ─────────────────────────────────────────────────
  // CONFIGURACIÓN DEL POOL
  // ─────────────────────────────────────────────────
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  idleTimeout: 60000
};

// ─────────────────────────────────────────────────
// Crear el pool con la configuración definida
// ─────────────────────────────────────────────────
const pool = mysql.createPool(configuracionPool);

// =====================================================
// VERIFICACIÓN DE CONEXIÓN AL INICIAR
// =====================================================

pool.getConnection((error, conexion) => {
  if (error) {
    console.error('[DB] Error de conexión:', error.code);
    switch (error.code) {
      case 'PROTOCOL_CONNECTION_LOST':
        console.error('[DB] La conexión con la base de datos se perdió');
        break;
      case 'ER_CON_COUNT_ERROR':
        console.error('[DB] Demasiadas conexiones simultáneas');
        break;
      case 'ECONNREFUSED':
        console.error('[DB] Conexión rechazada. Verifica HOST y PUERTO (15096)');
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        console.error('[DB] Acceso denegado. Verifica usuario y contraseña');
        break;
      case 'ER_BAD_DB_ERROR':
        console.error('[DB] La base de datos no existe');
        break;
      case 'HANDSHAKE_SSL_ERROR': // Error común en la nube si falta SSL
        console.error('[DB] Error de SSL. Se requiere conexión segura.');
        break;
      default:
        console.error('[DB] Error desconocido:', error.message);
    }
    return;
  }

  // ─────────────────────────────────────────────────
  // CONEXIÓN EXITOSA
  // ─────────────────────────────────────────────────
  console.log('✅ [DB] Conexión exitosa a Aiven Cloud - BD:', process.env.DB_NAME);

  conexion.release();
});

// =====================================================
// MANEJO DE ERRORES DEL POOL
// =====================================================

pool.on('error', (error) => {
  console.error('[DB] Error en el pool de conexiones:', error.code);
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    console.warn('[DB] Intentando reconectar...');
  }
});

// =====================================================
// EXPORTACIÓN
// =====================================================

module.exports = pool.promise();
/**
 * =====================================================
 * SERVICIO API - CLIENTE HTTP
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Configura una instancia de Axios con interceptores
 * para manejar autenticación JWT automáticamente.
 *
 * @requires axios - Cliente HTTP
 *
 * CARACTERÍSTICAS:
 * - Añade token JWT a todas las peticiones automáticamente
 * - Maneja errores 401 (sesión expirada) globalmente
 * - URL base configurable vía variables de entorno
 *
 * CONFIGURACIÓN (.env):
 * - VITE_API_URL: URL del backend (default: http://localhost:3000/api)
 *
 * @example
 * import api from '../servicios/api';
 *
 * // GET request
 * const response = await api.get('/libros');
 *
 * // POST request
 * await api.post('/ventas', { cliente_id: 1, items: [...] });
 *
 * @author Equipo de Desarrollo SGI
 * @version 2.0.0
 */

import axios from 'axios';

// =====================================================
// CONFIGURACIÓN
// =====================================================

/**
 * Claves de localStorage para la sesión.
 * Deben coincidir con las usadas en AuthContext.
 *
 * @constant {Object}
 */
const STORAGE_KEYS = {
  TOKEN: 'token_sgi',
  USUARIO: 'usuario_sgi'
};

/**
 * Ruta a la que redirigir cuando la sesión expira.
 *
 * @constant {string}
 */
const RUTA_LOGIN = '/acceso';

// =====================================================
// INSTANCIA DE AXIOS
// =====================================================

/**
 * Instancia configurada de Axios para el backend.
 * Usa la URL de las variables de entorno o localhost por defecto.
 *
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 segundos máximo por petición
  headers: {
    'Content-Type': 'application/json'
  }
});

// =====================================================
// INTERCEPTOR DE PETICIONES
// =====================================================

/**
 * Interceptor que añade el token JWT a cada petición.
 * Se ejecuta ANTES de que la petición salga al servidor.
 *
 * FLUJO:
 * 1. Obtiene el token de localStorage
 * 2. Si existe, lo añade al header Authorization
 * 3. Continúa con la petición
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    // Añadir token solo si existe
    // Formato: "Bearer <token>" según estándar JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Error en la configuración de la petición
    return Promise.reject(error);
  }
);

// =====================================================
// INTERCEPTOR DE RESPUESTAS
// =====================================================

/**
 * Interceptor que maneja errores de respuesta globalmente.
 * Se ejecuta DESPUÉS de recibir respuesta del servidor.
 *
 * MANEJO DE ERRORES:
 * - 401 (No autorizado): Limpia sesión y redirige a login
 * - Otros errores: Los propaga para manejo local
 *
 * IMPORTANTE:
 * El error 401 indica que el token expiró o es inválido.
 * Forzamos logout para que el usuario inicie sesión nuevamente.
 */
api.interceptors.response.use(
  // Respuestas exitosas (2xx) pasan sin modificación
  (response) => response,

  // Manejo de errores
  (error) => {
    // Verificar si es error de autenticación
    if (error.response?.status === 401) {
      // Limpiar datos de sesión
      localStorage.removeItem(STORAGE_KEYS.USUARIO);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);

      // Redirigir a login
      // Usamos window.location para forzar reload completo
      window.location.href = RUTA_LOGIN;
    }

    // Propagar error para manejo específico en cada componente
    return Promise.reject(error);
  }
);

// =====================================================
// EXPORTACIÓN
// =====================================================

export default api;

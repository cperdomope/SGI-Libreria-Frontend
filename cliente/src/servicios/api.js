import axios from 'axios';

// Configuración de Axios para conectar con el Backend
// La URL base se obtiene de las variables de entorno (.env)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor para agregar el token JWT automáticamente a todas las peticiones
api.interceptors.request.use(
    (config) => {
        // Obtener el token de localStorage
        const token = localStorage.getItem('token_sgi');

        // Si existe el token, agregarlo al header Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta (opcional pero recomendado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor responde con 401 (no autenticado), limpiar sesión
        if (error.response?.status === 401) {
            localStorage.removeItem('usuario_sgi');
            localStorage.removeItem('token_sgi');
            window.location.href = '/acceso';
        }
        return Promise.reject(error);
    }
);

export default api;
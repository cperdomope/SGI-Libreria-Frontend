import axios from 'axios';

// Configuración de Axios para conectar con el Backend
const api = axios.create({
    baseURL: 'http://localhost:3000/api', 
});

export default api;
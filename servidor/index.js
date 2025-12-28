const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Base de Datos
require('./configuracion/db');

// Importar Rutas
const rutasLibros = require('./rutas/rutasLibros');
const rutasMovimientos = require('./rutas/rutasMovimientos');
const rutasDashboard = require('./rutas/rutasDashboard');
const rutasAuth = require('./rutas/rutasAuth');
const rutasClientes = require('./rutas/clienteRutas');
const rutasVentas = require('./rutas/ventaRutas');
const rutasProveedores = require('./rutas/proveedorRutas');
const rutasAutores = require('./rutas/autorRutas');
const rutasCategorias = require('./rutas/categoriaRutas');

const app = express();

// --- CONFIGURACIÓN DE CORS SEGURA ---
// Solo permite requests desde el origen especificado en .env
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // Permite envío de cookies y headers de autenticación
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware para forzar UTF-8 en todas las respuestas
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
// ---------------------------------------------------

// Usar Rutas (Ahora sí funcionarán porque ya se configuró JSON)
app.use('/api/ventas', rutasVentas);
app.use('/api/libros', rutasLibros);
app.use('/api/movimientos', rutasMovimientos);
app.use('/api/dashboard', rutasDashboard);
app.use('/api/auth', rutasAuth);
app.use('/api/clientes', rutasClientes);
app.use('/api/proveedores', rutasProveedores);
app.use('/api/autores', rutasAutores);
app.use('/api/categorias', rutasCategorias);

app.get('/', (req, res) => {
    res.send('API del Sistema de Inventario Funcionando 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
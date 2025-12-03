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

const app = express();

// --- CORRECCIÓN CRÍTICA: MIDDLEWARES AL PRINCIPIO ---
app.use(cors());
app.use(express.json()); 
// ---------------------------------------------------

// Usar Rutas (Ahora sí funcionarán porque ya se configuró JSON)
app.use('/api/ventas', rutasVentas);
app.use('/api/libros', rutasLibros);
app.use('/api/movimientos', rutasMovimientos);
app.use('/api/dashboard', rutasDashboard);
app.use('/api/auth', rutasAuth);
app.use('/api/clientes', rutasClientes);
app.use('/api/proveedores', rutasProveedores);

app.get('/', (req, res) => {
    res.send('API del Sistema de Inventario Funcionando 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
const express = require('express');
const router = express.Router();
const ventaControlador = require('../controladores/ventaControlador');
const verificarToken = require('../middlewares/verificarToken');
const { administradorOVendedor } = require('../middlewares/verificarRol');

// VENTAS: Administradores y Vendedores (función principal de vendedores)

// POST: Crear venta (Proceso transaccional) - Vendedores realizan ventas
router.post('/', verificarToken, administradorOVendedor, ventaControlador.crearVenta);

// GET: Listar ventas - Vendedores pueden ver historial
router.get('/', verificarToken, administradorOVendedor, ventaControlador.obtenerVentas);

// GET: Obtener detalle de una venta específica - Vendedores pueden ver detalles
router.get('/:id', verificarToken, administradorOVendedor, ventaControlador.obtenerDetalleVenta);

module.exports = router;
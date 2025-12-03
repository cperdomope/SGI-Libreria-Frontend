const express = require('express');
const router = express.Router();
const ventaControlador = require('../controladores/ventaControlador');

// POST: Crear venta (Proceso transaccional)
router.post('/', ventaControlador.crearVenta);

// GET: Listar ventas
router.get('/', ventaControlador.obtenerVentas);

// GET: Obtener detalle de una venta específica
router.get('/:id', ventaControlador.obtenerDetalleVenta);

module.exports = router;
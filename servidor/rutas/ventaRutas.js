const express = require('express');
const router = express.Router();
const ventaControlador = require('../controladores/ventaControlador');
const verificarToken = require('../middlewares/verificarToken');

// POST: Crear venta (Proceso transaccional)
router.post('/', verificarToken, ventaControlador.crearVenta);

// GET: Listar ventas
router.get('/', verificarToken, ventaControlador.obtenerVentas);

// GET: Obtener detalle de una venta específica
router.get('/:id', verificarToken, ventaControlador.obtenerDetalleVenta);

module.exports = router;